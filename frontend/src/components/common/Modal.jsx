export default function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="split-heading">
          <h2>{title}</h2>
          <button className="table-action" type="button" onClick={onClose}>Close</button>
        </div>
        {children}
      </div>
    </div>
  )
}
