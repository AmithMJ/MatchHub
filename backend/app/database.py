import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Safety Check: Prevent crash if DATABASE_URL is missing
if not SQLALCHEMY_DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:password@localhost/db"
    print("WARNING: DATABASE_URL not found! Using local fallback to prevent crash.")

# Handle SSL for Aiven/Vercel (Automatic Detection)
connect_args = {}
if SQLALCHEMY_DATABASE_URL:
    # Fix common typo where :PORT is left as a placeholder
    if ":PORT" in SQLALCHEMY_DATABASE_URL:
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace(":PORT", ":20810")
    
    if "aivencloud.com" in SQLALCHEMY_DATABASE_URL:
        # Force SSL for Aiven
        if "mysqlconnector" in SQLALCHEMY_DATABASE_URL:
            # mysql-connector-python settings
            connect_args["ssl_mode"] = "REQUIRED"
        else:
            # pymysql settings
            connect_args["ssl"] = {"ca": None}
        
        # Clean up any existing params from the URL
        if "?" in SQLALCHEMY_DATABASE_URL:
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
