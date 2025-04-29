##########################################################
# pipeline/structured_output/structured_out.py
##########################################################
import openai
from typing import Optional
from .log_util import log_info, log_error

def build_summary_prompt(user_query, docs):
    combined_docs = "\n\n".join([f"- {d['chunk_text']}" for d in docs])
    few_shot_example = """
    Example Q: "I need someone with plumbing experience."
    Example A:
    Candidate Name: John Smith
    Key Strengths: Pipe installation, fixture repairs
    Reasoning: They have proven plumbing experience from past roles
    """
    prompt = f"""
    You are a helpful AI that reads candidate resumes. Use the context below
    to answer the user's query in a structured way.

    [Few Shot Example]
    {few_shot_example}

    [User Query]
    {user_query}

    [Context]
    {combined_docs}

    Please provide an answer with:
    1) Candidate Name (if known)
    2) Key Strengths
    3) Reasoning for why they match the query
    """
    return prompt

def ask_chatgpt_structured(user_query, retrieved_docs, openai_api_key=None, method="pydantic", log_event_fn=None):
    if not retrieved_docs:
        return {
            "candidate_name": "",
            "key_strengths": [],
            "reasoning": "No documents found."
        }

    if method == "function_calling":
        functions = [
            {
                "name": "recommend_candidate",
                "description": "Return structured info about candidate",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "candidate_name": {"type": "string"},
                        "key_strengths": {"type": "array", "items": {"type": "string"}},
                        "reasoning": {"type": "string"}
                    },
                    "required": ["candidate_name", "key_strengths", "reasoning"]
                },
            }
        ]

        prompt_content = build_summary_prompt(user_query, retrieved_docs)

        try:
            client = openai.Client(api_key=openai_api_key)
            response = client.chat.completions.create(
                model="gpt-3.5-turbo-0125",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": prompt_content}
                ],
                functions=functions,
                function_call={"name": "recommend_candidate"}
            )
            message = response.choices[0].message
            fc = getattr(message, "function_call", None)
            if fc is None:
                structured_json = None
            elif isinstance(fc, dict):
                structured_json = fc.get("arguments")
            else:
                structured_json = getattr(fc, "arguments", None)

            if log_event_fn:
                log_event_fn("StructuredOutputFunctionCall", structured_json)
            else:
                log_info("StructuredOutputFunctionCall", str(structured_json))

            return structured_json
        except Exception as e:
            if log_event_fn:
                log_event_fn("StructuredOutputError", str(e))
            else:
                log_error("StructuredOutputError", str(e))
            return None

    else:
        # pydantic approach
        prompt_content = build_summary_prompt(user_query, retrieved_docs)
        pydantic_instructions = """
        Please return valid JSON with the following keys:
        {
            "candidate_name": "<string>",
            "key_strengths": ["<string>", "<string>"],
            "reasoning": "<string>"
        }
        """
        full_prompt = prompt_content + "\n" + pydantic_instructions

        try:
            client = openai.Client(api_key=openai_api_key)
            response = client.chat.completions.create(
                model="gpt-3.5-turbo-0125",
                messages=[{"role": "user", "content": full_prompt}],
                temperature=0.7
            )
            content = response.choices[0].message.content
            import json
            structured_data = json.loads(content)

            if log_event_fn:
                log_event_fn("StructuredOutputPydantic", structured_data)
            else:
                log_info("StructuredOutputPydantic", str(structured_data))

            return structured_data
        except Exception as e:
            if log_event_fn:
                log_event_fn("StructuredOutputError", str(e))
            else:
                log_error("StructuredOutputError", str(e))
            return None
