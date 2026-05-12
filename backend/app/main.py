import os
from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
import shutil
import datetime

from app import models, schemas, database
from app.core import auth
from app.database import engine

app = FastAPI(title="MatchHub API")

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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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
UPLOAD_DIR = "/tmp/uploads" if os.getenv("VERCEL") else "uploads"
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
        
        # Diagnostic: Check length
        pwd_len = len(user.password) if user.password else 0
        
        # Super-defensive truncation
        safe_password = user.password[:70] if user.password else ""
        hashed_pwd = auth.get_password_hash(safe_password)
        
        new_user = models.User(phone=user.phone, role=user.role, password_hash=hashed_pwd)
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except Exception as e:
        print(f"Registration error: {e}")
        # Return length for debugging
        pwd_len = len(user.password) if user.password else 0
        raise HTTPException(status_code=500, detail=f"Registration failed [Len:{pwd_len}]: {str(e)}")

@app.post("/auth/login")
def login(form_data: schemas.UserLogin, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.phone == form_data.phone).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect phone or password")
    access_token = auth.create_access_token(data={"sub": user.phone})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role, "phone": user.phone}

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
    logo_path = None
    if logo:
        logo_path = f"{UPLOAD_DIR}/team_{team_name}_{logo.filename}"
        with open(logo_path, "wb") as buffer:
            shutil.copyfileobj(logo.file, buffer)
    
    db_team = models.Team(team_name=team_name, captain=captain, contact=contact, logo=logo_path)
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team

@app.get("/teams", response_model=List[schemas.Team])
def list_teams(db: Session = Depends(database.get_db)):
    return db.query(models.Team).all()

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
    
    # Save photo
    photo_path = f"{UPLOAD_DIR}/player_{phone}_{photo.filename}"
    with open(photo_path, "wb") as buffer:
        shutil.copyfileobj(photo.file, buffer)
    
    # Save payment screenshot
    payment_path = f"{UPLOAD_DIR}/pay_{phone}_{payment_screenshot.filename}"
    with open(payment_path, "wb") as buffer:
        shutil.copyfileobj(payment_screenshot.file, buffer)
    
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
        photo_url=photo_path,
        payment_image_url=payment_path
    )
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    return db_player

@app.get("/players")
def list_players(db: Session = Depends(database.get_db), current_user=Depends(auth.get_admin_user)):
    players = db.query(models.Player).all()
    result = []
    for p in players:
        team = db.query(models.Team).filter(models.Team.id == p.team_id).first()
        tournament = db.query(models.Tournament).filter(models.Tournament.id == p.tournament_id).first() if p.tournament_id else None
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
            "photo_url": p.photo_url,
            "payment_image_url": p.payment_image_url,
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
def get_player_status(phone: str, db: Session = Depends(database.get_db)):
    player = db.query(models.Player).filter(models.Player.phone == phone).first()
    if not player:
        raise HTTPException(status_code=404, detail="No registration found for this mobile number")
    
    # Get team name
    team = db.query(models.Team).filter(models.Team.id == player.team_id).first()
    
    return {
        "player_name": player.player_name,
        "payment_status": player.payment_status,
        "team_name": team.team_name if team else "Unknown",
        "jersey_no": player.jersey_no,
        "role": player.role,
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
