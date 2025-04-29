# pipeline/minimal_rag_pipeline.py
import os
import openai
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

from .chunking_utils import read_and_chunk_pdf_adaptive
from .embedding_utils import get_embedding_model, batch_embed_texts

class MinimalRAGPipeline:
    """
    1) Ingest supplier PDF: chunk+embed -> store in Mongo
    2) Direct vector search -> return top docs
    """

    def __init__(self, mongo_uri, openai_api_key=None):
        self.mongo_uri = mongo_uri
        self.client = MongoClient(self.mongo_uri, server_api=ServerApi('1'))
        self.db = self.client["testdb"]
        self.collection = self.db["chunks"]
        self.embedding_model = get_embedding_model()
        self.openai_api_key = openai_api_key
        if openai_api_key:
            openai.api_key = openai_api_key

    def ingest_supplier_pdf(self, pdf_path: str, supplier_id: str):
        # Remove old docs for that supplier
        self.collection.delete_many({"supplier_id": supplier_id})

        # chunk
        chunks = read_and_chunk_pdf_adaptive(pdf_path)
        if not chunks:
            return "unknown"

        # embed
        embs = batch_embed_texts(self.embedding_model, chunks, batch_size=16)

        # store
        docs = []
        for i, chunk_text in enumerate(chunks):
            docs.append({
                "supplier_id": supplier_id,
                "chunk_text": chunk_text,
                "embedding": embs[i].tolist()
            })
        if docs:
            self.collection.insert_many(docs)
        return "done"

    def search_suppliers(self, query: str, top_k=10):
        # 1) embed the query
        q_emb = self.embedding_model.encode([query])[0].tolist()
        # 2) do a vector search in mongo
        pipeline = [
            {
                "$vectorSearch": {
                    "index": "default",  # must exist in MongoDB Atlas
                    "queryVector": q_emb,
                    "path": "embedding",
                    "limit": top_k * 2,
                    "numCandidates": 50
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "supplier_id": 1,
                    "chunk_text": 1,
                    "score": {"$meta": "vectorSearchScore"}
                }
            }
        ]
        results = list(self.collection.aggregate(pipeline))
        return results
