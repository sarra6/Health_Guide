/* ============================================
   HealthGuide AI — Main App Logic
   ============================================ */

const API_BASE = 'http://localhost:5000/api';

// ---- Auth Helpers ----
const getToken = () => localStorage.getItem('hg_token');
const getUser = () => JSON.parse(localStorage.getItem('hg_user') || 'null');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

async function apiPost(url, data, useAuth = false) {
  const headers = useAuth ? authHeaders() : { 'Content-Type': 'application/json' };
  const res = await fetch(API_BASE + url, { method: 'POST', headers, body: JSON.stringify(data) });
  return res.json();
}

async function apiGet(url) {
  const res = await fetch(API_BASE + url, { headers: authHeaders() });
  return res.json();
}

// ---- Modal Management ----
function showModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
function switchModal(from, to) { closeModal(from); showModal(to); }

// ---- Auth UI ----
function updateNavUI() {
  const user = getUser();
  const navAuth = document.getElementById('navAuth');
  const navUser = document.getElementById('navUser');
  const navDashboard = document.getElementById('navDashboard');
  const greeting = document.getElementById('userGreeting');

  if (user) {
    if (navAuth) navAuth.style.display = 'none';
    if (navUser) navUser.style.display = 'flex';
    if (navDashboard) navDashboard.style.display = 'block';
    if (greeting) greeting.textContent = `👋 ${user.name}`;
  } else {
    if (navAuth) navAuth.style.display = 'flex';
    if (navUser) navUser.style.display = 'none';
    if (navDashboard) navDashboard.style.display = 'none';
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  const err = document.getElementById('loginError');
  err.style.display = 'none';
  btn.innerHTML = '<span class="loader"></span>';
  btn.disabled = true;

  try {
    const res = await apiPost('/auth/login', {
      email: document.getElementById('loginEmail').value,
      password: document.getElementById('loginPassword').value
    });

    if (res.token) {
      localStorage.setItem('hg_token', res.token);
      localStorage.setItem('hg_user', JSON.stringify(res.user));
      closeModal('loginModal');
      updateNavUI();
      // Redirect based on role
      if (res.user.role === 'doctor' || res.user.role === 'admin') {
        location.href = 'pages/doctor-dashboard.html';
      } else {
        location.href = 'pages/assistant.html';
      }
    } else {
      err.textContent = res.error || 'Login failed.';
      err.style.display = 'block';
    }
  } catch {
    err.textContent = 'Network error. Please try again.';
    err.style.display = 'block';
  }

  btn.innerHTML = 'Login';
  btn.disabled = false;
}

async function handleRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('registerBtn');
  const err = document.getElementById('registerError');
  err.style.display = 'none';
  btn.innerHTML = '<span class="loader"></span>';
  btn.disabled = true;

  try {
    const res = await apiPost('/auth/register', {
      name: document.getElementById('regName').value,
      email: document.getElementById('regEmail').value,
      password: document.getElementById('regPassword').value,
      role: document.getElementById('regRole').value
    });

    if (res.token) {
      localStorage.setItem('hg_token', res.token);
      localStorage.setItem('hg_user', JSON.stringify(res.user));
      closeModal('registerModal');
      updateNavUI();
      location.href = 'pages/assistant.html';
    } else {
      const msg = res.errors ? res.errors.map(e => e.msg).join(', ') : res.error;
      err.textContent = msg || 'Registration failed.';
      err.style.display = 'block';
    }
  } catch {
    err.textContent = 'Network error. Please try again.';
    err.style.display = 'block';
  }

  btn.innerHTML = 'Create Account';
  btn.disabled = false;
}

function logout() {
  localStorage.removeItem('hg_token');
  localStorage.removeItem('hg_user');
  location.href = '/';
}

// Keyboard: close modal with Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
  }
});

// Init
document.addEventListener('DOMContentLoaded', updateNavUI);
