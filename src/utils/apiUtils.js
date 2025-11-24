import authService from '../services/authService';

/**
 * Global API error handler
 * Checks for authentication errors and handles them appropriately
 */
export const handleApiResponse = async (response) => {
  // Check for authentication errors (401 Unauthorized)
  // 401 always means the token is invalid/expired
  if (response.status === 401) {
    console.warn('Authentication expired - clearing auth data and redirecting to login');
    
    // Clear authentication data
    authService.logout();
    
    // Show user-friendly message in Turkish
    alert('Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.');
    
    // Redirect to login page
    window.location.href = '/login';
    
    // Throw error to prevent further processing
    throw new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
  }
  
  // Check for 403 Forbidden - need to differentiate between token expiration and permission issues
  if (response.status === 403) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || '';
    
    console.log('403 Error received:', errorMessage); // Debug için
    
    // Check if this is specifically a PERMISSION error
    // Only if message clearly indicates it's about permissions, we DON'T logout
    const isPermissionError = 
      errorMessage.toLowerCase().includes('permission') ||
      errorMessage.toLowerCase().includes('access denied') ||
      errorMessage.toLowerCase().includes('yetkisiz') ||
      errorMessage.toLowerCase().includes('yetki') ||
      errorMessage.toLowerCase().includes('izin') ||
      errorMessage.toLowerCase().includes('forbidden');
    
    if (isPermissionError) {
      // This is a permission error, not token expiration
      // Just throw the error without logging out
      console.log('Permission error detected - not logging out');
      throw new Error(errorMessage || 'Bu işlemi gerçekleştirmek için yetkiniz yok.');
    } else {
      // Either no message, or message doesn't indicate permission issue
      // Assume token is expired - logout and redirect
      console.warn('403 without permission keywords - assuming token expired');
      
      // Clear authentication data
      authService.logout();
      
      // Show user-friendly message in Turkish
      alert('Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.');
      
      // Redirect to login page
      window.location.href = '/login';
      
      // Throw error to prevent further processing
      throw new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
    }
  }
  
  // Check for other errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `İstek başarısız oldu (${response.status})`);
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

