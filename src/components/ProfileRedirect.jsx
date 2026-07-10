import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { usersAPI } from '../services/api';

function readStoredHandle() {
  try {
    const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
    return raw ? JSON.parse(raw)?.handle ?? null : null;
  } catch {
    return null;
  }
}

// /profile is an alias, redirect to the canonical /user/<handle> URL
// the handle usually comes from the stored session, fall back to /me if it is missing
export default function ProfileRedirect() {
  const [handle, setHandle] = useState(readStoredHandle);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (handle) return;
    usersAPI.getMe().then((d) => setHandle(d.user.handle)).catch(() => setFailed(true));
  }, [handle]);

  if (handle) return <Navigate to={`/user/${handle}`} replace />;
  if (failed) return <Navigate to="/feed" replace />;
  return null;
}
