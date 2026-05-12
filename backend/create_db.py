import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

def create_database():
    db_url = os.getenv("DATABASE_URL")
    # Parse connection details from URL: mysql+mysqlconnector://user:password@host:port/dbname
    # Example: mysql+mysqlconnector://root:12345678@localhost:3306/matchhub
    
    parts = db_url.split("://")[1].split("@")
    user_pass = parts[0].split(":")
    user = user_pass[0]
    password = user_pass[1]
    
    host_port_db = parts[1].split("/")
    host_port = host_port_db[0].split(":")
    host = host_port[0]
    port = host_port[1]
    db_name = host_port_db[1]

    try:
        conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            port=port
        )
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        print(f"Database '{db_name}' created or already exists.")
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Error creating database: {e}")

if __name__ == "__main__":
    create_database()
