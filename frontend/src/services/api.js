// Centralized API service for the Leave Management System
// All API calls go through this file

const BASE_URL = 'http://localhost:8000';

// Helper: get CSRF token from cookies
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Helper: default headers
function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-CSRFToken': getCookie('csrftoken'),
  };
}

// Generic request handler
async function request(method, path, data = null) {
  const options = {
    method,
    headers: getHeaders(),
    credentials: 'include',
  };
  if (data) {
    options.body = JSON.stringify(data);
  }
  const response = await fetch(`${BASE_URL}${path}`, options);
  if (!response.ok) {
    let error;
    try {
      error = await response.json();
    } catch {
      error = { error: response.statusText };
    }
    throw error;
  }
  if (response.status === 204) return null;
  return response.json();
}

// =====================
//  AUTH
// =====================
export const authAPI = {
  login: (username, password) =>
    request('POST', '/accounts/api/login/', { username, password }),
  logout: () =>
    request('POST', '/accounts/api/logout/'),
  getProfile: () =>
    request('GET', '/accounts/api/me/'),
  updateProfile: (data) =>
    request('PUT', '/accounts/api/me/', data),
  changePassword: (old_password, new_password) =>
    request('POST', '/accounts/api/change-password/', { old_password, new_password }),
};

// =====================
//  USER MANAGEMENT
// =====================
export const usersAPI = {
  getAll: () =>
    request('GET', '/accounts/api/users/'),
  getById: (id) =>
    request('GET', `/accounts/api/users/${id}/`),
  create: (data) =>
    request('POST', '/accounts/api/users/', data),
  update: (id, data) =>
    request('PUT', `/accounts/api/users/${id}/`, data),
  delete: (id) =>
    request('DELETE', `/accounts/api/users/${id}/`),
  bulkDelete: (ids) =>
    request('POST', '/accounts/api/users/bulk-delete/', { user_ids: ids }),
};

// =====================
//  LEAVE TYPES
// =====================
export const leaveTypesAPI = {
  getAll: () =>
    request('GET', '/leave/api/types/'),
  create: (data) =>
    request('POST', '/leave/api/types/', data),
  update: (id, data) =>
    request('PUT', `/leave/api/types/${id}/`, data),
  delete: (id) =>
    request('DELETE', `/leave/api/types/${id}/`),
};

// =====================
//  LEAVE REQUESTS
// =====================
export const leaveAPI = {
  // Get list (filtered by role on backend)
  getAll: (statusFilter = null) => {
    const qs = statusFilter ? `?status=${statusFilter}` : '';
    return request('GET', `/leave/api/requests/${qs}`);
  },
  // Admin: get all leaves regardless of role
  adminGetAll: (statusFilter = null) => {
    const qs = statusFilter ? `?status=${statusFilter}` : '';
    return request('GET', `/leave/api/all/${qs}`);
  },
  // Create new leave request (employee)
  apply: (data) =>
    request('POST', '/leave/api/requests/', data),
  // Delete / cancel a leave
  cancel: (id) =>
    request('DELETE', `/leave/api/requests/${id}/`),
  // Manager: approve or reject
  managerAction: (id, action, comments = '') =>
    request('POST', `/leave/api/requests/${id}/manager-action/`, { action, comments }),
  // HR: final approve or reject
  hrAction: (id, action, comments = '') =>
    request('POST', `/leave/api/requests/${id}/hr-action/`, { action, comments }),
  // Get leave balance (defaults to current user)
  getBalance: (userId = null) => {
    const qs = userId ? `?user_id=${userId}` : '';
    return request('GET', `/leave/api/balance/${qs}`);
  },
};

// =====================
//  REPORTS & STATS
// =====================
export const reportsAPI = {
  getStats: () =>
    request('GET', '/reports/api/stats/'),
  getLeaveReport: () =>
    request('GET', '/reports/api/leave-report/'),
  getTeamReport: (department = null) => {
    const qs = department ? `?department=${department}` : '';
    return request('GET', `/reports/api/team-report/${qs}`);
  },
};
