import { API_CONFIG } from '../config/api.config';

/**
 * Resolves an image URL from the API.
 * Handles:
 * - Full URLs (http/https)
 * - Base64 strings (data:)
 * - Relative paths (/uploads/...)
 */
export const resolveImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;

  // Handle base64
  if (url.startsWith('data:')) {
    return url;
  }

  // Handle full URLs
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Resolve relative paths
  // Assuming relative paths are served from the root domain of the API
  const baseUrl = API_CONFIG.BASE_URL.replace('/api/v1', '');
  const normalizedPath = url.startsWith('/') ? url : `/${url}`;
  
  return `${baseUrl}${normalizedPath}`;
};
