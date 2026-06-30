import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import './AuthPages.css';

function validatePassword(password) {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return 'Password must contain at least one special character.';
  return null;
}

function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ handle: '', displayName: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => {
      const updated = { ...f, [name]: value };
      if (name === 'password') {
        setPasswordError(validatePassword(value) || '');
        setConfirmError(updated.confirm && value !== updated.confirm ? 'Passwords do not match.' : '');
      }
      if (name === 'confirm') {
        setConfirmError(value !== updated.password ? 'Passwords do not match.' : '');
      }
      return updated;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const passwordError = validatePassword(form.password);
    if (passwordError) return setError(passwordError);

    if (form.password !== form.confirm) return setError('Passwords do not match.');

    setLoading(true);
    try {
      const data = await authAPI.signup({
        handle: form.handle,
        displayName: form.displayName,
        email: form.email,
        password: form.password,
      });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/feed');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <header className="nav">
        <Link to="/" className="logo">Binge<span>Feed</span>
          <svg className="play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        </Link>
      </header>

      <main className="auth-container">
        <h1 className="auth-title">Create your account</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="displayName">Full Name:</label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              value={form.displayName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="handle">Username:</label>
            <input
              id="handle"
              name="handle"
              type="text"
              value={form.handle}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="password">
              Password:
              <span
                className="tooltip-wrapper"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <span className="tooltip-icon">?</span>
                {showTooltip && (
                  <span className="tooltip-box">
                    Password must have:<br />
                    • At least 8 characters<br />
                    • At least one number<br />
                    • At least one special character
                  </span>
                )}
              </span>
            </label>
            <div className="input-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <button type="button" className="show-btn" onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {passwordError && <p className="field-error">{passwordError}</p>}
          </div>

          <div className="field">
            <label htmlFor="confirm">Confirm Password:</label>
            <div className="input-wrapper">
              <input
                id="confirm"
                name="confirm"
                type={showConfirm ? 'text' : 'password'}
                value={form.confirm}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <button type="button" className="show-btn" onClick={() => setShowConfirm((v) => !v)}>
                {showConfirm ? 'Hide' : 'Show'}
              </button>
            </div>
            {confirmError && <p className="field-error">{confirmError}</p>}
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Sign Up'}
          </button>

          <div className="divider"><span>OR</span></div>

          <p className="switch-link">
            <Link to="/login">Already have an account? Log in</Link>
          </p>
        </form>
      </main>
    </div>
  );
}

export default SignUpPage;
