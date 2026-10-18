"""
Prompt construction for product listing generation.
Builds structured prompts based on user inputs.
"""


def build_generation_prompt(
    product_name: str,
    category: str,
    features: str,
    target_audience: str,
    price: str | None,
    language: str,
    platform: str,
    tone: str,
) -> str:
    """
    Construct a controlled prompt for the Ollama model.

    The prompt instructs the model to return valid JSON matching
    the GeneratedListing schema. It incorporates all user inputs
    and constrains the output format.
    """
    price_line = f"Selling Price: {price}" if price else "Selling Price: Not specified"

    platform_guidance = {
        "instagram": "Write the social caption optimized for Instagram with emojis and line breaks. Keep it engaging and visual.",
        "whatsapp": "Write the social caption for WhatsApp sharing — concise, personal, easy to forward as a message.",
        "generic": "Write the social caption suitable for any online marketplace or general social media.",
    }

    tone_guidance = {
        "professional": "Use a professional, trustworthy, business-appropriate tone.",
        "friendly": "Use a warm, friendly, conversational tone that feels approachable.",
        "premium": "Use a luxurious, aspirational, premium brand tone.",
    }

    language_instruction = (
        "Write ALL output text in Hindi (Devanagari script). Keywords and hashtags can be in English or Hindi as appropriate."
        if language == "hindi"
        else "Write all output text in English."
    )

    return f"""You are an expert e-commerce copywriter and SEO specialist for Indian small businesses.

Generate a complete product listing based on the following product information:

Product Name: {product_name}
Category: {category}
Features & Materials: {features}
Target Audience: {target_audience}
{price_line}
Platform: {platform}
Tone: {tone}

Instructions:
- {language_instruction}
- {tone_guidance.get(tone, tone_guidance["professional"])}
- {platform_guidance.get(platform, platform_guidance["generic"])}
- Generate an SEO-optimized product title (not just the product name — make it descriptive and searchable).
- Write a compelling product description (3-5 sentences).
- Write a short sales pitch / tagline (1-2 sentences).
- Provide 6-10 relevant SEO keywords as a list.
- Write a platform-specific social media caption.
- Provide 5-8 relevant hashtags (with # prefix).

You MUST respond with ONLY valid JSON in exactly this format, with no extra text before or after:
{{
  "seo_title": "...",
  "description": "...",
  "sales_pitch": "...",
  "seo_keywords": ["keyword1", "keyword2", "..."],
  "social_caption": "...",
  "hashtags": ["#hashtag1", "#hashtag2", "..."]
}}

Respond with ONLY the JSON object. Do not include any explanation, markdown formatting, or code fences."""
