from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from . import models
from .database import engine
from .api import router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Flappy Bird API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

app.mount("/static", StaticFiles(directory="frontend"), name="static")


@app.get("/")
async def root():
    return RedirectResponse(url="/static/index.html")