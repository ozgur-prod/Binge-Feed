function AdBox({ className, text = 'Your ad could be here.' }) {
  const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
  if (user.tier === 'premium') return null;
  return <div className={`ad-box ${className || ''}`}>{text}</div>;
}

export default AdBox;
