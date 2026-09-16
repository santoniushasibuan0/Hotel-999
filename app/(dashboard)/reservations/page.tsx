import { supabase } from "@/lib/supabase";

export default async function Reservations() {
  const { data: reservations, error } = await supabase
    .from("reservations")
    .select(`
      id,
      reservation_code,
      check_in_date,
      check_out_date,
      status,
      total_amount,
      notes,
      guests (
        full_name
      ),
      rooms (
        room_number
      )
    `)
    .order("check_in_date", { ascending: true });

  if (error) {
    return (
      <>
        <div className="topbar">
          <div>
            <div className="title">Reservations</div>
            <div className="muted">
              Reservation management and booking status
            </div>
          </div>
        </div>

        <div className="card">
          <p>Failed to load reservations: {error.message}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="title">Reservations</div>
          <div className="muted">
            Reservation management and booking status
          </div>
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Guest</th>
              <th>Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {reservations?.map((reservation) => (
              <tr key={reservation.id}>
                <td>
                  <b>{reservation.reservation_code}</b>
                </td>

                <td>
                  {Array.isArray(reservation.guests)
                    ? (reservation.guests[0] as { full_name?: string } | undefined)
                        ?.full_name || "-"
                    : "-"}
                </td>

                <td>
                  {Array.isArray(reservation.rooms)
                    ? (reservation.rooms[0] as { room_number?: string } | undefined)
                        ?.room_number || "-"
                    : "-"}
                </td>

                <td>{reservation.check_in_date}</td>

                <td>{reservation.check_out_date}</td>

                <td>
                  <span className="badge">{reservation.status}</span>
                </td>

                <td>
                  Rp{" "}
                  {Number(reservation.total_amount).toLocaleString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!reservations || reservations.length === 0) && (
          <p className="muted">No reservations found.</p>
        )}
      </div>
    </>
  );
}