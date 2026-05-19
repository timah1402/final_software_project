const API_BASE = '/api';

function getToken() { return localStorage.getItem('gym_token'); }

function guard() {
  if (!getToken()) window.location.href = '/';
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    localStorage.clear();
    window.location.href = '/';
    return;
  }

  return res.json();
}

const api = {
  auth: {
    login: (email, password) => request('POST', '/auth/login', { email, password }),
  },
  members: {
    list:        ()           => request('GET',    '/members'),
    get:         id           => request('GET',    `/members/${id}`),
    create:      data         => request('POST',   '/members', data),
    update:      (id, data)   => request('PUT',    `/members/${id}`, data),
    remove:      id           => request('DELETE', `/members/${id}`),
    memberships: id           => request('GET',    `/members/${id}/memberships`),
    bookings:    id           => request('GET',    `/members/${id}/bookings`),
    assignPlan:  (id, plan_id)=> request('POST',   `/members/${id}/memberships`, { plan_id }),
  },
  sessions: {
    list:       ()          => request('GET',    '/sessions'),
    create:     data        => request('POST',   '/sessions', data),
    update:     (id, data)  => request('PUT',    `/sessions/${id}`, data),
    remove:     id          => request('DELETE', `/sessions/${id}`),
    attendance: id          => request('GET',    `/sessions/${id}/attendance`),
  },
  plans: {
    list:   ()          => request('GET',    '/plans'),
    create: data        => request('POST',   '/plans', data),
    update: (id, data)  => request('PUT',    `/plans/${id}`, data),
    remove: id          => request('DELETE', `/plans/${id}`),
  },
  bookings: {
    create: (member_id, session_id) => request('POST', '/bookings', { member_id, session_id }),
    cancel: id                      => request('PUT',  `/bookings/${id}/cancel`),
  },
  memberships: {
    renew: id => request('PUT', `/memberships/${id}/renew`),
  },
  attendance: {
    mark: (booking_id, status) => request('POST', '/attendance', { booking_id, status }),
  },
  reports: {
    memberships: () => request('GET', '/reports/memberships'),
    sessions:    () => request('GET', '/reports/sessions'),
  },
  staff: {
    list:   ()         => request('GET',    '/staff'),
    create: data       => request('POST',   '/staff', data),
    remove: id         => request('DELETE', `/staff/${id}`),
  },
};
