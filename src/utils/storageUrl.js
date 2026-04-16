/**
 * Convert storage paths to frontend-accessible URLs through the backend server
 * @param {string} url - The URL from the API (e.g., "/storage/profiles/students/7/photo.png" or "profiles/...")
 * @returns {string} The converted absolute URL
 */
export function getStorageUrl(url) {
  if (!url) return null;

  const baseUrl = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || '';
  const safeBaseUrl = baseUrl.replace(/\/+$/, '');

  const normalizePath = (rawPath) => {
    if (!rawPath) return null;

    let cleanPath = rawPath;

    // Clean up development specific proxy paths
    if (cleanPath.startsWith('/backend')) {
      cleanPath = cleanPath.replace(/^\/backend/, '');
    }
    if (cleanPath.startsWith('/synthese_back')) {
      cleanPath = cleanPath.replace(/^\/synthese_back/, '');
    }

    // Ensure it has /storage prefix
    if (!cleanPath.startsWith('/storage')) {
      cleanPath = cleanPath.startsWith('/') ? `/storage${cleanPath}` : `/storage/${cleanPath}`;
    }

    // Fallback if safeBaseUrl empty but usually in CRA with our env it's populated.
    return safeBaseUrl ? `${safeBaseUrl}${cleanPath}` : cleanPath;
  };

  // Blob URL - should be passed through.
  if (url.startsWith('blob:')) {
    return url;
  }

  // Absolute URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url);
      if (parsed.pathname.startsWith('/backend') || parsed.pathname.startsWith('/synthese_back')) {
        return normalizePath(parsed.pathname + parsed.search);
      }
      return url;
    } catch {
      return url;
    }
  }

  return normalizePath(url);
}
