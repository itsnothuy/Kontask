##########################################################
# pipeline/log_util.py
##########################################################
import logging
import sys

logger = logging.getLogger("RAGLogger")
logger.setLevel(logging.INFO)

handler = logging.StreamHandler(sys.stdout)
formatter = logging.Formatter(
    fmt="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
handler.setFormatter(formatter)
logger.addHandler(handler)

def log_info(event_name, details=""):
    logger.info(f"Event: {event_name} | Details: {details}")

def log_warning(event_name, details=""):
    logger.warning(f"Event: {event_name} | Details: {details}")

def log_error(event_name, details=""):
    logger.error(f"Event: {event_name} | Details: {details}")

def log_event(event_name, details):
    """
    A simple logging function to demonstrate custom logging or integration
    with a tracing service. You can replace with actual logging calls.
    """
    print(f"[LOG] Event: {event_name} | Details: {details}")
