export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import ReservationActions from "./reservation-actions";
import NewReservation from "./new-reservation";

export default async function Reservations() {
  const { data: reservations, error } = await supabase
    .from("reservations")
    .select(`
      id,
      reservation_code,
      guest_id,
      room_id,
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

  const { data: guests } = await supabase
    .from("guests")
    .select("id, full_name")
    .order("full_name", { ascending: true });

  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, room_number, status, price_per_night")
    .order("room_number", { ascending: true });

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

        <NewReservation
          guests={guests ?? []}
          rooms={rooms ?? []}
        />
      </div>

      <div className="card">
        <div className="table-wrapper">
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
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {reservations?.map((reservation) => {
                const guest = Array.isArray(reservation.guests)
                  ? reservation.guests[0]
                  : reservation.guests;

                const room = Array.isArray(reservation.rooms)
                  ? reservation.rooms[0]
                  : reservation.rooms;

                return (
                  <tr key={reservation.id}>
                    <td>
                      <b>{reservation.reservation_code}</b>
                    </td>

                    <td>{guest?.full_name || "-"}</td>

                    <td>{room?.room_number || "-"}</td>

                    <td>{reservation.check_in_date}</td>

                    <td>{reservation.check_out_date}</td>

                    <td>
                      <span className="badge">
                        {reservation.status}
                      </span>
                    </td>

                    <td>
                      Rp{" "}
                      {Number(
                        reservation.total_amount
                      ).toLocaleString("id-ID")}
                    </td>

                    <td>
                      <ReservationActions
                        reservationId={reservation.id}
                        roomId={reservation.room_id}
                        status={reservation.status}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {(!reservations || reservations.length === 0) && (
          <div className="empty-state">
            No reservations found.
          </div>
        )}
      </div>
    </>
  );
}