import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Handle SSL for Aiven/Vercel (fixes 'str' object has no attribute 'get')
connect_args = {}
if "ssl=true" in SQLALCHEMY_DATABASE_URL.lower():
    connect_args["ssl"] = {"ca": None} # This forces SSL without needing a specific CA file
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("?ssl=true", "").replace("&ssl=true", "")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args=connect_args,
    pool_recycle=300,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
