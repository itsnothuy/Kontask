# pipeline/supplier_pdf_ingestion.py
import os
import openai
import re
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from .chunking_utils import read_and_chunk_pdf_adaptive
from .embedding_utils import batch_embed_texts
import repository, schemas
from .roles import KNOWN_ROLES  # import the list

# def detect_roles_from_text(text_snippet: str, openai_api_key: str, num_roles=3) -> List[str]:
#     """
#     Use OpenAI to guess up to 'num_roles' possible roles from the text.
#     E.g. ["plumber", "electrician"].
#     """
#     if not openai_api_key:
#         return []

#     prompt = f"""
#     The following text is from a resume or profile.
#     Identify up to {num_roles} distinct professional roles or services the candidate can offer.
#     Return them as a comma-separated list, all lowercase, short single words/phrases.
#     If unsure, guess the best you can.

#     Text snippet:
#     \"\"\"{text_snippet[:3000]}\"\"\"
#     """

#     try:
#         openai.api_key = openai_api_key
#         client = openai.Client(api_key=openai_api_key)
#         resp = client.chat.completions.create(
#             model="gpt-3.5-turbo",
#             messages=[
#                 {"role": "system", "content": "You are a helpful assistant."},
#                 {"role": "user", "content": prompt},
#             ],
#             temperature=0.0
#         )
#         content = resp.choices[0].message.content.strip()
#         # Now parse comma-separated roles
#         roles = [r.strip().lower() for r in content.split(",") if r.strip()]
#         return roles
#     except Exception as e:
#         print("Error detecting roles with OpenAI:", e)
#         return []

# Huy's version

def detect_roles_from_text(text_snippet: str, openai_api_key: str, num_roles=3) -> List[str]:
    """
    Use OpenAI to guess up to 'num_roles' possible roles from the text.
    Only returns roles that appear in the known roles list (KNOWN_ROLES).
    """
    if not openai_api_key:
        return []

    prompt = f"""
    The following text is from a resume or profile.
    Identify up to {num_roles} distinct professional roles or services that the candidate can offer.
    From the following list of known roles, choose those that best match:
    {", ".join(KNOWN_ROLES)}
    Return your answer as a comma-separated list, in lowercase.
    
    Text snippet:
    \"\"\"{text_snippet[:3000]}\"\"\"
    """
    try:
        openai.api_key = openai_api_key
        client = openai.Client(api_key=openai_api_key)
        resp = client.chat.completions.create(
            model="gpt-3.5-turbo",  # stable model name
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.0
        )
        content = resp.choices[0].message.content.strip()
        roles = [r.strip().lower() for r in content.split(",") if r.strip()]
        # Filter: only keep roles that match one of the known roles (case-insensitive)
        valid_roles = []
        for role in roles:
            for known in KNOWN_ROLES:
                if role in known.lower():
                    valid_roles.append(known)
                    break
        return valid_roles
    except Exception as e:
        print("Error detecting roles with OpenAI:", e)
        return []


def ingest_supplier_pdf(
    db: Session,             # so we can store services in Postgres
    pipeline,               # RAGPipeline instance (for embeddings, collection)
    pdf_path: str,
    supplier_id: str,
    openai_api_key: str
):
    """
    1) Read & chunk PDF
    2) Embed in vector DB
    3) Use OpenAI to guess multiple roles -> store in Services & link in SupplierServices
    """
    # Step A: chunk PDF
    chunks = read_and_chunk_pdf_adaptive(pdf_path, max_words=150)
    print("DEBUG: Extracted chunks:", chunks)
    if not chunks:
        return "No text found"

    # Step B: remove old docs from the vector DB for that supplier
    pipeline.collection.delete_many({"supplier_id": supplier_id})

    # Step C: embed & store in vector DB
    embs = batch_embed_texts(pipeline.embedding_model, chunks, batch_size=16)
    docs_to_insert = []
    for i, chunk_text in enumerate(chunks):
        docs_to_insert.append({
            "supplier_id": supplier_id,
            "chunk_text": chunk_text,
            "embedding": embs[i].tolist()
        })
    if docs_to_insert:
        pipeline.collection.insert_many(docs_to_insert)

    # Step D: combine chunk text into a snippet for role detection
    combined_text = " ".join(chunks[:3])  # just first 3 chunks
    print("DEBUG: Combined text for role detection:", combined_text)
    roles_detected = detect_roles_from_text(combined_text, openai_api_key, num_roles=5)

    # Step E: store each role in Postgres & link to supplier
    for role in roles_detected:
        svc = repository.get_service_by_name(db, role)
        if not svc:
            # create new service
            svc_create = schemas.ServiceCreate(name=role, description="")
            svc = repository.create_service(db, svc_create)
        # link
        repository.link_supplier_service(db, supplier_id, svc.id)

    return f"Ingested {len(docs_to_insert)} chunks, detected roles: {roles_detected}"

def detect_skills_from_text(text_snippet: str, openai_api_key: str, num_skills: int = 5) -> List[str]:
    """
    Use OpenAI to extract up to 'num_skills' key skills from the provided text snippet.
    The function prompts the LLM to return a comma-separated list of skills (in lowercase)
    that best represent the candidate's capabilities (technical, soft, or language skills).
    
    Args:
        text_snippet (str): A snippet of text (e.g. from a resume) from which to extract skills.
        openai_api_key (str): Your OpenAI API key.
        num_skills (int): Maximum number of skills to return.
        
    Returns:
        List[str]: A list of detected skills. If none are found or an error occurs, returns an empty list.
    """
    if not openai_api_key:
        return []

    prompt = f"""
    The following text is from a resume or profile.
    Identify up to {num_skills} key skills (both technical and soft skills) that the candidate possesses.
    Return your answer as a comma-separated list in lowercase.
    
    Text snippet:
    \"\"\"{text_snippet[:3000]}\"\"\"
    """
    try:
        import openai
        openai.api_key = openai_api_key
        client = openai.Client(api_key=openai_api_key)
        resp = client.chat.completions.create(
            model="gpt-3.5-turbo",  # using a stable model name
            messages=[
                {"role": "system", "content": "You are an assistant that extracts key skills from text."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.0
        )
        content = resp.choices[0].message.content.strip()
        skills = [s.strip().lower() for s in content.split(",") if s.strip()]
        return skills
    except Exception as e:
        print("Error detecting skills with OpenAI:", e)
        return []

def summarize_text(text: str, openai_api_key: str, max_tokens: int = 512) -> str:
    """
    Use OpenAI to summarize the given text snippet.
    Focus on highlighting the candidate's job roles, skills, and professional experience.
    """
    if not openai_api_key:
        return "No OpenAI API key provided."
    
    prompt = f"""
    You are a professional resume summarizer.
    Please provide a concise summary in a single paragraph of the following text.
    Focus on highlighting the candidate's main job roles, their key skills, and their professional experience.
    
    Text:
    \"\"\"{text[:3000]}\"\"\"
    """
    try:
        openai.api_key = openai_api_key
        client = openai.Client(api_key=openai_api_key)
        resp = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful summarizer."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=max_tokens,
            temperature=0.5
        )
        summary = resp.choices[0].message.content.strip()
        return summary
    except Exception as e:
        print("Error summarizing text:", e)
        return f"Error summarizing text: {e}"

def ingest_supplier_pdf_with_summary(
    pdf_path: str,
    supplier_id: str,
    openai_api_key: str,
    pipeline
) -> Dict[str, Any]:
    """
    Ingest a supplier PDF and produce a summary without storing roles in Postgres.
    
    Steps:
      1. Read and chunk the PDF.
      2. Optionally clear previous vector docs for this supplier.
      3. Embed the chunks and (optionally) store them in the vector DB.
      4. Combine a snippet from the first few chunks.
      5. Detect roles from the snippet using OpenAI.
      6. Detect key skills from the snippet.
      7. Generate a summary of the PDF content.
      
    Returns a dictionary containing:
      - The number of chunks processed.
      - Detected roles.
      - Detected skills.
      - A summary of the PDF content.
    """
    # Step 1: Chunk the PDF.
    chunks = read_and_chunk_pdf_adaptive(pdf_path, max_words=150)
    print("DEBUG: Extracted chunks:", chunks)
    if not chunks:
        return {"error": "No text found in the PDF."}
    
    # Step 2: Optionally clear old docs for this supplier from the vector DB.
    pipeline.collection.delete_many({"supplier_id": supplier_id})
    
    # Step 3: Embed the chunks.
    embs = batch_embed_texts(pipeline.embedding_model, chunks, batch_size=16)
    docs_to_insert = []
    for i, chunk_text in enumerate(chunks):
        docs_to_insert.append({
            "supplier_id": supplier_id,
            "chunk_text": chunk_text,
            "embedding": embs[i].tolist()
        })
    if docs_to_insert:
        pipeline.collection.insert_many(docs_to_insert)
    
    # Step 4: Combine first few chunks into a snippet.
    combined_text = " ".join(chunks[:3])
    print("DEBUG: Combined text for detection and summary:", combined_text)
    
    # Step 5: Detect roles.
    roles_detected = detect_roles_from_text(combined_text, openai_api_key, num_roles=5)
    
    # Step 6: Detect skills.
    skills_detected = detect_skills_from_text(combined_text, openai_api_key, num_skills=5)
    
    # Step 7: Generate a summary.
    summary_text = summarize_text(combined_text, openai_api_key, max_tokens=512)
    
    print("DEBUG: Detected roles:", roles_detected)
    print("DEBUG: Detected skills:", skills_detected)
    print("DEBUG: Summary text:", summary_text)
    
    return {
        "num_chunks": len(chunks),
        "detected_roles": roles_detected,
        "detected_skills": skills_detected,
        "summary": summary_text
    }