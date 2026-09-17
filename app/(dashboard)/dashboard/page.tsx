export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";

export default async function Dashboard() {
  const today = new Date().toISOString().split("T")[0];

  const { data: rooms, error: roomsError } = await supabase
    .from("rooms")
    .select("id, room_number, status");

  const { data: reservations, error: reservationsError } =
    await supabase
      .from("reservations")
      .select(`
        id,
        reservation_code,
        guest_id,
        room_id,
        check_in_date,
        check_out_date,
        status,
        guests (
          full_name
        ),
        rooms (
          room_number
        )
      `)
      .order("check_in_date", { ascending: true });

  const { data: products, error: productsError } =
    await supabase
      .from("inventory_products")
      .select(
        "id, product_name, stock, minimum_stock, unit"
      )
      .order("product_name", { ascending: true });

  if (
    roomsError ||
    reservationsError ||
    productsError
  ) {
    return (
      <>
        <div className="topbar">
          <div>
            <div className="title">
              Dashboard
            </div>

            <div className="muted">
              Operational overview • {today}
            </div>
          </div>
        </div>

        <div className="card">
          <p>
            Failed to load dashboard data.
            Please check the Supabase connection
            and RLS policies.
          </p>
        </div>
      </>
    );
  }

  const roomList = rooms ?? [];
  const reservationList = reservations ?? [];
  const productList = products ?? [];

  const count = (status: string) =>
    roomList.filter(
      (room) => room.status === status
    ).length;

  const todaysCheckIns =
    reservationList.filter(
      (reservation) =>
        reservation.check_in_date === today &&
        reservation.status !== "CANCELLED"
    );

  const todaysCheckOuts =
    reservationList.filter(
      (reservation) =>
        reservation.check_out_date === today &&
        reservation.status !== "CANCELLED"
    );

  const todaysReservations =
    reservationList.filter((reservation) => {
      const isActiveToday =
        reservation.check_in_date <= today &&
        reservation.check_out_date > today;

      const isCheckInToday =
        reservation.check_in_date === today;

      const isCheckOutToday =
        reservation.check_out_date === today;

      return (
        (isActiveToday ||
          isCheckInToday ||
          isCheckOutToday) &&
        reservation.status !== "CANCELLED"
      );
    });

  const lowStockProducts =
    productList.filter(
      (product) =>
        Number(product.stock) <
        Number(product.minimum_stock)
    );

  return (
    <>
      <div className="topbar">
        <div>
          <div className="title">
            Dashboard
          </div>

          <div className="muted">
            Operational overview • {today}
          </div>
        </div>
      </div>

      <div className="grid grid-4">
        <div className="card">
          <div className="label">
            Total Rooms
          </div>

          <div className="stat">
            {roomList.length}
          </div>
        </div>

        <div className="card">
          <div className="label">
            Available
          </div>

          <div className="stat">
            {count("AVAILABLE")}
          </div>
        </div>

        <div className="card">
          <div className="label">
            Reserved
          </div>

          <div className="stat">
            {count("RESERVED")}
          </div>
        </div>

        <div className="card">
          <div className="label">
            Occupied
          </div>

          <div className="stat">
            {count("OCCUPIED")}
          </div>
        </div>

        <div className="card">
          <div className="label">
            Cleaning
          </div>

          <div className="stat">
            {count("CLEANING")}
          </div>
        </div>

        <div className="card">
          <div className="label">
            Maintenance
          </div>

          <div className="stat">
            {count("MAINTENANCE")}
          </div>
        </div>

        <div className="card">
          <div className="label">
            Today's Check-in
          </div>

          <div className="stat">
            {todaysCheckIns.length}
          </div>
        </div>

        <div className="card">
          <div className="label">
            Today's Check-out
          </div>

          <div className="stat">
            {todaysCheckOuts.length}
          </div>
        </div>
      </div>

      <div
        className="grid grid-2"
        style={{ marginTop: 16 }}
      >
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>
                Today's Reservations
              </h3>

              <div className="muted">
                Current hotel activity
              </div>
            </div>

            <span className="badge">
              {todaysReservations.length}
            </span>
          </div>

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
                </tr>
              </thead>

              <tbody>
                {todaysReservations.map(
                  (reservation) => {
                    const guest =
                      Array.isArray(
                        reservation.guests
                      )
                        ? reservation.guests[0]
                        : reservation.guests;

                    const room =
                      Array.isArray(
                        reservation.rooms
                      )
                        ? reservation.rooms[0]
                        : reservation.rooms;

                    return (
                      <tr
                        key={reservation.id}
                      >
                        <td>
                          <b>
                            {
                              reservation.reservation_code
                            }
                          </b>
                        </td>

                        <td>
                          {guest?.full_name || "-"}
                        </td>

                        <td>
                          {room?.room_number || "-"}
                        </td>

                        <td>
                          {
                            reservation.check_in_date
                          }
                        </td>

                        <td>
                          {
                            reservation.check_out_date
                          }
                        </td>

                        <td>
                          <span className="badge">
                            {
                              reservation.status
                            }
                          </span>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>

          {todaysReservations.length === 0 && (
            <div className="empty-state">
              No reservations for today.
            </div>
          )}
        </div>

        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>
                Inventory Alerts
              </h3>

              <div className="muted">
                Products below minimum stock
              </div>
            </div>

            <span className="badge">
              {lowStockProducts.length}
            </span>
          </div>

          {lowStockProducts.map(
            (product) => (
              <div
                key={product.id}
                style={{
                  padding: "14px 0",
                  borderBottom:
                    "1px solid #e7e9ef",
                }}
              >
                <div>
                  <b>
                    {product.product_name}
                  </b>
                </div>

                <div className="muted">
                  {Number(product.stock)}{" "}
                  {product.unit} remaining
                  {" • "}
                  minimum{" "}
                  {Number(
                    product.minimum_stock
                  )}
                </div>
              </div>
            )
          )}

          {lowStockProducts.length === 0 && (
            <div className="empty-state">
              No low-stock items.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

