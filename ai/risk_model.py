"""Risk scoring and feature explanation logic for DHARA-SANKET."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Iterable

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.datasets import make_classification

FEATURE_NAMES = [
    "compensation_delay_days",
    "dispute_count",
    "approval_delay_days",
    "rainfall_mm",
    "slope_degree",
    "land_use_type",
]


@dataclass
class RiskPrediction:
    risk_score: float
    explanations: Dict[str, float]


class RiskModel:
    """Small local model that is deterministic and easy to replace with a trained model."""

    def __init__(self) -> None:
        features, labels = make_classification(
            n_samples=300,
            n_features=len(FEATURE_NAMES),
            n_informative=4,
            n_redundant=0,
            random_state=42,
        )
        self.model = RandomForestClassifier(n_estimators=120, random_state=42)
        self.model.fit(features, labels)
        self.baseline = features.mean(axis=0)

    def predict(self, values: Iterable[float]) -> RiskPrediction:
        row = np.asarray(list(values), dtype=float).reshape(1, -1)
        score = float(self.model.predict_proba(row)[0][1])
        importances = self.model.feature_importances_
        deltas = (row[0] - self.baseline) * importances
        scale = max(float(np.abs(deltas).sum()), 1.0)
        explanations = {
            name: float(delta / scale)
            for name, delta in zip(FEATURE_NAMES, deltas)
        }
        return RiskPrediction(risk_score=score, explanations=explanations)


risk_model = RiskModel()
