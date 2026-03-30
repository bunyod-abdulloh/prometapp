import os

from dotenv import load_dotenv

load_dotenv()

DJ_SECRET_KEY = os.getenv("DJ_SECRET_KEY")
DJ_DEBUG = os.getenv("DJ_DEBUG") == "True"
DJ_ALLOWED_HOSTS = os.getenv("DJ_ALLOWED_HOSTS").split(",")

DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
