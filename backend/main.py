from pathlib import Path
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from ai.risk_model import FEATURE_NAMES, risk_model  # noqa: E402

app = FastAPI(title="Dhara-Sanket Risk API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ProjectFeatures(BaseModel):
    compensation_delay_days: float = Field(ge=0)
    dispute_count: float = Field(ge=0)
    approval_delay_days: float = Field(ge=0)
    rainfall_mm: float = Field(ge=0)
    slope_degree: float = Field(ge=0)
    land_use_type: float = Field(ge=0)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "model": "local-random-forest"}


@app.post("/predict")
def predict(features: ProjectFeatures) -> dict:
    values = [getattr(features, name) for name in FEATURE_NAMES]
    prediction = risk_model.predict(values)
    return {
        "risk_score": prediction.risk_score,
        "explanations": prediction.explanations,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
