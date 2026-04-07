/**
 * auth.js — AI Learning Platform Session Management
 * Handles JWT token storage, validation, and route protection.
 */

const AUTH = {
  TOKEN_KEY:   'ailearn_token',
  USER_KEY:    'ailearn_user',
  EMAIL_KEY:   'ailearn_email',
  PICTURE_KEY: 'ailearn_picture',
  BACKEND:     'http://localhost:8080',

  /** Save session after successful login */
  saveSession(token, name, email, picture) {
    localStorage.setItem(this.TOKEN_KEY,   token);
    localStorage.setItem(this.USER_KEY,    name    || '');
    localStorage.setItem(this.EMAIL_KEY,   email   || '');
    localStorage.setItem(this.PICTURE_KEY, picture || '');
    localStorage.setItem('ailearn_loggedIn', 'true');
  },

  /** Get stored JWT token */
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  /** Get stored user name */
  getUser() {
    return localStorage.getItem(this.USER_KEY) || 'Student';
  },

  /** Get stored email */
  getEmail() {
    return localStorage.getItem(this.EMAIL_KEY) || '';
  },

  /** Get stored profile picture URL */
  getPicture() {
    return localStorage.getItem(this.PICTURE_KEY) || '';
  },

  /** Returns true if a token exists in storage */
  isLoggedIn() {
    return !!localStorage.getItem(this.TOKEN_KEY);
  },

  /** Clear all session data */
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.EMAIL_KEY);
    localStorage.removeItem(this.PICTURE_KEY);
    localStorage.removeItem('ailearn_loggedIn');
    window.location.href = 'login.html';
  },

  /**
   * Verify the stored token with the backend.
   * Returns { valid, name, email, picture } or { valid: false }
   */
  async verifyWithBackend() {
    const token = this.getToken();
    if (!token) return { valid: false };
    try {
      const res = await fetch(`${this.BACKEND}/api/verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const data = await res.json();
      return data;
    } catch (e) {
      // Backend unreachable — allow cached session to continue
      return { valid: true, name: this.getUser(), email: this.getEmail() };
    }
  },

  /**
   * Protect a page — call this at top of any page requiring login.
   * If not logged in, redirects to login.html immediately.
   */
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.replace('login.html');
      return false;
    }
    return true;
  },

  /**
   * Render a user avatar/greeting in an element.
   * elementId: the ID of the element to update.
   */
  renderUserBadge(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const name    = this.getUser();
    const picture = this.getPicture();
    const initial = name.charAt(0).toUpperCase();
    if (picture) {
      el.innerHTML = `<img src="${picture}" alt="${name}"
        style="width:34px;height:34px;border-radius:50%;border:2px solid rgba(124,58,237,0.5);vertical-align:middle;margin-right:8px;">
        <span style="font-size:.9rem;font-weight:600;color:#f0f6fc">${name}</span>`;
    } else {
      el.innerHTML = `<div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#9333ea);
        display:inline-flex;align-items:center;justify-content:center;font-weight:700;color:white;font-size:.9rem;
        margin-right:8px;vertical-align:middle">${initial}</div>
        <span style="font-size:.9rem;font-weight:600;color:#f0f6fc">${name}</span>`;
    }
  }
};
