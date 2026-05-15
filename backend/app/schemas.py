from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    phone: str
    role: str

class UserCreate(UserBase):
    password: str
    admin_key: Optional[str] = None

class UserLogin(BaseModel):
    phone: str
    password: str

class User(UserBase):
    id: int
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    phone: Optional[str] = None

class TournamentBase(BaseModel):
    name: str
    date: datetime
    location: str
    entry_fee: float
    max_teams: int
    status: str = "Open"

class TournamentCreate(TournamentBase):
    pass

class Tournament(TournamentBase):
    id: int
    class Config:
        from_attributes = True

class TeamBase(BaseModel):
    team_name: str
    captain: str
    contact: str

class TeamCreate(TeamBase):
    logo: Optional[str] = None

class Team(TeamBase):
    id: int
    logo: Optional[str] = None
    class Config:
        from_attributes = True

class PlayerBase(BaseModel):
    player_name: str
    phone: str
    age: int
    role: str
    jersey_no: str
    team_id: int
    emergency_contact: str

class PlayerCreate(PlayerBase):
    photo_url: str
    payment_image_url: str

class Player(PlayerBase):
    id: int
    photo_url: str
    payment_image_url: str
    payment_status: str
    created_at: datetime
    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_players: int
    total_teams: int
    total_users: int
    pending_payments: int
    approved_players: int
    registrations_today: int
    upcoming_tournament: Optional[Tournament]
    recent_registrations: list

class MatchBase(BaseModel):
    tournament_id: int
    team1_id: int
    team2_id: int
    match_date: datetime
    venue: str
    status: str = "Scheduled"
    result: Optional[str] = None
    winner_id: Optional[int] = None

class MatchCreate(MatchBase):
    pass

class Match(MatchBase):
    id: int
    team1_name: Optional[str] = None
    team2_name: Optional[str] = None
    winner_name: Optional[str] = None
    class Config:
        from_attributes = True

class StandingsEntry(BaseModel):
    team_id: int
    team_name: str
    played: int
    won: int
    lost: int
    nrr: float
    points: int
