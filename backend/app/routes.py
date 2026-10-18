"""
API routes for SellerBoost AI.
"""

import logging

from fastapi import APIRouter, HTTPException

from .config import settings
from .models import (
    GenerateRequest,
    GenerateResponse,
    GeneratedListing,
    HealthResponse,
    ModelStatusResponse,
)
from .prompts import build_generation_prompt
from .services import (
    OllamaServiceError,
    ModelNotFoundError,
    MalformedResponseError,
    check_model_available,
    check_ollama_health,
    generate_listing,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api")


# ── Health ─────────────────────────────────────────────────────────────

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Basic backend health check."""
    return HealthResponse(status="healthy", service="sellerboost-ai")


# ── Model Status ───────────────────────────────────────────────────────

@router.get("/model-status", response_model=ModelStatusResponse)
async def model_status():
    """Check Ollama connectivity and model availability."""
    ollama_ok = await check_ollama_health()

    if not ollama_ok:
        return ModelStatusResponse(
            ollama_reachable=False,
            model_available=False,
            model_name=settings.ollama_model,
            message=(
                "Cannot reach Ollama. Make sure Ollama is installed and running. "
                "Start it with: ollama serve"
            ),
        )

    model_ok = await check_model_available()

    if not model_ok:
        return ModelStatusResponse(
            ollama_reachable=True,
            model_available=False,
            model_name=settings.ollama_model,
            message=(
                f"Ollama is running but model '{settings.ollama_model}' is not available. "
                f"Pull it with: ollama pull {settings.ollama_model}"
            ),
        )

    return ModelStatusResponse(
        ollama_reachable=True,
        model_available=True,
        model_name=settings.ollama_model,
        message=f"Ready — using model '{settings.ollama_model}'.",
    )


# ── Generate ───────────────────────────────────────────────────────────

@router.post("/generate", response_model=GenerateResponse)
async def generate(request: GenerateRequest):
    """
    Generate a product listing using the local AI model.

    Constructs a prompt from validated inputs, calls the Ollama model,
    parses and validates the response, and returns structured results.
    """
    prompt = build_generation_prompt(
        product_name=request.product_name,
        category=request.category,
        features=request.features,
        target_audience=request.target_audience,
        price=request.price,
        language=request.language.value,
        platform=request.platform.value,
        tone=request.tone.value,
    )

    try:
        listing = await generate_listing(prompt)
        return GenerateResponse(
            success=True,
            listing=listing,
            model_used=settings.ollama_model,
        )

    except OllamaServiceError as e:
        logger.warning("Ollama service error: %s", str(e))
        return GenerateResponse(
            success=False,
            error=str(e),
        )

    except ModelNotFoundError as e:
        logger.warning("Model not found: %s", str(e))
        return GenerateResponse(
            success=False,
            error=str(e),
        )

    except MalformedResponseError as e:
        logger.warning("Malformed response: %s", str(e))
        return GenerateResponse(
            success=False,
            error=str(e),
        )

    except Exception as e:
        # Catch-all: log full error internally, return safe message to user
        logger.exception("Unexpected error during generation")
        return GenerateResponse(
            success=False,
            error="An unexpected error occurred during generation. Please try again.",
        )
