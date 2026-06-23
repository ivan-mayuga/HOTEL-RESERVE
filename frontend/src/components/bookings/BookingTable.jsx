export default function BookingTable({ bookings = [] }) {
  return (
    <div className="table-card">
      <table>
        <thead><tr><th>Reference</th><th>Guest</th><th>Status</th></tr></thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.referenceNumber}>
              <td>{booking.referenceNumber}</td>
              <td>{booking.guestName}</td>
              <td>{booking.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
