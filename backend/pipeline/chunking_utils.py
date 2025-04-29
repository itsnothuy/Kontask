# pipeline/chunking_utils.py
import fitz  # PyMuPDF
import re
import nltk
nltk.download("punkt", quiet=True)
from nltk.tokenize import sent_tokenize

def read_and_chunk_pdf_adaptive(pdf_path, max_words=150):
    doc = fitz.open(pdf_path)
    chunks = []
    for page in doc:
        text = page.get_text()
        text = re.sub(r"\s+", " ", text).strip()
        sentences = sent_tokenize(text)
        current_chunk = []
        current_len = 0
        for sent in sentences:
            word_count = len(sent.split())
            if current_len + word_count > max_words and current_chunk:
                chunk_text = " ".join(current_chunk)
                if len(chunk_text) > 30:
                    chunks.append(chunk_text)
                current_chunk = [sent]
                current_len = word_count
            else:
                current_chunk.append(sent)
                current_len += word_count
        if current_chunk:
            chunk_text = " ".join(current_chunk)
            if len(chunk_text) > 30:
                chunks.append(chunk_text)
    doc.close()
    return chunks
