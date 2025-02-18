import API_BASE_URL from './apiConfig.js';

class BaseRestAPIUtil {
  constructor(authRequired = true) {
    this.apiBaseUrl = API_BASE_URL;
    this.authRequired = authRequired;

    // Automatically wrap methods with the authorization handler
    this.get = this.withAuthCheck(this.get.bind(this));
    this.post = this.withAuthCheck(this.post.bind(this));
    this.put = this.withAuthCheck(this.put.bind(this));
    this.patch = this.withAuthCheck(this.patch.bind(this));
    this.delete = this.withAuthCheck(this.delete.bind(this));
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isAuthenticated() {
    return this.getToken() !== null;
  }

  handleUnauthorized() {
    if (this.authRequired && !this.isAuthenticated()) {
      alert('Unauthorized access. Please log in.');
      window.location.href = '/';
      throw new Error('Unauthorized access');
    }
  }

  withAuthCheck(fn) {
    return async (...args) => {
      this.handleUnauthorized();
      return await fn(...args);
    };
  }

  async request(endpoint, method = 'GET', data = null, customHeaders = {}) {
    const url = `${this.apiBaseUrl}${endpoint}`;

    const headers = {
        'Content-Type': 'application/json',
        ...customHeaders,
    };

    if (this.authRequired) {
        const token = this.getToken();
        if (!token) {
            throw new Error('Unauthorized: No token found');
        }
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers,
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);

        const responseData = await response.json().catch(() => {
            throw new Error('Invalid JSON response');
        });

        if (!response.ok) {
            // Handle HTTP error responses
            const errorMessage = responseData.message || 'Request failed';
            throw new Error(`${response.status} - ${errorMessage}`);
        }

        return responseData;
    } catch (error) {
        throw error;
    }
  }


  get(endpoint, customHeaders = {}) {
    return this.request(endpoint, 'GET', null, customHeaders);
  }

  post(endpoint, data, customHeaders = {}) {
    return this.request(endpoint, 'POST', data, customHeaders);
  }

  put(endpoint, data, customHeaders = {}) {
    return this.request(endpoint, 'PUT', data, customHeaders);
  }

  patch(endpoint, data, customHeaders = {}) {
    return this.request(endpoint, 'PATCH', data, customHeaders);
  }

  delete(endpoint, customHeaders = {}) {
    return this.request(endpoint, 'DELETE', null, customHeaders);
  }
}

export const RestAPIUtil = new BaseRestAPIUtil(true);
export const NonAuthenticatedRestAPIUtil = new BaseRestAPIUtil(false);