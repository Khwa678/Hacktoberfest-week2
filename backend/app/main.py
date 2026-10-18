"""
SellerBoost AI — FastAPI application entry point.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routes import router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("sellerboost-ai")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for application startup and shutdown."""
    logger.info(
        "SellerBoost AI backend initialized | model=%s | ollama_url=%s | frontend=%s",
        settings.ollama_model,
        settings.ollama_base_url,
        settings.frontend_origin,
    )
    yield
    logger.info("SellerBoost AI backend shutting down.")


app = FastAPI(
    title="SellerBoost AI",
    description="Local-First AI Listing Studio for Small Sellers",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — strictly allow only the configured frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(router)
