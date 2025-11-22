import authService from '../services/authService';

/**
 * Global API error handler
 * Checks for authentication errors and handles them appropriately
 */
export const handleApiResponse = async (response) => {
  // Check for authentication errors (401 Unauthorized only)
  // 401 means the token is invalid/expired, so we should log out
  if (response.status === 401) {
    console.warn('Authentication expired - clearing auth data and redirecting to login');
    
    // Clear authentication data
    authService.logout();
    
    // Redirect to login page
    window.location.href = '/login';
    
    // Throw error to prevent further processing
    throw new Error('Authentication failed. Please login again.');
  }
  
  // Check for authorization errors (403 Forbidden)
  // 403 means the user is authenticated but doesn't have permission
  // Don't log out, just throw an error that can be displayed
  if (response.status === 403) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'You do not have permission to perform this action.');
  }
  
  // Check for other errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  
  return response;
};

/**
 * Wrapper for fetch that includes global error handling
 */
export const fetchWithAuth = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    await handleApiResponse(response);
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

