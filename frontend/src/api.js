/**
 * API service for SellerBoost AI backend communication.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Fetch health status of the backend API.
 */
export async function getHealth() {
  const response = await fetch(`${API_BASE_URL}/health`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Health check failed with status: ${response.status}`);
  }
  return response.json();
}

/**
 * Fetch model status and local Ollama availability.
 */
export async function getModelStatus() {
  const response = await fetch(`${API_BASE_URL}/model-status`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Model status check failed with status: ${response.status}`);
  }
  return response.json();
}

/**
 * Submit listing generation request to the backend.
 *
 * @param {Object} payload - { product_name, category, features, target_audience, price, language, platform, tone }
 * @returns {Promise<{ success: boolean, listing?: Object, model_used?: string, error?: string }>}
 */
export async function generateListing(payload) {
  const response = await fetch(`${API_BASE_URL}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.status === 422) {
      const errData = await response.json().catch(() => null);
      const detailMsg = errData?.detail
        ? (Array.isArray(errData.detail)
            ? errData.detail.map(d => `${d.loc?.slice(-1)[0]}: ${d.msg}`).join(', ')
            : JSON.stringify(errData.detail))
        : 'Validation error: Please check your input fields.';
      throw new Error(detailMsg);
    }
    throw new Error(`Server returned error status ${response.status}`);
  }

  return response.json();
}
