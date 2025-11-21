from pydantic import BaseModel
from typing import Optional


class GameBase(BaseModel):
    app_id: int
    name: str
    playtime_hours: float
    score: float
    total_reviews: int
    review_desc: Optional[str] = None
    steam_url: str
    hltb_url: Optional[str] = None
    hltb_name: Optional[str] = None
    image_url: str


class GameResponse(GameBase):
    class Config:
        from_attributes = True


class GameListResponse(BaseModel):
    total: int
    games: list[GameResponse]


class FilterParams(BaseModel):
    playtime_min: float = 0
    playtime_max: float = float('inf')
    score_min: float = 0
    score_max: float = 100
    search: Optional[str] = None
    limit: int = 24
    offset: int = 0
