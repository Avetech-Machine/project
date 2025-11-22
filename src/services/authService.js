const API_BASE_URL = 'https://avitech-backend-production.up.railway.app';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
  }

  async login(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Giriş başarısız');
      }

      const data = await response.json();
      
      // Store token temporarily to make authenticated request
      this.token = data.token;
      const userId = data.id; // Get user ID from login response
      localStorage.setItem('authToken', this.token);

      console.log('Login successful, user ID:', userId);

      // Fetch all users from /api/users endpoint and find the current user
      try {
        const usersResponse = await fetch(`${API_BASE_URL}/api/users`, {
          method: 'GET',
          headers: this.getAuthHeaders(),
        });

        if (usersResponse.ok) {
          const allUsers = await usersResponse.json();
          console.log('Fetched all users:', allUsers);
          
          // Find the current user by ID in the users array
          const currentUser = allUsers.find(u => u.id === userId);
          
          if (currentUser) {
            console.log('Found current user:', currentUser);
            console.log('User role:', currentUser.role);
            
            // Store complete user data including role
            this.user = {
              id: data.id,
              username: data.username,
              email: data.email,
              firstName: data.firstName,
              lastName: data.lastName,
              role: currentUser.role || 'VIEWER', // Get role from users endpoint
            };
          } else {
            console.warn('User not found in users list, defaulting to VIEWER');
            // Fallback if user not found in list
            this.user = {
              id: data.id,
              username: data.username,
              email: data.email,
              firstName: data.firstName,
              lastName: data.lastName,
              role: 'VIEWER',
            };
          }
        } else {
          console.warn('Failed to fetch users list, defaulting to VIEWER');
          // Fallback if users fetch fails
          this.user = {
            id: data.id,
            username: data.username,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            role: 'VIEWER',
          };
        }
      } catch (fetchError) {
        console.error('Could not fetch user role, defaulting to VIEWER:', fetchError);
        // Fallback user data without role
        this.user = {
          id: data.id,
          username: data.username,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'VIEWER',
        };
      }

      console.log('Final user object with role:', this.user);
      localStorage.setItem('user', JSON.stringify(this.user));

      return this.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  isAuthenticated() {
    return !!this.token;
  }

  getToken() {
    return this.token;
  }

  getUser() {
    return this.user;
  }

  getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }
}

export default new AuthService();
