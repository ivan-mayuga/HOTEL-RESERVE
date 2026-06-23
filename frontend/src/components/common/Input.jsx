export default function Input({ label, value, onChange, error, type = 'text', ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} {...props} />
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  )
}
