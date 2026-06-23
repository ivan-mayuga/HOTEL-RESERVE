export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">...</span>
      <strong>{label}</strong>
    </div>
  )
}
