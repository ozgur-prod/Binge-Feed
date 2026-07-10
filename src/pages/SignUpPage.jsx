import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { authAPI, saveSession } from '../services/api';
import { PlayIcon, XIcon } from '../components/icons';
import './AuthPages.css';
import '../components/ForgotPasswordModal.css';

function validatePassword(password) {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) return 'Password must contain at least one special character.';
  return null;
}

function VerifyModal({ email, onSuccess, onClose }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleVerify(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authAPI.verifySignup({ email, code });
      onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    try {
      await authAPI.signupRequest({ email, _resend: true });
    } catch (err) {
      setError(err.message);
    }
  }

  return createPortal(
    <div className="modal-overlay">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><XIcon /></button>
        <h2 className="modal-title">Verify your email</h2>
        <p className="modal-subtitle">We sent a 6-digit code to <strong>{email}</strong></p>
        <form onSubmit={handleVerify} noValidate>
          <div className="modal-field">
            <label htmlFor="verify-code">Code:</label>
            <input
              id="verify-code"
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              required
              autoFocus
              className="code-input"
            />
          </div>
          {error && <p className="modal-error">{error}</p>}
          <button className="modal-btn" type="submit" disabled={loading || code.length !== 6}>
            {loading ? 'Verifying…' : 'Verify & Create Account'}
          </button>
          <button type="button" className="modal-resend" onClick={handleResend}>
            Resend code
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
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
  const [showVerify, setShowVerify] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
    setSubmitted(true);
    setError('');

    if (!form.displayName || !form.handle || !form.email || !form.password || !form.confirm) return;

    const pwErr = validatePassword(form.password);
    if (pwErr) return setError(pwErr);
    if (form.password !== form.confirm) return setError('Passwords do not match.');

    setLoading(true);
    try {
      await authAPI.signupRequest({
        handle: form.handle,
        displayName: form.displayName,
        email: form.email,
        password: form.password,
      });
      setShowVerify(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleVerified(data) {
    saveSession(data, true);
    navigate('/feed');
  }

  return (
    <div className="auth-page">
      <header className="nav">
        <Link to="/" className="logo">Binge<span>Feed</span>
          <PlayIcon className="play" />
        </Link>
      </header>

      <main className="auth-container">
        <h1 className="auth-title">Create your account</h1>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="displayName">Full Name:</label>
            <input id="displayName" name="displayName" type="text" value={form.displayName} onChange={handleChange} />
            {submitted && !form.displayName && <p className="field-error">This field is required.</p>}
          </div>

          <div className="field">
            <label htmlFor="handle">Username:</label>
            <input id="handle" name="handle" type="text" value={form.handle} onChange={handleChange} />
            {submitted && !form.handle && <p className="field-error">This field is required.</p>}
          </div>

          <div className="field">
            <label htmlFor="email">Email:</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" />
            {submitted && !form.email && <p className="field-error">This field is required.</p>}
          </div>

          <div className="field">
            <label htmlFor="password">
              Password:
              <span className="tooltip-wrapper" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
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
                id="password" name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password} onChange={handleChange}
                autoComplete="new-password"
              />
              <button type="button" className="show-btn" onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {submitted && !form.password && <p className="field-error">This field is required.</p>}
            {form.password && passwordError && <p className="field-error">{passwordError}</p>}
          </div>

          <div className="field">
            <label htmlFor="confirm">Confirm Password:</label>
            <div className="input-wrapper">
              <input
                id="confirm" name="confirm"
                type={showConfirm ? 'text' : 'password'}
                value={form.confirm} onChange={handleChange}
                autoComplete="new-password"
              />
              <button type="button" className="show-btn" onClick={() => setShowConfirm((v) => !v)}>
                {showConfirm ? 'Hide' : 'Show'}
              </button>
            </div>
            {submitted && !form.confirm && <p className="field-error">This field is required.</p>}
            {form.confirm && confirmError && <p className="field-error">{confirmError}</p>}
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Sending code…' : 'Sign Up'}
          </button>

          <div className="divider"><span>OR</span></div>

          <p className="switch-link">
            <Link to="/login">Already have an account? Log in</Link>
          </p>
        </form>
      </main>

      {showVerify && (
        <VerifyModal
          email={form.email}
          onSuccess={handleVerified}
          onClose={() => setShowVerify(false)}
        />
      )}
    </div>
  );
}

export default SignUpPage;
