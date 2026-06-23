export default function Badge({ children, status }) {
  const value = children || status
  return <span className="badge">{value}</span>
}
