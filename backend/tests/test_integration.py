"""
Integration tests that require a running Ollama instance with the configured model.

These tests are SKIPPED by default unless the SELLERBOOST_INTEGRATION environment
variable is set to "1". This clearly separates them from the automated unit tests.

Run with:
    SELLERBOOST_INTEGRATION=1 pytest tests/test_integration.py -v
"""

import os
import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

# Skip all tests in this module unless integration flag is set
pytestmark = pytest.mark.skipif(
    os.environ.get("SELLERBOOST_INTEGRATION") != "1",
    reason="Integration tests require SELLERBOOST_INTEGRATION=1 and a running Ollama instance",
)


class TestRealModelGeneration:
    """Integration tests against the real local model."""

    PAYLOAD = {
        "product_name": "Handmade Jute Tote Bag",
        "category": "Bags & Accessories",
        "features": "Eco-friendly jute material, handmade by artisans in West Bengal, cotton lining, reinforced handles, fits a 15-inch laptop",
        "target_audience": "Eco-conscious urban professionals aged 25-40",
        "price": "₹799",
        "language": "english",
        "platform": "instagram",
        "tone": "friendly",
    }

    def test_model_status_shows_available(self):
        """The model should be available when integration tests run."""
        resp = client.get("/api/model-status")
        data = resp.json()
        assert data["ollama_reachable"] is True, "Ollama must be running for integration tests"
        assert data["model_available"] is True, f"Model must be available: {data['message']}"

    def test_successful_generation(self):
        """Full end-to-end generation should succeed."""
        resp = client.post("/api/generate", json=self.PAYLOAD)
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True, f"Generation failed: {data.get('error')}"
        assert data["listing"] is not None
        assert data["model_used"] is not None

        listing = data["listing"]
        assert listing["seo_title"]
        assert listing["description"]
        assert listing["sales_pitch"]
        assert len(listing["seo_keywords"]) > 0
        assert listing["social_caption"]
        assert len(listing["hashtags"]) > 0

    def test_hindi_generation(self):
        """Hindi generation should also succeed."""
        payload = {**self.PAYLOAD, "language": "hindi"}
        resp = client.post("/api/generate", json=payload)
        data = resp.json()
        assert data["success"] is True, f"Hindi generation failed: {data.get('error')}"
        assert data["listing"] is not None
