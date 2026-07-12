import { Navigate } from 'react-router-dom';

function isLoggedIn() {
  return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
}

// app pages: send visitors without a token to login
export function RequireAuth({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

// landing / login / signup: send already-logged-in users to their feed
export function RedirectIfAuthed({ children }) {
  return isLoggedIn() ? <Navigate to="/feed" replace /> : children;
}
