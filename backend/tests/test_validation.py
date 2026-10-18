"""
Automated tests for input validation and error handling.
These tests do NOT require a running Ollama instance.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services import _extract_json_from_response, _validate_listing, MalformedResponseError


client = TestClient(app)


# ── Health endpoint ────────────────────────────────────────────────────

class TestHealthEndpoint:
    def test_health_returns_200(self):
        resp = client.get("/api/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"
        assert data["service"] == "sellerboost-ai"


# ── Input validation ──────────────────────────────────────────────────

class TestInputValidation:
    """Verify that invalid inputs are rejected with 422."""

    VALID_PAYLOAD = {
        "product_name": "Test Product",
        "category": "Test Category",
        "features": "A test product with various features for testing purposes",
        "target_audience": "Test audience",
        "language": "english",
        "platform": "generic",
        "tone": "professional",
    }

    def test_missing_product_name(self):
        payload = {**self.VALID_PAYLOAD}
        del payload["product_name"]
        resp = client.post("/api/generate", json=payload)
        assert resp.status_code == 422

    def test_empty_product_name(self):
        payload = {**self.VALID_PAYLOAD, "product_name": ""}
        resp = client.post("/api/generate", json=payload)
        assert resp.status_code == 422

    def test_product_name_too_short(self):
        payload = {**self.VALID_PAYLOAD, "product_name": "A"}
        resp = client.post("/api/generate", json=payload)
        assert resp.status_code == 422

    def test_product_name_too_long(self):
        payload = {**self.VALID_PAYLOAD, "product_name": "A" * 200}
        resp = client.post("/api/generate", json=payload)
        assert resp.status_code == 422

    def test_missing_category(self):
        payload = {**self.VALID_PAYLOAD}
        del payload["category"]
        resp = client.post("/api/generate", json=payload)
        assert resp.status_code == 422

    def test_missing_features(self):
        payload = {**self.VALID_PAYLOAD}
        del payload["features"]
        resp = client.post("/api/generate", json=payload)
        assert resp.status_code == 422

    def test_features_too_short(self):
        payload = {**self.VALID_PAYLOAD, "features": "short"}
        resp = client.post("/api/generate", json=payload)
        assert resp.status_code == 422

    def test_missing_target_audience(self):
        payload = {**self.VALID_PAYLOAD}
        del payload["target_audience"]
        resp = client.post("/api/generate", json=payload)
        assert resp.status_code == 422

    def test_invalid_language(self):
        payload = {**self.VALID_PAYLOAD, "language": "french"}
        resp = client.post("/api/generate", json=payload)
        assert resp.status_code == 422

    def test_invalid_platform(self):
        payload = {**self.VALID_PAYLOAD, "platform": "tiktok"}
        resp = client.post("/api/generate", json=payload)
        assert resp.status_code == 422

    def test_invalid_tone(self):
        payload = {**self.VALID_PAYLOAD, "tone": "aggressive"}
        resp = client.post("/api/generate", json=payload)
        assert resp.status_code == 422

    def test_valid_payload_accepted(self):
        """Valid payload should not return 422 (may return error if Ollama isn't running)."""
        resp = client.post("/api/generate", json=self.VALID_PAYLOAD)
        assert resp.status_code == 200  # returns 200 even on Ollama errors (error in body)

    def test_optional_price_accepted(self):
        payload = {**self.VALID_PAYLOAD, "price": "₹999"}
        resp = client.post("/api/generate", json=payload)
        assert resp.status_code == 200


# ── JSON extraction ───────────────────────────────────────────────────

class TestJsonExtraction:
    """Test the _extract_json_from_response helper."""

    def test_clean_json(self):
        raw = '{"seo_title": "Test", "description": "Desc"}'
        result = _extract_json_from_response(raw)
        assert result["seo_title"] == "Test"

    def test_json_in_code_fence(self):
        raw = '```json\n{"seo_title": "Test"}\n```'
        result = _extract_json_from_response(raw)
        assert result["seo_title"] == "Test"

    def test_json_with_surrounding_text(self):
        raw = 'Here is the result:\n{"seo_title": "Test"}\nHope this helps!'
        result = _extract_json_from_response(raw)
        assert result["seo_title"] == "Test"

    def test_invalid_json_raises(self):
        with pytest.raises(MalformedResponseError):
            _extract_json_from_response("This is not JSON at all")

    def test_empty_string_raises(self):
        with pytest.raises(MalformedResponseError):
            _extract_json_from_response("")


# ── Listing validation ────────────────────────────────────────────────

class TestListingValidation:
    """Test the _validate_listing helper."""

    VALID_LISTING = {
        "seo_title": "Test Product - Premium Quality",
        "description": "A great product for everyone.",
        "sales_pitch": "Buy now!",
        "seo_keywords": ["test", "product", "quality"],
        "social_caption": "Check out this amazing product!",
        "hashtags": ["#test", "#product"],
    }

    def test_valid_listing(self):
        result = _validate_listing({**self.VALID_LISTING})
        assert result.seo_title == "Test Product - Premium Quality"

    def test_missing_field_raises(self):
        data = {**self.VALID_LISTING}
        del data["seo_title"]
        with pytest.raises(MalformedResponseError):
            _validate_listing(data)

    def test_empty_field_raises(self):
        data = {**self.VALID_LISTING, "description": ""}
        with pytest.raises(MalformedResponseError):
            _validate_listing(data)

    def test_string_keywords_converted_to_list(self):
        data = {**self.VALID_LISTING, "seo_keywords": "test, product, quality"}
        result = _validate_listing(data)
        assert isinstance(result.seo_keywords, list)
        assert len(result.seo_keywords) == 3

    def test_hashtags_get_prefix(self):
        data = {**self.VALID_LISTING, "hashtags": ["test", "product"]}
        result = _validate_listing(data)
        assert all(h.startswith("#") for h in result.hashtags)


# ── Model status endpoint ─────────────────────────────────────────────

class TestModelStatus:
    def test_model_status_returns_200(self):
        resp = client.get("/api/model-status")
        assert resp.status_code == 200
        data = resp.json()
        assert "ollama_reachable" in data
        assert "model_available" in data
        assert "model_name" in data
        assert "message" in data
