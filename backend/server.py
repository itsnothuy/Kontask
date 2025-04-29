from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pipeline.supplier_pdf_ingestion import ingest_supplier_pdf, ingest_supplier_pdf_with_summary


import repository, schemas
from schemas import SearchRequest
from database import SessionLocal, Base, engine

# Create the tables in the database
Base.metadata.create_all(bind=engine)

# Create the FastAPI app
app = FastAPI()

# MONGO_URI, OPENAI_API_KEY from .env
from dotenv import load_dotenv
import os
from pipeline.enhance_rag_pipeline import EnhancedRAGPipeline
from pipeline.log_util import log_info, log_event
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# We pass a "db_session_factory" -> a function that returns a fresh DB session
def db_session_factory():
    return SessionLocal()

# Create the advanced pipeline
rag_pipeline = EnhancedRAGPipeline(
    mongo_uri=MONGO_URI,
    openai_api_key=OPENAI_API_KEY,
    db_session_factory=db_session_factory
)
# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ------------------------
# Users Endpoints
# ------------------------
@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user.
    """
    return repository.create_user(db=db, user=user)

@app.post("/login", response_model=schemas.User)
def login(login_request: schemas.UserLogin, db: Session = Depends(get_db)):
    """
    Login endpoint for user authentication.
    """
    user = repository.login_user(db=db, username=login_request.username, password=login_request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user

@app.get("/users/{user_id}", response_model=schemas.User)
def get_user(user_id: str, db: Session = Depends(get_db)):
    """
    Retrieve a user by ID.
    """
    db_user = repository.get_user(db=db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

# ------------------------
# Suppliers Endpoints
# ------------------------
@app.post("/suppliers/{supplier_id}/upload_pdf")
def upload_pdf_for_supplier(
    supplier_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    1) Save PDF locally
    2) Ingest -> chunk + embed in Mongo + auto-detect roles + store in Postgres
    """
    # Check if supplier exists
    sup = repository.get_user(db, supplier_id)
    if not sup or not sup.is_supplier:
        raise HTTPException(400, "User is not a supplier")

    temp_path = f"/tmp/{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(file.file.read())

    # Call advanced ingestion
    msg = ingest_supplier_pdf(
        db=db,
        pipeline=rag_pipeline,
        pdf_path=temp_path,
        supplier_id=supplier_id,
        openai_api_key=OPENAI_API_KEY
    )

    return {"detail": "PDF uploaded & embedded", "supplier_id": supplier_id, "info": msg}

@app.post("/suppliers/{supplier_id}/upload_pdf_summary")
def upload_pdf_summary_for_supplier(
    supplier_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Save the file temporarily.
    temp_path = f"/tmp/{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(file.file.read())
    
    # Call the ingestion function that produces a summary (no Postgres updates)
    result = ingest_supplier_pdf_with_summary(
        pdf_path=temp_path,
        supplier_id=supplier_id,
        openai_api_key=OPENAI_API_KEY,
        pipeline=rag_pipeline
    )
    return result
# ---------- Search for Supplier (AI-Assisted) ----------
@app.post("/search_for_supplier")
def search_for_supplier(
    payload: SearchRequest,
    db: Session = Depends(get_db)
):
    """
    1) do a vector search in Mongo
    2) if no match => create an open post
    3) if match => return them sorted
    """
    query = payload.query
    requester_id = payload.requester_id
     # 1) advanced pipeline search
    chunk_matches = rag_pipeline.advanced_search(user_query=query, top_k=5)
    if not chunk_matches:
        # no direct match => fallback open post
        new_post_data = schemas.PostCreate(
            title=f"Request from advanced search: {query[:30]}",
            description=query,
            category="general",
            status="open",
            requester_id=requester_id
        )
        new_post = repository.create_post(db, new_post_data)
        return {
            "results": [],
            "summary": "No direct matches found. Created an open request.",
            "post_id": new_post.id
        }

    # 2) build final results
    # chunk_matches is a list of e.g. {"supplier_id":..., "chunk_text":..., "score":...}
    results_list = []
    for m in chunk_matches:
        if "supplier_id" not in m:
            # Skip documents without a supplier_id
            print("DEBUG: Document missing supplier_id:", m)
            continue
        sp_id = m["supplier_id"]
        sp_user = repository.get_user(db, sp_id)
        if not sp_user:
            continue
        rating = repository.get_supplier_avg_rating(db, sp_id)
        
        # 2.5) For doc-level summary, pass [match_doc] to get_structured_summary
        # so it only uses that single chunk doc as 'context' for GPT:
        doc_summary = rag_pipeline.get_structured_summary(query, [m])  # pass a list of 1 doc

        results_list.append({
            "supplier_id": sp_id,
            "username": sp_user.username,
            "score": m["score"],
            "rating": rating,
            # "chunk_text": m["chunk_text"]
            "structured_summary": doc_summary
        })
    
    print("DEBUG: Final supplier matches amount:", len(results_list))
    # 3) Optionally call structured summary 
    #    We'll do a single summary for all top docs        
    print("DEBUG: Final supplier matches:", results_list)

    
    return {
        "results": results_list,
        "report": "Found matches for the query."
    }

@app.put("/suppliers/{supplier_id}/profile")
def update_user_profile_endpoint(
    supplier_id: str,
    payload: dict = Body(...),
    db: Session = Depends(get_db)
):
    """
    Expects JSON like:
    {
      "businessName": "...",
      "pdfSummary": "...",
      "skills": ["react", "nodejs", "communication"]
      "role": "accountant"  # or an array of roles

    }
    """
    business_name = payload.get("businessName")
    pdf_summary = payload.get("pdfSummary")
    skills = payload.get("skills")  # e.g. list of strings
    role = payload.get("role")      # single string or array
    print(role)

    user = repository.update_user_profile(
        db=db,
        user_id=supplier_id,
        business_name=business_name,
        pdf_summary=pdf_summary,
        skills=skills
    )
    if role:
        # If you want to handle multiple roles, you could do:
        # for r in (role if isinstance(role, list) else [role]):
        #     store_and_link_service(db, supplier_id, r)
        # else for single:
        repository.store_and_link_service(db, supplier_id, role)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ------------------------
# Posts Endpoints
# ------------------------
@app.post("/posts/", response_model=schemas.Post)
def create_post(post: schemas.PostCreate, db: Session = Depends(get_db)):
    """
    Create a new post.
    """
    return repository.create_post(db=db, post=post)

@app.get("/posts/{post_id}", response_model=schemas.Post)
def get_post(post_id: str, db: Session = Depends(get_db)):
    """
    Retrieve a post by ID.
    """
    db_post = repository.get_post(db=db, post_id=post_id)
    if db_post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    return db_post

@app.get("/posts/user/{requester_id}", response_model=list[schemas.Post])
def get_posts(requester_id: str, db: Session = Depends(get_db)):
    """
    Retrieve posts by requester_id.
    """
    db_posts = repository.get_posts(db=db, requester_id=requester_id)
    return db_posts

# ------------------------
# Bids Endpoints
# ------------------------
@app.post("/bids/", response_model=schemas.Bid)
def create_bid(bid: schemas.BidCreate, db: Session = Depends(get_db)):
    """
    Create a new bid.
    """
    return repository.create_bid(db=db, bid=bid)

@app.get("/bids/{bid_id}", response_model=schemas.Bid)
def get_bid(bid_id: str, db: Session = Depends(get_db)):
    """
    Retrieve a bid by ID.
    """
    db_bid = repository.get_bid(db=db, bid_id=bid_id)
    if db_bid is None:
        raise HTTPException(status_code=404, detail="Bid not found")
    return db_bid

@app.post("/bids/", response_model=schemas.Bid)
def create_bid(bid_data: schemas.BidCreate, db: Session = Depends(get_db)):
    return repository.create_bid(db, bid_data)

@app.get("/posts/{post_id}/bids")
def list_bids_for_post(post_id: str, db: Session = Depends(get_db)):
    post_obj = repository.get_post(db, post_id)
    if not post_obj:
        raise HTTPException(404, "Post not found")
    bids = repository.list_bids_for_post(db, post_id)
    results = []
    for b in bids:
        sup_rating = repository.get_supplier_avg_rating(db, b.supplier_id)
        sup_user = repository.get_user(db, b.supplier_id)
        results.append({
            "bid_id": b.id,
            "supplier_id": b.supplier_id,
            "supplier_name": sup_user.username if sup_user else None,
            "supplier_rating": sup_rating,
            "price": str(b.price),
            "message": b.message,
            "status": b.status
        })
    # Sort verified first, then rating desc
    results_sorted = sorted(results, key=lambda x: (-(1 if repository.get_user(db, x["supplier_id"]).is_verified else 0), -x["supplier_rating"]))
    return results_sorted

@app.post("/bids/{bid_id}/accept")
def accept_bid(bid_id: str, db: Session = Depends(get_db)):
    b = repository.get_bid(db, bid_id)
    if not b:
        raise HTTPException(404, "Bid not found")
    b.status = "accepted"
    db.commit()
    db.refresh(b)
    post_obj = repository.get_post(db, b.post_id)
    if post_obj:
        post_obj.status = "accepted"
        db.commit()
    return {
        "detail": "Bid accepted",
        "bid_id": bid_id,
        "post_id": post_obj.id if post_obj else None
    }

# ------------------------
# Messages Endpoints
# ------------------------
@app.post("/messages/", response_model=schemas.Message)
def create_message(message: schemas.MessageCreate, db: Session = Depends(get_db)):
    """
    Create a new message.
    """
    return repository.create_message(db=db, message=message)

@app.get("/messages/{message_id}", response_model=schemas.Message)
def get_message(message_id: str, db: Session = Depends(get_db)):
    """
    Retrieve a message by ID.
    """
    db_message = repository.get_message(db=db, message_id=message_id)
    if db_message is None:
        raise HTTPException(status_code=404, detail="Message not found")
    return db_message

# ------------------------
# Reviews Endpoints
# ------------------------
@app.post("/reviews/", response_model=schemas.Review)
def create_review(review: schemas.ReviewCreate, db: Session = Depends(get_db)):
    """
    Create a new review.
    """
    return repository.create_review(db=db, review=review)

@app.get("/reviews/{review_id}", response_model=schemas.Review)
def get_review(review_id: str, db: Session = Depends(get_db)):
    """
    Retrieve a review by ID.
    """
    db_review = repository.get_review(db=db, review_id=review_id)
    if db_review is None:
        raise HTTPException(status_code=404, detail="Review not found")
    return db_review

# ------------------------
# Services Endpoints
# ------------------------
@app.post("/services/", response_model=schemas.Service)
def create_service(service: schemas.ServiceCreate, db: Session = Depends(get_db)):
    """
    Create a new service.
    """
    return repository.create_service(db=db, service=service)

@app.get("/services/{service_id}", response_model=schemas.Service)
def get_service(service_id: str, db: Session = Depends(get_db)):
    """
    Retrieve a service by ID.
    """
    db_service = repository.get_service(db=db, service_id=service_id)
    if db_service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    return db_service

# ------------------------
# Supplier Services (Association) Endpoint
# ------------------------
@app.post("/supplier_services/")
def add_supplier_service(supplier_id: str, service_id: str, db: Session = Depends(get_db)):
    """
    Associate a supplier with a service.
    """
    return repository.add_supplier_service(db=db, supplier_id=supplier_id, service_id=service_id)

# ------------------------
# Transactions Endpoints
# ------------------------
@app.post("/transactions/", response_model=schemas.Transaction)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    """
    Create a new transaction.
    """
    return repository.create_transaction(db=db, transaction=transaction)

@app.get("/transactions/{transaction_id}", response_model=schemas.Transaction)
def get_transaction(transaction_id: str, db: Session = Depends(get_db)):
    """
    Retrieve a transaction by ID.
    """
    db_transaction = repository.get_transaction(db=db, transaction_id=transaction_id)
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return db_transaction

# ------------------------
# Appointments Endpoints
# ------------------------
@app.post("/appointments/", response_model=schemas.Appointment)
def create_appointment(appointment: schemas.AppointmentCreate, db: Session = Depends(get_db)):
    """
    Create a new appointment.
    """
    return repository.create_appointment(db=db, appointment=appointment)

@app.get("/appointments/{appointment_id}", response_model=schemas.Appointment)
def get_appointment(appointment_id: str, db: Session = Depends(get_db)):
    """
    Retrieve an appointment by ID.
    """
    db_appointment = repository.get_appointment(db=db, appointment_id=appointment_id)
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return db_appointment


# ------------------------
# Supplier Availability Endpoints
# ------------------------
@app.post("/suppliers/{supplier_id}/availability")
def set_supplier_availability_endpoint(
    supplier_id: str,
    slots: list[schemas.Availability],
    db: Session = Depends(get_db)
):
    """
    Endpoint to replace the supplier's availability with the new list of slots.
    """
    return repository.set_supplier_availability(db, supplier_id, slots)
