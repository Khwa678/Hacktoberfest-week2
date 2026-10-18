"""
Pydantic models for request validation and response schemas.
"""

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


# ── Enums ──────────────────────────────────────────────────────────────

class Language(str, Enum):
    ENGLISH = "english"
    HINDI = "hindi"


class Platform(str, Enum):
    INSTAGRAM = "instagram"
    WHATSAPP = "whatsapp"
    GENERIC = "generic"


class Tone(str, Enum):
    PROFESSIONAL = "professional"
    FRIENDLY = "friendly"
    PREMIUM = "premium"


# ── Request ────────────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    """Validated product listing generation request."""

    product_name: str = Field(
        ...,
        min_length=2,
        max_length=150,
        description="Name of the product",
        examples=["Handwoven Banarasi Silk Saree"],
    )
    category: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Product category",
        examples=["Fashion & Textiles"],
    )
    features: str = Field(
        ...,
        min_length=10,
        max_length=2000,
        description="Product features, materials, and details",
        examples=["Pure silk, handwoven by local artisans, zari border, lightweight"],
    )
    target_audience: str = Field(
        ...,
        min_length=2,
        max_length=200,
        description="Who this product is for",
        examples=["Women aged 25-55 who appreciate traditional Indian fashion"],
    )
    price: Optional[str] = Field(
        None,
        max_length=50,
        description="Selling price (optional)",
        examples=["₹3,499"],
    )
    language: Language = Field(
        Language.ENGLISH,
        description="Output language",
    )
    platform: Platform = Field(
        Platform.GENERIC,
        description="Target selling platform",
    )
    tone: Tone = Field(
        Tone.PROFESSIONAL,
        description="Writing tone",
    )


# ── Response ───────────────────────────────────────────────────────────

class GeneratedListing(BaseModel):
    """Structured AI-generated product listing."""

    seo_title: str = Field(..., description="SEO-friendly product title")
    description: str = Field(..., description="Full product description")
    sales_pitch: str = Field(..., description="Short sales pitch / tagline")
    seo_keywords: list[str] = Field(..., description="Relevant SEO keywords")
    social_caption: str = Field(..., description="Platform-specific social media caption")
    hashtags: list[str] = Field(..., description="Relevant hashtags")


class GenerateResponse(BaseModel):
    """API response wrapper for generation results."""

    success: bool
    listing: Optional[GeneratedListing] = None
    model_used: Optional[str] = None
    error: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response."""

    status: str
    service: str


class ModelStatusResponse(BaseModel):
    """Model availability status response."""

    ollama_reachable: bool
    model_available: bool
    model_name: str
    message: str
