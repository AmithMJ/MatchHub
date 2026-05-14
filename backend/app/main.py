import os
from dotenv import load_dotenv
# Load environment variables before anything else
load_dotenv()

from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
import shutil
import datetime

from app import models, schemas, database
from app.core import auth
from app.database import engine
# pyrefly: ignore [missing-import]
import cloudinary
# pyrefly: ignore [missing-import]
import cloudinary.uploader

# Configure Cloudinary
cloudinary.config(
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key = os.getenv("CLOUDINARY_API_KEY"),
    api_secret = os.getenv("CLOUDINARY_API_SECRET"),
    secure = True
)

app = FastAPI(title="MatchHub API", version="1.0.1") # v1.0.1 - SSL & Cloudinary Fix

# Auto-migration for missing columns
@app.on_event("startup")
async def startup_event():
    from sqlalchemy import text
    try:
        # Create tables
        models.Base.metadata.create_all(bind=engine)
        
        with engine.begin() as conn:
            # 1. Check/Add tournament_id column to players
            try:
                conn.execute(text("SELECT tournament_id FROM players LIMIT 1"))
            except Exception:
                print("Adding tournament_id column to players table...")
                conn.execute(text("ALTER TABLE players ADD COLUMN tournament_id INT"))
                conn.execute(text("ALTER TABLE players ADD CONSTRAINT fk_player_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(id)"))
            
            # 2. Link existing players to the most recent open tournament
            open_tournament = conn.execute(text("SELECT id FROM tournaments WHERE status = 'Open' ORDER BY date ASC LIMIT 1")).fetchone()
            if open_tournament:
                tournament_id = open_tournament[0]
                conn.execute(text(f"UPDATE players SET tournament_id = {tournament_id} WHERE tournament_id IS NULL"))
    except Exception as e:
        print(f"Startup/Migration error: {e}")

# CORS
# Allow explicit origins for production stability
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://matchhub-portal.vercel.app",
        "https://matchhub-frontend.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:4173",
        "http://localhost:4174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to MatchHub API", "health": "/health", "test": "/db-test"}

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "MatchHub API is live"}

@app.get("/db-test")
def db_test(db: Session = Depends(database.get_db)):
    try:
        # Try to count users to see if table exists and DB is connected
        count = db.query(models.User).count()
        return {"status": "connected", "user_count": count}
    except Exception as e:
        return {"status": "error", "error": str(e)}

# Static files for uploads
# Setup Uploads Directory (Absolute Path for reliability)
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) # This is the 'app' folder
BACKEND_DIR = os.path.dirname(BASE_DIR) # This is the 'backend' folder
UPLOAD_DIR = os.path.join(BACKEND_DIR, "uploads")

def sanitize_filename(filename: str) -> str:
    # Remove spaces and parentheses for web safety
    return filename.replace(" ", "_").replace("(", "").replace(")", "")

if os.getenv("VERCEL"):
    UPLOAD_DIR = "/tmp/uploads"

if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# --- AUTH ---
@app.post("/auth/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    try:
        db_user = db.query(models.User).filter(models.User.phone == user.phone).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Phone already registered")
        
        hashed_pwd = auth.get_password_hash(user.password)
        new_user = models.User(phone=user.phone, role=user.role, password_hash=hashed_pwd)
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/auth/login")
def login(form_data: schemas.UserLogin, db: Session = Depends(database.get_db)):
    try:
        user = db.query(models.User).filter(models.User.phone == form_data.phone).first()
        if not user or not auth.verify_password(form_data.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Incorrect phone or password")
        access_token = auth.create_access_token(data={"sub": user.phone})
        return {"access_token": access_token, "token_type": "bearer", "role": user.role, "phone": user.phone}
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

# --- TOURNAMENTS ---
@app.post("/tournaments", response_model=schemas.Tournament)
def create_tournament(tournament: schemas.TournamentCreate, db: Session = Depends(database.get_db), current_user=Depends(auth.get_admin_user)):
    db_tournament = models.Tournament(**tournament.dict())
    db.add(db_tournament)
    db.commit()
    db.refresh(db_tournament)
    return db_tournament

@app.get("/tournaments", response_model=List[schemas.Tournament])
def list_tournaments(db: Session = Depends(database.get_db)):
    return db.query(models.Tournament).all()

@app.put("/tournaments/{tournament_id}", response_model=schemas.Tournament)
def update_tournament(tournament_id: int, tournament_update: schemas.TournamentCreate, db: Session = Depends(database.get_db), current_user=Depends(auth.get_admin_user)):
    db_tournament = db.query(models.Tournament).filter(models.Tournament.id == tournament_id).first()
    if not db_tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    for key, value in tournament_update.dict().items():
        setattr(db_tournament, key, value)
    
    db.commit()
    db.refresh(db_tournament)
    return db_tournament

# --- TEAMS ---
@app.post("/teams", response_model=schemas.Team)
async def create_team(
    team_name: str = Form(...),
    captain: str = Form(...),
    contact: str = Form(...),
    logo: UploadFile = File(None),
    db: Session = Depends(database.get_db),
    current_user=Depends(auth.get_admin_user)
):
    # --- Upload Handling (Cloudinary vs Local) ---
    is_cloudinary = all([os.getenv("CLOUDINARY_CLOUD_NAME"), os.getenv("CLOUDINARY_API_KEY"), os.getenv("CLOUDINARY_API_SECRET")])
    logo_url_final = None

    if logo:
        if is_cloudinary:
            try:
                logo_upload = cloudinary.uploader.upload(logo.file, folder="matchhub/teams")
                logo_url_final = logo_upload.get("secure_url")
            except Exception as e:
                print(f"Cloudinary Team Logo Error: {e}")
                is_cloudinary = False

        if not is_cloudinary or not logo_url_final:
            safe_filename = sanitize_filename(f"team_{team_name}_{logo.filename}")
            logo_path = os.path.join(UPLOAD_DIR, safe_filename)
            with open(logo_path, "wb") as buffer:
                shutil.copyfileobj(logo.file, buffer)
            logo_url_final = safe_filename
    
    db_team = models.Team(team_name=team_name, captain=captain, contact=contact, logo=logo_url_final)
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team

@app.get("/teams", response_model=List[schemas.Team])
def list_teams(request: Request, db: Session = Depends(database.get_db)):
    teams = db.query(models.Team).all()
    base_url = str(request.base_url).rstrip('/')
    for team in teams:
        if team.logo and not team.logo.startswith('http'):
            # Convert internal path/filename to full URL
            filename = os.path.basename(team.logo)
            team.logo = f"{base_url}/uploads/{filename}"
    return teams

# --- PLAYERS ---
@app.post("/players/register")
async def register_player(
    player_name: str = Form(...),
    phone: str = Form(...),
    password: str = Form(...),
    age: int = Form(...),
    role: str = Form(...),
    jersey_no: str = Form(...),
    team_id: int = Form(...),
    emergency_contact: str = Form(...),
    photo: UploadFile = File(...),
    payment_screenshot: UploadFile = File(...),
    db: Session = Depends(database.get_db)
):
    # Check if user already exists
    db_user = db.query(models.User).filter(models.User.phone == phone).first()
    if not db_user:
        hashed_pwd = auth.get_password_hash(password)
        new_user = models.User(phone=phone, role="player", password_hash=hashed_pwd)
        db.add(new_user)
    
    # --- Upload Handling (Cloudinary vs Local) ---
    # Re-verify env vars and strip whitespace
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME", "").strip()
    api_key = os.getenv("CLOUDINARY_API_KEY", "").strip()
    api_secret = os.getenv("CLOUDINARY_API_SECRET", "").strip()
    
    is_cloudinary = all([cloud_name, api_key, api_secret])
    
    photo_url_final = None
    payment_url_final = None

    if is_cloudinary:
        try:
            # Re-configure to ensure latest values are used
            cloudinary.config(
                cloud_name=cloud_name,
                api_key=api_key,
                api_secret=api_secret,
                secure=True
            )
            print(f"DEBUG: Attempting Cloudinary upload to '{cloud_name}'...")
            # Reset file pointer just in case
            photo.file.seek(0)
            photo_upload = cloudinary.uploader.upload(photo.file, folder="matchhub/players")
            photo_url_final = photo_upload.get("secure_url")
            
            payment_screenshot.file.seek(0)
            payment_upload = cloudinary.uploader.upload(payment_screenshot.file, folder="matchhub/payments")
            payment_url_final = payment_upload.get("secure_url")
            print("DEBUG: Cloudinary upload successful!")
        except Exception as e:
            print(f"!!! CLOUDINARY ERROR !!!: {str(e)}")
            # On Vercel, we MUST have Cloudinary. Don't fallback silently.
            if os.getenv("VERCEL"):
                raise HTTPException(
                    status_code=500, 
                    detail=f"Cloudinary Upload Failed: {str(e)}. Please check your Vercel Environment Variables."
                )
            is_cloudinary = False

    if not is_cloudinary:
        # Local Fallback
        photo_filename = sanitize_filename(f"player_{phone}_{photo.filename}")
        payment_filename = sanitize_filename(f"pay_{phone}_{payment_screenshot.filename}")
        
        photo_path = os.path.join(UPLOAD_DIR, photo_filename)
        with open(photo_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        
        payment_path = os.path.join(UPLOAD_DIR, payment_filename)
        with open(payment_path, "wb") as buffer:
            shutil.copyfileobj(payment_screenshot.file, buffer)
        
        photo_url_final = photo_filename
        payment_url_final = payment_filename

    # Auto-link to the currently open tournament
    open_tournament = db.query(models.Tournament).filter(models.Tournament.status == "Open").order_by(models.Tournament.date.asc()).first()
    tournament_id = open_tournament.id if open_tournament else None

    db_player = models.Player(
        player_name=player_name,
        phone=phone,
        age=age,
        role=role,
        jersey_no=jersey_no,
        team_id=team_id,
        tournament_id=tournament_id,
        emergency_contact=emergency_contact,
        photo_url=photo_url_final, 
        payment_image_url=payment_url_final
    )
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    return db_player

@app.get("/players")
def list_players(request: Request, db: Session = Depends(database.get_db), current_user=Depends(auth.get_admin_user)):
    players = db.query(models.Player).all()
    result = []
    
    # Get the base URL dynamically from the request (works on Localhost AND Vercel)
    base_url = str(request.base_url).rstrip('/')
    
    for p in players:
        team = db.query(models.Team).filter(models.Team.id == p.team_id).first()
        tournament = db.query(models.Tournament).filter(models.Tournament.id == p.tournament_id).first() if p.tournament_id else None
        
        # Clean up filenames and construct full web URLs
        photo_fn = os.path.basename(p.photo_url) if p.photo_url else None
        pay_fn = os.path.basename(p.payment_image_url) if p.payment_image_url else None
        
        photo_url = f"{base_url}/uploads/{photo_fn}" if photo_fn else None
        payment_url = f"{base_url}/uploads/{pay_fn}" if pay_fn else None

        result.append({
            "id": p.id,
            "player_name": p.player_name,
            "phone": p.phone,
            "age": p.age,
            "role": p.role,
            "jersey_no": p.jersey_no,
            "team_id": p.team_id,
            "team_name": team.team_name if team else "Unknown",
            "tournament_id": p.tournament_id,
            "tournament_name": tournament.name if tournament else "No Tournament",
            "tournament_status": tournament.status if tournament else None,
            "photo_url": photo_url,
            "payment_image_url": payment_url,
            "payment_status": p.payment_status,
            "emergency_contact": p.emergency_contact,
            "created_at": p.created_at
        })
    return result

@app.put("/players/{player_id}/approve")
def approve_player(player_id: int, db: Session = Depends(database.get_db), current_user=Depends(auth.get_admin_user)):
    player = db.query(models.Player).filter(models.Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    player.payment_status = "Approved"
    db.commit()
    return {"message": "Player approved"}

@app.put("/players/{player_id}/reject")
def reject_player(player_id: int, db: Session = Depends(database.get_db), current_user=Depends(auth.get_admin_user)):
    player = db.query(models.Player).filter(models.Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    player.payment_status = "Rejected"
    db.commit()
    return {"message": "Player rejected"}

@app.get("/players/status/{phone}")
def get_player_status(request: Request, phone: str, db: Session = Depends(database.get_db)):
    player = db.query(models.Player).filter(models.Player.phone == phone).first()
    if not player:
        raise HTTPException(status_code=404, detail="No registration found for this mobile number")
    
    # Get team name
    team = db.query(models.Team).filter(models.Team.id == player.team_id).first()
    base_url = str(request.base_url).rstrip('/')
    
    # URLs
    photo_fn = os.path.basename(player.photo_url) if player.photo_url else None
    photo_url = f"{base_url}/uploads/{photo_fn}" if photo_fn else None

    return {
        "player_name": player.player_name,
        "payment_status": player.payment_status,
        "team_name": team.team_name if team else "Unknown",
        "jersey_no": player.jersey_no,
        "role": player.role,
        "photo_url": photo_url,
        "created_at": player.created_at
    }

# --- DASHBOARD ---
@app.get("/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(database.get_db), current_user=Depends(auth.get_admin_user)):
    total_players = db.query(models.Player).count()
    total_teams = db.query(models.Team).count()
    total_users = db.query(models.User).count()
    pending_payments = db.query(models.Player).filter(models.Player.payment_status == "Pending").count()
    approved_players = db.query(models.Player).filter(models.Player.payment_status == "Approved").count()
    
    today = datetime.datetime.utcnow().date()
    registrations_today = db.query(models.Player).filter(models.Player.created_at >= today).count()
    
    upcoming_tournament = db.query(models.Tournament).filter(models.Tournament.status == "Open").order_by(models.Tournament.date.asc()).first()
    
    recent_registrations = db.query(models.Player).order_by(models.Player.created_at.desc()).limit(5).all()
    recent_data = []
    for p in recent_registrations:
        team = db.query(models.Team).filter(models.Team.id == p.team_id).first()
        recent_data.append({
            "player_name": p.player_name,
            "team_name": team.team_name if team else "Free Agent",
            "status": p.payment_status,
            "time": p.created_at
        })

    return {
        "total_players": total_players,
        "total_teams": total_teams,
        "total_users": total_users,
        "pending_payments": pending_payments,
        "approved_players": approved_players,
        "registrations_today": registrations_today,
        "upcoming_tournament": upcoming_tournament,
        "recent_registrations": recent_data
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8080, reload=True)
