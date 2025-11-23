// Configuración de la API
const API_BASE_URL = '/api';

// Utilidades para manejar el token
const TokenManager = {
  getToken() {
    return localStorage.getItem('token');
  },
  
  setToken(token) {
    localStorage.setItem('token', token);
  },
  
  removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

// Función para hacer peticiones HTTP
async function apiRequest(endpoint, options = {}) {
  const token = TokenManager.getToken();
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };
  
  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {})
    }
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Manejar respuestas sin contenido
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() || 'Error en la petición' };
    }
    
    if (!response.ok) {
      // Si es error 401, redirigir a login
      if (response.status === 401) {
        TokenManager.removeToken();
        window.location.href = '/login.html';
      }
      throw new Error(data.msg || data.message || 'Error en la petición');
    }
    
    return data;
  } catch (error) {
    console.error('Error en API:', error);
    throw error;
  }
}

// Funciones de autenticación
const AuthAPI = {
  async login(username, password) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    if (data.token) {
      TokenManager.setToken(data.token);
      TokenManager.setUser({ 
        username, 
        role: data.role, 
        id: data.user?.id || data.user?._id 
      });
    }
    
    return data;
  },
  
  async setupAdmin() {
    return await apiRequest('/auth/setup-admin', {
      method: 'POST'
    });
  },
  
  logout() {
    TokenManager.removeToken();
    window.location.href = '/login.html';
  }
};

// Funciones de asistencia
const AttendanceAPI = {
  async checkIn() {
    return await apiRequest('/attendance/check-in', {
      method: 'POST'
    });
  },
  
  async checkOut() {
    return await apiRequest('/attendance/check-out', {
      method: 'POST'
    });
  },
  
  async getMyAttendance(startDate, endDate, page = 1, limit = 30) {
    const params = new URLSearchParams({ page, limit });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return await apiRequest(`/attendance/my-attendance?${params}`);
  },
  
  async getCurrentStatus() {
    return await apiRequest('/attendance/current-status');
  },
  
  async getAllAttendance(userId, startDate, endDate, page = 1, limit = 50) {
    const params = new URLSearchParams({ page, limit });
    if (userId) params.append('userId', userId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return await apiRequest(`/attendance/all?${params}`);
  },
  
  async updateAttendance(id, updates) {
    return await apiRequest(`/attendance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },
  
  async getGlobalReport(type, date) {
    const params = new URLSearchParams({ type, date });
    return await apiRequest(`/attendance/report/global?${params}`);
  }
};

// Funciones de usuarios (admin)
const UserAPI = {
  async createUser(userData) {
    return await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  
  async listUsers(q, role, page = 1, limit = 50) {
    const params = new URLSearchParams({ page, limit });
    if (q) params.append('q', q);
    if (role) params.append('role', role);
    
    return await apiRequest(`/users?${params}`);
  }
};

// Funciones de admin
const AdminAPI = {
  async createUser(userData) {
    return await apiRequest('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  
  async listUsers() {
    return await apiRequest('/admin/users');
  },
  
  async updateUser(id, updates) {
    return await apiRequest(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },
  
  async deleteUser(id) {
    return await apiRequest(`/admin/users/${id}`, {
      method: 'DELETE'
    });
  },
  
  async getUserAttendance(userId, startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return await apiRequest(`/admin/users/${userId}/attendance?${params}`);
  }
};

// Verificar autenticación y redirigir si es necesario
function requireAuth() {
  const token = TokenManager.getToken();
  if (!token) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

// Verificar rol de admin
function requireAdmin() {
  const user = TokenManager.getUser();
  if (!user || user.role !== 'admin') {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

