from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Enum, Text
from sqlalchemy.orm import relationship
from .database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(15), unique=True, index=True)
    role = Column(String(20), default="player")  # organizer, player
    password_hash = Column(String(255))

class Tournament(Base):
    __tablename__ = "tournaments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    date = Column(DateTime)
    location = Column(String(200))
    entry_fee = Column(Float)
    max_teams = Column(Integer)
    status = Column(String(20), default="Open")  # Open, Closed

class Team(Base):
    __tablename__ = "teams"
    id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String(100), unique=True)
    captain = Column(String(100))
    contact = Column(String(15))
    logo = Column(String(255), nullable=True)
    players = relationship("Player", back_populates="team")

class Player(Base):
    __tablename__ = "players"
    id = Column(Integer, primary_key=True, index=True)
    player_name = Column(String(100))
    phone = Column(String(15))
    age = Column(Integer)
    role = Column(String(50))  # Batsman, Bowler, etc.
    jersey_no = Column(String(10))
    team_id = Column(Integer, ForeignKey("teams.id"))
    tournament_id = Column(Integer, ForeignKey("tournaments.id"), nullable=True)
    photo_url = Column(String(255))
    payment_image_url = Column(String(255))
    payment_status = Column(String(20), default="Pending")  # Pending, Approved, Rejected
    emergency_contact = Column(String(100))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    team = relationship("Team", back_populates="players")
    tournament = relationship("Tournament")

class Match(Base):
    __tablename__ = "matches"
    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    team1_id = Column(Integer, ForeignKey("teams.id"))
    team2_id = Column(Integer, ForeignKey("teams.id"))
    match_date = Column(DateTime)
    venue = Column(String(200))
    status = Column(String(20), default="Scheduled")  # Scheduled, Live, Completed
    result = Column(String(255), nullable=True)
    winner_id = Column(Integer, ForeignKey("teams.id"), nullable=True)

    team1 = relationship("Team", foreign_keys=[team1_id])
    team2 = relationship("Team", foreign_keys=[team2_id])
    winner = relationship("Team", foreign_keys=[winner_id])
    tournament = relationship("Tournament")
