import { useState } from 'react';
import { authAPI } from '../services/api';
import './ForgotPasswordModal.css';

function validatePassword(password) {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) return 'Password must contain at least one special character.';
  return null;
}

export default function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: new password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSendCode(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.sendResetCode({ email });
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.verifyResetCode({ email, code });
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError('');
    const pwErr = validatePassword(newPassword);
    if (pwErr) return setError(pwErr);
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');
    setLoading(true);
    try {
      await authAPI.resetPassword({ email, code, newPassword });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        {step === 1 && (
          <>
            <h2 className="modal-title">Reset Password</h2>
            <p className="modal-subtitle">Enter your email and we'll send you a code.</p>
            <form onSubmit={handleSendCode}>
              <div className="modal-field">
                <label htmlFor="reset-email">Email:</label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              {error && <p className="modal-error">{error}</p>}
              <button className="modal-btn" type="submit" disabled={loading}>
                {loading ? 'Sending…' : 'Send Code'}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="modal-title">Enter Code</h2>
            <p className="modal-subtitle">We sent a 6-digit code to <strong>{email}</strong></p>
            <form onSubmit={handleVerifyCode}>
              <div className="modal-field">
                <label htmlFor="reset-code">Code:</label>
                <input
                  id="reset-code"
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
                {loading ? 'Verifying…' : 'Verify Code'}
              </button>
              <button type="button" className="modal-resend" onClick={() => { setStep(1); setError(''); setCode(''); }}>
                Resend code
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="modal-title">New Password</h2>
            <p className="modal-subtitle">Choose a new password for your account.</p>
            <form onSubmit={handleResetPassword}>
              <div className="modal-field">
                <label htmlFor="new-password">New Password:</label>
                <div className="modal-input-wrapper">
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError(validatePassword(e.target.value) || '');
                      setConfirmError(confirmPassword && e.target.value !== confirmPassword ? 'Passwords do not match.' : '');
                    }}
                    required
                    autoFocus
                  />
                  <button type="button" className="show-btn" onClick={() => setShowPassword((v) => !v)}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {passwordError && <p className="modal-field-error">{passwordError}</p>}
              </div>
              <div className="modal-field">
                <label htmlFor="confirm-password">Repeat New Password:</label>
                <div className="modal-input-wrapper">
                  <input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setConfirmError(e.target.value !== newPassword ? 'Passwords do not match.' : '');
                    }}
                    required
                  />
                </div>
                {confirmError && <p className="modal-field-error">{confirmError}</p>}
              </div>
              {error && <p className="modal-error">{error}</p>}
              <button className="modal-btn" type="submit" disabled={loading}>
                {loading ? 'Saving…' : 'Set New Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
