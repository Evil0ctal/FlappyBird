from pydantic import BaseModel

class ScoreSubmit(BaseModel):
    name: str
    score: int

class ScoreResponse(BaseModel):
    name: str
    score: int

    class Config:
        from_attributes = True

class MessageResponse(BaseModel):
    message: str