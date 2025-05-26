from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from . import models, schemas
from .database import get_db

router = APIRouter()

@router.post("/submit_score", response_model=schemas.MessageResponse)
async def submit_score(score_data: schemas.ScoreSubmit, db: Session = Depends(get_db)):
    try:
        db_score = models.Score(name=score_data.name, score=score_data.score)
        db.add(db_score)
        db.commit()
        db.refresh(db_score)
        return {"message": "Score submitted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/leaderboard", response_model=List[schemas.ScoreResponse])
async def get_leaderboard(db: Session = Depends(get_db)):
    scores = db.query(models.Score).order_by(models.Score.score.desc()).limit(10).all()
    return scores