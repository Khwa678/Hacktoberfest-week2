"""
Ollama service — handles all communication with the local model runtime.
"""

import json
import re
import logging

import httpx

from .config import settings
from .models import GeneratedListing

logger = logging.getLogger(__name__)


class OllamaServiceError(Exception):
    """Raised when the Ollama service is unreachable or returns an error."""
    pass


class ModelNotFoundError(Exception):
    """Raised when the configured model is not available in Ollama."""
    pass


class MalformedResponseError(Exception):
    """Raised when the model returns a response that can't be parsed."""
    pass


async def check_ollama_health() -> bool:
    """Check whether the Ollama service is reachable."""
    try:
        async with httpx.AsyncClient(
            timeout=httpx.Timeout(settings.ollama_connect_timeout)
        ) as client:
            resp = await client.get(f"{settings.ollama_base_url}/api/tags")
            return resp.status_code == 200
    except (httpx.ConnectError, httpx.TimeoutException, httpx.HTTPError):
        return False


async def check_model_available() -> bool:
    """Check whether the configured model is pulled in Ollama."""
    try:
        async with httpx.AsyncClient(
            timeout=httpx.Timeout(settings.ollama_connect_timeout)
        ) as client:
            resp = await client.get(f"{settings.ollama_base_url}/api/tags")
            if resp.status_code != 200:
                return False
            data = resp.json()
            models = data.get("models", [])
            model_names = [m.get("name", "") for m in models]
            configured = settings.ollama_model
            # Check exact match or match without tag
            for name in model_names:
                if name == configured or name.startswith(f"{configured}:") or configured.startswith(f"{name.split(':')[0]}"):
                    return True
                # Also handle "gemma3:4b" matching "gemma3:4b"
                if name == configured:
                    return True
            # Fallback: check if base name matches
            configured_base = configured.split(":")[0]
            for name in model_names:
                name_base = name.split(":")[0]
                if name_base == configured_base:
                    return True
            return False
    except (httpx.ConnectError, httpx.TimeoutException, httpx.HTTPError):
        return False


def _extract_json_from_response(text: str) -> dict:
    """
    Extract JSON from model response text.
    Handles cases where the model wraps JSON in markdown code fences
    or adds extra text around it.
    """
    # Try direct JSON parse first
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try to extract from markdown code fences
    code_fence_pattern = r"```(?:json)?\s*\n?(.*?)\n?```"
    matches = re.findall(code_fence_pattern, text, re.DOTALL)
    for match in matches:
        try:
            return json.loads(match.strip())
        except json.JSONDecodeError:
            continue

    # Try to find JSON object in the text
    brace_start = text.find("{")
    brace_end = text.rfind("}")
    if brace_start != -1 and brace_end != -1 and brace_end > brace_start:
        candidate = text[brace_start : brace_end + 1]
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            pass

    raise MalformedResponseError(
        "The AI model returned a response that could not be parsed as valid JSON. "
        "Please try regenerating."
    )


def _validate_listing(data: dict) -> GeneratedListing:
    """Validate parsed JSON against the GeneratedListing schema."""
    required_fields = [
        "seo_title",
        "description",
        "sales_pitch",
        "seo_keywords",
        "social_caption",
        "hashtags",
    ]

    missing = [f for f in required_fields if f not in data or not data[f]]
    if missing:
        raise MalformedResponseError(
            f"The AI response is missing required fields: {', '.join(missing)}. "
            "Please try regenerating."
        )

    # Ensure list fields are actually lists
    if isinstance(data.get("seo_keywords"), str):
        data["seo_keywords"] = [k.strip() for k in data["seo_keywords"].split(",") if k.strip()]
    if isinstance(data.get("hashtags"), str):
        data["hashtags"] = [h.strip() for h in data["hashtags"].split(",") if h.strip()]

    # Ensure hashtags have # prefix
    data["hashtags"] = [
        h if h.startswith("#") else f"#{h}" for h in data["hashtags"]
    ]

    try:
        return GeneratedListing(**data)
    except Exception as e:
        raise MalformedResponseError(
            f"The AI response could not be validated: {str(e)}. "
            "Please try regenerating."
        )


async def generate_listing(prompt: str) -> GeneratedListing:
    """
    Send a prompt to the Ollama model and return a validated GeneratedListing.

    Raises:
        OllamaServiceError: If Ollama is unreachable.
        ModelNotFoundError: If the model is not available.
        MalformedResponseError: If the response can't be parsed/validated.
    """
    request_body = {
        "model": settings.ollama_model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "top_p": 0.9,
        },
    }

    try:
        async with httpx.AsyncClient(
            timeout=httpx.Timeout(
                connect=settings.ollama_connect_timeout,
                read=settings.ollama_generate_timeout,
                write=settings.ollama_connect_timeout,
                pool=settings.ollama_connect_timeout,
            )
        ) as client:
            resp = await client.post(
                f"{settings.ollama_base_url}/api/generate",
                json=request_body,
            )
    except httpx.ConnectError:
        raise OllamaServiceError(
            "Cannot connect to Ollama. Please ensure Ollama is running "
            f"at {settings.ollama_base_url}. Run 'ollama serve' to start it."
        )
    except httpx.TimeoutException:
        raise OllamaServiceError(
            "The AI model took too long to respond. This may happen with "
            "limited hardware. Try again or use a smaller model."
        )
    except httpx.HTTPError as e:
        raise OllamaServiceError(f"HTTP error communicating with Ollama: {type(e).__name__}")

    if resp.status_code == 404:
        raise ModelNotFoundError(
            f"Model '{settings.ollama_model}' is not available. "
            f"Pull it with: ollama pull {settings.ollama_model}"
        )

    if resp.status_code != 200:
        raise OllamaServiceError(
            f"Ollama returned status {resp.status_code}. "
            "Check Ollama logs for details."
        )

    try:
        response_data = resp.json()
    except json.JSONDecodeError:
        raise MalformedResponseError("Ollama returned an invalid response format.")

    raw_text = response_data.get("response", "")
    if not raw_text or not raw_text.strip():
        raise MalformedResponseError(
            "The AI model returned an empty response. Please try again."
        )

    logger.debug("Raw model response: %s", raw_text[:500])

    parsed = _extract_json_from_response(raw_text)
    listing = _validate_listing(parsed)
    return listing
