import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Handle SSL for Aiven/Vercel
connect_args = {}
url_lower = SQLALCHEMY_DATABASE_URL.lower()
if "ssl=true" in url_lower or "ssl_mode=required" in url_lower:
    connect_args["ssl"] = {"ca": None}
    # Clean up the URL for SQLAlchemy
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("?ssl=true", "").replace("&ssl=true", "")
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("?ssl_mode=REQUIRED", "").replace("&ssl_mode=REQUIRED", "")
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("?ssl_mode=required", "").replace("&ssl_mode=required", "")

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
