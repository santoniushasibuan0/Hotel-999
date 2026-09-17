export const dynamic = "force-dynamic";
import { supabase } from "@/lib/supabase";

export default async function Rooms() {
  const { data: rooms, error } = await supabase
    .from("rooms")
    .select(
      "id, room_number, room_type, floor, status, price_per_night"
    )
    .order("room_number", { ascending: true });

  if (error) {
    return (
      <>
        <div className="topbar">
          <div>
            <div className="title">Rooms</div>
            <div className="muted">
              Room availability and operational status
            </div>
          </div>
        </div>

        <div className="card">
          <p>Failed to load rooms: {error.message}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="title">Rooms</div>
          <div className="muted">
            Room availability and operational status
          </div>
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Room</th>
              <th>Type</th>
              <th>Floor</th>
              <th>Rate / night</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {rooms?.map((room) => (
              <tr key={room.id}>
                <td>
                  <b>{room.room_number}</b>
                </td>

                <td>{room.room_type}</td>

                <td>{room.floor}</td>

                <td>
                  Rp{" "}
                  {Number(room.price_per_night).toLocaleString("id-ID")}
                </td>

                <td>
                  <span className="badge">{room.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!rooms || rooms.length === 0) && (
          <p className="muted">No rooms found.</p>
        )}
      </div>
    </>
  );
}