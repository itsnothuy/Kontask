# pipeline/enhanced_rag_pipeline.py
import openai
from typing import List
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import numpy as np

from .embedding_utils import get_embedding_model
from .log_util import log_info, log_error, log_event

# =============== OLD CODE: generate_multi_queries + decompose_query ===============
def generate_multi_queries(user_query, num_queries=3, openai_api_key=None, log_event_fn=None):
    """
    Use OpenAI or any LLM to generate multiple variants of the user query.
    """
    if not openai_api_key:
        return [user_query]

    try:
        openai.api_key = openai_api_key
        client = openai.Client(api_key=openai_api_key)


        prompt = f"""
        You are an AI assistant. Given the user's query:
        "{user_query}"

        Generate {num_queries} alternative search queries or rephrasings
        that might retrieve relevant but slightly different results. 
        Separate each query by a newline.
        """
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful query rewriter."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.8,
        )
        multi_queries_raw = response.choices[0].message.content.strip().split("\n")
        multi_queries = [q.strip() for q in multi_queries_raw if q.strip()]

        if log_event_fn:
            log_event_fn("MultiQueryGenerated", {"original_query": user_query, "queries": multi_queries})
        else:
            log_info("MultiQueryGenerated", f"Original: {user_query}, Queries: {multi_queries}")

        return multi_queries
    except Exception as e:
        log_error("UnexpectedError", f"generate_multi_queries: {str(e)}")
        return [user_query]


def decompose_query(user_query, openai_api_key=None, log_event_fn=None):
    """
    Break a complex user query into sub-queries.
    """
    if not openai_api_key:
        return [user_query]

    decomposition_prompt = f"""
    You are a helpful assistant. 
    The user query is: '{user_query}'
    Break this query into 2-4 smaller sub-queries or aspects, each focusing on a distinct requirement.
    Return them each on a separate line.
    """
    try:
        openai.api_key = openai_api_key
        client = openai.Client(api_key=openai_api_key)


        resp = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": decomposition_prompt}],
            temperature=0.7
        )
        lines = resp.choices[0].message.content.strip().split("\n")
        sub_queries = [l.strip() for l in lines if l.strip()]

        if log_event_fn:
            log_event_fn("QueryDecomposed", {"original_query": user_query, "sub_queries": sub_queries})
        else:
            log_info("QueryDecomposed", f"Original: {user_query}, Sub-queries: {sub_queries}")

        return sub_queries
    except openai.error.OpenAIError as e:
        log_error("OpenAIError", f"decompose_query: {str(e)}")
        return [user_query]
    except Exception as e:
        log_error("UnexpectedError", f"decompose_query: {str(e)}")
        return [user_query]


# =============== LLM-based routing ===============
def route_query_llm(user_query: str, openai_api_key: str, known_services: List[str]):
    """
    LLM-based approach: ask GPT to pick the single best service from known_services, or 'all'.
    """
    if not openai_api_key or not known_services:
        # fallback to 'all'
        return "all"

    prompt = f"""
    We have these services: {', '.join(known_services)}.
    The user query is: '{user_query}'
    Return exactly one service from that list if it fits well, else 'all'.
    """

    
    try:
        openai.api_key = openai_api_key
        client = openai.Client(api_key=openai_api_key)

        resp = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content":"You are a role classifier."},
                {"role":"user","content":prompt}
            ],
            temperature=0
        )
        choice = resp.choices[0].message.content.strip().lower()
        # Attempt to match it to a known service
        match = None
        for svc in known_services:
            if choice == svc.lower():
                match = svc
                break
        if not match:
            match = "all"
        return match
    except openai.error.OpenAIError as e:
        log_error("OpenAIError", f"route_query_llm: {str(e)}")
        return "all"
    except Exception as e:
        log_error("UnexpectedError", f"route_query_llm: {str(e)}")
        return "all"


# =============== LLM-based Re-Rank ===============
def re_rank_results_llm(user_query: str, results: List[dict], top_k=3, openai_api_key=None):
    """
    LLM-based re-rank. We'll do a simple prompt describing each doc,
    then ask GPT to reorder them. If fails, fallback to score-sorting.
    """
    if not results:
        return []

    if not openai_api_key:
        # fallback
        sorted_res = sorted(results, key=lambda x: x["score"], reverse=True)
        return sorted_res[:top_k]

    # Build a text listing the docs
    text_list = []
    for i, r in enumerate(results):
        chunk = r["chunk_text"]
        text_list.append(f"Document {i+1}: {chunk}")

    re_rank_prompt = f"""
    The user's query is: '{user_query}'
    We have these candidate text chunks:
    {chr(10).join(text_list)}

    Please rank them from most relevant to least relevant, and only return 
    a list of the document numbers in order of relevance. 
    """
    
    try:
        openai.api_key = openai_api_key
        
        client = openai.Client(api_key=openai_api_key)
        resp = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role":"system","content":"You are a re-ranker."},
                {"role":"user","content":re_rank_prompt}
            ],
            temperature=0
        )
        content = resp.choices[0].message.content.strip().lower()
        # We do a naive parse. e.g. "1, 2, 3" or "Document 2, then 1, then 3" etc.
        # If we fail to parse, fallback
        # For simplicity, we fallback right away
        sorted_res = sorted(results, key=lambda x: x["score"], reverse=True)
        return sorted_res[:top_k]
    except openai.error.OpenAIError as e:
        log_error("OpenAIError", f"re_rank_results_llm: {str(e)}")
        return sorted(results, key=lambda x: x["score"], reverse=True)[:top_k]
    except Exception as e:
        log_error("UnexpectedError", f"re_rank_results_llm: {str(e)}")
        return sorted(results, key=lambda x: x["score"], reverse=True)[:top_k]


# =============== Structured Output Summaries ===============
from .structured_output import ask_chatgpt_structured


# =============== The EnhancedRAGPipeline Class ===============
class EnhancedRAGPipeline:
    """
    1) We fetch known services from Postgres (supplier roles).
    2) route_query_llm => pick the single best service or 'all'
    3) decompose_query => break into sub-queries
    4) multi-query => expansions
    5) gather docs from vector DB => re-rank w/ LLM
    6) structured summary => reason
    """
    def __init__(self, 
                 mongo_uri: str, 
                 openai_api_key: str, 
                 db_session_factory,  # function to create DB session
                 index_name="default"):
        self.mongo_uri = mongo_uri
        self.client = MongoClient(mongo_uri, server_api=ServerApi('1'))
        self.db_mongo = self.client["testdb"]
        self.collection = self.db_mongo["chunks"]
        self.embedding_model = get_embedding_model()
        self.openai_api_key = openai_api_key
        self.index_name = index_name
        self.db_session_factory = db_session_factory

    def _get_known_services(self):
        """
        Access Postgres to get the list of services stored in 'services' table.
        We'll just return their name in a list.
        """
        db = self.db_session_factory()
        try:
            from models import Service
            rows = db.query(Service.name).all()
            # rows is list of (name,) tuples
            svc_names = [r[0].lower() for r in rows]
            return svc_names
        finally:
            db.close()

    def _get_suppliers_for_service(self, service_name: str):
        """
        Return a set/list of supplier_ids from the 'supplier_services' 
        association that match service_name.
        If the service doesn't exist, returns an empty list => means no match.
        """
        db = self.db_session_factory()
        try:
            from repository import get_service_by_name, get_suppliers_for_service
            svc_obj = get_service_by_name(db, service_name.lower())
            if not svc_obj:
                return []
            supplier_ids = get_suppliers_for_service(db, service_name.lower())
            return supplier_ids
        finally:
            db.close()

    def advanced_search(self, user_query: str, top_k=3):
        # 1) known services from DB
        known_services = self._get_known_services()
        if not known_services:
            # If we literally have none in DB, we can't route
            return []

        # 2) route
        chosen_service = route_query_llm(user_query, self.openai_api_key, known_services)
        log_info("RoutingResult", f"Chosen service: {chosen_service}")
        if chosen_service == "all" or chosen_service not in known_services:
            return []

        # 2.5) find all suppliers who have that chosen_service
        valid_supplier_ids = set(self._get_suppliers_for_service(chosen_service))
        if not valid_supplier_ids:
            # no suppliers => fallback
            return []
        # 3) decomposition
        sub_queries = decompose_query(user_query, self.openai_api_key, log_event_fn=log_event) or [user_query] 

        # 4) multi-query expansions on the first sub-query
        expansions = generate_multi_queries(sub_queries[0], num_queries=2, openai_api_key=self.openai_api_key, log_event_fn=log_event)

        # 5) gather docs from vector DB
        # We'll do a simple gather from expansions => combine => re-rank
        all_results = []
        for eq in expansions:
            partial = self._vector_search(eq, top_k=top_k*2)
            all_results.extend(partial)
            
        print(f"Total results: {len(all_results)}")
        

        # 5.5) Filter out docs whose supplier_id not in valid_supplier_ids
        # e.g. a doc from a supplier who doesn't offer 'electrician' => skip
        filtered_by_service = []
        for doc in all_results:
            sup_id = doc.get("supplier_id")
            if sup_id in valid_supplier_ids:
                filtered_by_service.append(doc)
        
        print(f"Filtered by service: {len(filtered_by_service)}")
        
                
        # 6) deduplicate by supplier_id
        deduped_by_supplier = {}
        for r in all_results:
            if "supplier_id" not in r:
                continue
            sup = r["supplier_id"]
            # if we haven't stored that supplier yet, or if we want the best score chunk
            if sup not in deduped_by_supplier or r["score"] > deduped_by_supplier[sup]["score"]:
                deduped_by_supplier[sup] = r
        final_list = list(deduped_by_supplier.values())
        
        print(f"Final list: {len(final_list)}")
        
        
        # # 6.5) re-rank
        # final = re_rank_results_llm(user_query, final_list, top_k=top_k, openai_api_key=self.openai_api_key)
        return final_list

    def _vector_search(self, query_text: str, top_k=3, min_score=0.0):
        q_emb = self.embedding_model.encode([query_text])[0].tolist()
        pipeline = [
            {
                "$vectorSearch": {
                    "index": self.index_name,
                    "queryVector": q_emb,
                    "path": "embedding",
                    "limit": top_k,
                    "numCandidates": 50
                }
            },
            {
                "$project":{
                    "_id":0,
                    "supplier_id":1,
                    "chunk_text":1,
                    "score":{"$meta":"vectorSearchScore"}
                }
            }
        ]
        docs = list(self.collection.aggregate(pipeline))
        # Filter out docs below the threshold
        results = [d for d in docs if d["score"] >= min_score]
        return results

    def get_structured_summary(self, user_query: str, final_sorted_results: list):
        """
        Optionally call ask_chatgpt_structured to produce a single summary across
        multiple top docs or do it doc-by-doc. We'll do a single summary for the top doc for demonstration.
        """
        # If you want multiple docs summary, pass them all. We'll do top 3 for demonstration.
        top_docs = final_sorted_results[:3]
        structured = ask_chatgpt_structured(
            user_query=user_query,
            retrieved_docs=top_docs,
            openai_api_key=self.openai_api_key,
            method="pydantic",
            log_event_fn=log_event
        )
        return structured
