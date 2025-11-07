import authService from '../services/authService';

/**
 * Global API error handler
 * Checks for authentication errors and handles them appropriately
 */
export const handleApiResponse = async (response) => {
  // Check for authentication errors (401 Unauthorized)
  if (response.status === 401) {
    console.warn('Authentication failed - clearing auth data and redirecting to login');
    
    // Clear authentication data
    authService.logout();
    
    // Redirect to login page
    window.location.href = '/login';
    
    // Throw error to prevent further processing
    throw new Error('Authentication failed. Please login again.');
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

