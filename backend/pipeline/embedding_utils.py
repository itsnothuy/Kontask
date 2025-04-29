# pipeline/embedding_utils.py
from sentence_transformers import SentenceTransformer

def get_embedding_model():
    return SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

def batch_embed_texts(model, texts, batch_size=16):
    all_embs = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i+batch_size]
        embs = model.encode(batch)
        all_embs.extend(embs)
    return all_embs
