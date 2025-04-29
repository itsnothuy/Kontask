# README: Full Setup & Testing

## 1. Overview

This server is a **FastAPI** application that uses:

- **PostgreSQL** (for storing users, services, posts, etc.).  
- **MongoDB** (for storing PDF chunk embeddings in a vector form).  
- **OpenAI** (for LLM-based query rewriting, decomposition, routing, re-ranking, and structured output).

### Key Features

1. **User Accounts** (Customers & Suppliers).  
2. **Supplier Flow**:  
   - Sign up with `is_supplier=true`.  
   - Upload a PDF resume → chunk & embed in Mongo → auto-detect roles with OpenAI → store roles in Postgres (`Service` + `SupplierService`).  
3. **Customer Flow**:  
   - Log in or sign up with `is_supplier=false`.  
   - Call **search** endpoints to find suppliers. 
   - If direct matches → display them (with or without LLM re-ranking). 
   - If none → fallback to an open “Post” that suppliers can bid on.  
   - The user eventually picks a bid, creates an appointment, pays, reviews, etc.

---

## 2. Prerequisites & Installation

### 2.1 Environment Variables

Create a **`.env`** file with:

```
DATABASE_URL=postgresql://<USER>:<PASS>@localhost:5432/<DBNAME>
MONGO_URI=mongodb://localhost:27017
OPENAI_API_KEY=<your key here>
```

If you’re using Docker or Docker Compose for Postgres or Mongo, adjust accordingly.

### 2.2 Python Environment

1. Create a Python 3.9+ environment (conda, venv, etc.).  
2. `pip install -r requirements.txt` (which should include fastapi, uvicorn, sqlalchemy, psycopg2-binary, passlib, pymongo, openai, pydantic, sentence-transformers, PyMuPDF, etc.).  

### 2.3 Database Setup

- For **Postgres**: create a database that matches `DATABASE_URL`.  
- For **Mongo**: if local, ensure it’s running on `27017`. If using Atlas, update `MONGO_URI`.

### 2.4 Create Tables

When the server starts, it calls:
```python
models.Base.metadata.create_all(bind=engine)
```
which creates tables in Postgres if they don’t exist.

---

## 3. Project Structure

```
my_project/
  ├── database.py
  ├── models.py
  ├── schemas.py
  ├── repository.py
  ├── utils.py
  ├── server.py
  ├── pipeline/
  │    ├── log_util.py
  │    ├── chunking_utils.py
  │    ├── embedding_utils.py
  │    ├── structured_output.py
  │    ├── enhanced_rag_pipeline.py
  ├── requirements.txt
  ├── .env
  └── ...
```

**Key files**:

- **`database.py`** – Connects to Postgres.  
- **`models.py`** – SQLAlchemy models for `User`, `Post`, `Bid`, `Service`, `SupplierService`, etc.  
- **`schemas.py`** – Pydantic models for request/response.  
- **`repository.py`** – CRUD for users, posts, bids, services, etc.  
- **`server.py`** – The main FastAPI app. Defines routes.  
- **`pipeline/`** – Contains all the advanced RAG logic:
  - **`enhanced_rag_pipeline.py`** – The class that orchestrates multi-query generation, query decomposition, routing, re-ranking, structured output.  
  - **`chunking_utils.py`** – PDF chunk reading.  
  - **`embedding_utils.py`** – SentenceTransformer loading.  
  - **`structured_output.py`** – Summaries from GPT in a structured manner.  
  - **`log_util.py`** – Logging functions.

---

## 4. Starting the Server

```bash
uvicorn server:app --reload
```

- The server runs on `http://127.0.0.1:8000`.  
- Use `http://127.0.0.1:8000/docs` to see interactive Swagger docs.

---

## 5. Testing Step-by-Step: **Supplier Flow**

### 5.1 Sign Up as Supplier

```bash
curl -X POST "http://localhost:8000/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "BobSupplier",
    "password": "bobpw",
    "email": "bob@example.com",
    "is_supplier": true,
    "is_verified": false
  }'
```
- You’ll get back JSON with `"id": "<supplier_uuid>"`.

### 5.2 Upload PDF Resume

```bash
curl -X POST "http://localhost:8000/suppliers/<supplier_uuid>/upload_pdf" \
  -F "file=@plumber_resume.pdf"
```

- The server **chunks** the PDF → **embeds** in Mongo → **detects** roles (like “plumber”) with OpenAI → **stores** them in `Service` + `SupplierService` in Postgres.  
- The response: 
  ```json
  {
    "detail": "PDF uploaded & embedded",
    "supplier_id": "...",
    "info": "Ingested X chunks, detected roles: ['plumber', 'pipe installation', ...]"
  }
  ```

### 5.3 Confirm Roles

You can confirm in Postgres that `services` has a new row with e.g. “plumber,” and `supplier_services` has a row linking the supplier’s ID to that service.

---

## 6. Testing Step-by-Step: **Customer Flow**

### 6.1 Customer Sign Up

```bash
curl -X POST "http://localhost:8000/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Alice",
    "password": "alicepw",
    "email": "alice@example.com",
    "is_supplier": false
  }'
```
You get `"id": "<customer_uuid>"`.

### 6.2 Advanced Search (with LLM-based Decomposition, Multi-Query, Routing, Re-Rank)

We have an endpoint (e.g. `/search_for_supplier` or `/search_advanced`) that calls `EnhancedRAGPipeline.advanced_search(...)`. Example:

```bash
curl -X POST "http://localhost:8000/search_for_supplier" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Need a plumber for my sink",
    "requester_id": "<customer_uuid>"
  }'
```

**Possible outcomes**:
1. **Direct matches** found – you’ll get a `results` array containing chunk docs from suppliers that match. Each doc has `supplier_id`, `score`, `chunk_text`. The pipeline also does LLM-based re-ranking, so the top docs are presumably the best. The response might also contain a `structured_summary` from GPT explaining “why” these were chosen.
2. **No direct matches** – the endpoint creates an **open post** with `status="open"`. Then you can do `GET /posts/open` or `GET /posts/{post_id}` to see it. Suppliers can then place **bids** on that post.

### 6.3 Supplier Bids (If No Direct Match)

If the server responded with `"post_id": "abc123..."`, the supplier can do:

```bash
curl -X POST "http://localhost:8000/bids/" \
  -H "Content-Type: application/json" \
  -d '{
    "post_id": "abc123",
    "supplier_id": "bob_supplier_id",
    "price": 100,
    "message": "I can fix your sink fast!",
    "status": "pending"
  }'
```
Then the customer sees them with:
```bash
curl -X GET "http://localhost:8000/posts/abc123/bids"
```
The user picks one with:
```bash
curl -X POST "http://localhost:8000/bids/<bid_id>/accept"
```

### 6.4 Appointments & Payment

Now that the user has a chosen supplier:

1. **Create appointment**:
   ```bash
   curl -X POST "http://localhost:8000/appointments/" \
     -H "Content-Type: application/json" \
     -d '{
       "post_id": "abc123",
       "supplier_id": "<supplier_id>",
       "customer_id": "<customer_id>",
       "appointment_time": "2025-03-10T09:00:00"
     }'
   ```
2. **Transaction**:
   ```bash
   curl -X POST "http://localhost:8000/transactions/" \
     -H "Content-Type: application/json" \
     -d '{
       "post_id": "abc123",
       "supplier_id": "<supplier_id>",
       "customer_id": "<customer_id>",
       "amount": 75.0
     }'
   ```

### 6.5 Review

Finally:
```bash
curl -X POST "http://localhost:8000/reviews/" \
  -H "Content-Type: application/json" \
  -d '{
    "post_id": "abc123",
    "supplier_id": "<supplier_id>",
    "customer_id": "<customer_id>",
    "rating": 5,
    "review": "Great plumber!"
  }'
```
Now the supplier accumulates an average rating, which influences future searches.

---

## 7. Common Pitfalls

1. **Local Mongo** might **not** support `$vectorSearch`. If you see zero results no matter what, confirm you use **MongoDB Atlas** with a vector index named `"resume_chunks_index"`, or switch to a local code path that does manual cosine similarity.  
2. **OpenAI** model naming – We used `"gpt-3.5-turbo-0125"`. If that model is unavailable, change to `"gpt-3.5-turbo"` or an updated release.  
3. **Log** output: we rely on `pipeline/log_util.py`. If you’re not seeing logs, check your Python logging config.  
4. **User** vs. **supplier** usage – if you try to upload a PDF as a non-supplier, the server will 400 error.

---

## 8. Conclusion

By following these steps, you can:

1. Spin up Postgres & Mongo.  
2. Launch the server via `uvicorn server:app --reload`.  
3. Test the **supplier** flow with PDF ingestion → role detection → stored in Postgres.  
4. Test the **customer** flow with advanced LLM-based searching → direct matches or fallback open post → bids → acceptance → appointment → transaction → review.

This code merges:

- **LLM-based decomposition & rephrasing** – for more robust search coverage.  
- **LLM-based routing** – picks the likely role from the “services” table.  
- **LLM-based re-ranking** – sorts chunk docs by GPT.  
- **Structured output** – explains “why” certain matches appear.  

Use the cURL commands (or an API client like Postman) to confirm each step works from start to finish. If anything fails, check your logs from `pipeline/log_util.py` or reference `uvicorn` output for a stack trace.  

**Enjoy** your end-to-end RAG system with advanced user-supplier matching!
