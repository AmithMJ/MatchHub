import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Handle SSL for Aiven/Vercel (Automatic Detection)
connect_args = {}
if "aivencloud.com" in SQLALCHEMY_DATABASE_URL:
    # Aiven REQUIRES SSL. Force it here.
    connect_args["ssl"] = {"ca": None}
    # Clean up any existing SSL params from the URL to avoid conflicts
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.split('?')[0]

from sqlalchemy.pool import NullPool

# Serverless-Optimized Engine (Forces connection cleanup per request)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args=connect_args,
    poolclass=NullPool
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
