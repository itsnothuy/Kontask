from dotenv import load_dotenv
import os

# Load variables from .env file
load_dotenv()

# Access the variables
host = os.getenv("HOST")
port = os.getenv("PORT")
db_source = os.getenv("DB_SOURCE")