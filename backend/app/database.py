import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Handle SSL & Sanitize URL
connect_args = {}
if SQLALCHEMY_DATABASE_URL:
    url_lower = SQLALCHEMY_DATABASE_URL.lower()
    if "ssl" in url_lower:
        # Enable SSL
        connect_args["ssl"] = {"ca": None}
        # Remove ssl_mode from URL string to prevent pymysql crash
        if "?" in SQLALCHEMY_DATABASE_URL:
            base_url = SQLALCHEMY_DATABASE_URL.split('?')[0]
            SQLALCHEMY_DATABASE_URL = base_url

from sqlalchemy.pool import NullPool

# Original Simple Engine with NullPool fix
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
