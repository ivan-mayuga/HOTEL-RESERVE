export default function RoomCard({ room }) {
  return (
    <article className="room-card">
      <strong>Room {room.roomNumber}</strong>
      <span>{room.category}</span>
    </article>
  )
}
