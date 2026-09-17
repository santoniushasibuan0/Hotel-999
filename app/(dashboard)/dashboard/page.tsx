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

  const { data: products, error: productsError } = await supabase
    .from("inventory_products")
    .select("id, product_name, stock, minimum_stock, unit")
    .order("product_name", { ascending: true });

  if (roomsError || reservationsError || productsError) {
    return (
      <>
        <div className="topbar">
          <div>
            <div className="title">Dashboard</div>
            <div className="muted">
              Operational overview • {today}
            </div>
          </div>
        </div>

        <div className="card">
          <p>
            Failed to load dashboard data. Please check the
            Supabase connection and RLS policies.
          </p>
        </div>
      </>
    );
  }

  const roomList = rooms ?? [];
  const reservationList = reservations ?? [];
  const productList = products ?? [];

  const count = (status: string) =>
    roomList.filter((room) => room.status === status).length;

  const todaysReservations = reservationList.filter(
    (reservation) => reservation.check_in_date === today
  );

  const todaysIn = todaysReservations.length;

  const todaysOut = reservationList.filter(
    (reservation) => reservation.check_out_date === today
  ).length;

  const lowStockProducts = productList.filter(
    (product) =>
      Number(product.stock) < Number(product.minimum_stock)
  );

  return (
    <>
      <div className="topbar">
        <div>
          <div className="title">Dashboard</div>
          <div className="muted">
            Operational overview • {today}
          </div>
        </div>
      </div>

      <div className="grid grid-4">
        {[
          ["Total Rooms", roomList.length],
          ["Occupied", count("OCCUPIED")],
          ["Available", count("AVAILABLE")],
          ["Reserved", count("RESERVED")],
          ["Cleaning", count("CLEANING")],
          ["Maintenance", count("MAINTENANCE")],
          ["Today Check-in", todaysIn],
          ["Today Check-out", todaysOut],
        ].map(([label, value]) => (
          <div className="card" key={String(label)}>
            <div className="label">{label}</div>
            <div className="stat">{value}</div>
          </div>
        ))}
      </div>

      <div
        className="grid grid-2"
        style={{ marginTop: 16 }}
      >
        <div className="card">
          <h3>Today's Reservations</h3>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Guest</th>
                <th>Room</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {todaysReservations.map((reservation) => {
                const guest = Array.isArray(reservation.guests)
                  ? reservation.guests[0]
                  : reservation.guests;

                const room = Array.isArray(reservation.rooms)
                  ? reservation.rooms[0]
                  : reservation.rooms;

                return (
                  <tr key={reservation.id}>
                    <td><b>{reservation.reservation_code}</b></td>
                    <td>{guest?.full_name || "-"}</td>
                    <td>{room?.room_number || "-"}</td>
                    <td>
                      <span className="badge">
                        {reservation.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {todaysReservations.length === 0 && (
            <p className="muted">
              No reservations for today.
            </p>
          )}
        </div>

        <div className="card">
          <h3>Inventory Alerts</h3>

          {lowStockProducts.map((product) => (
            <div
              key={product.id}
              style={{
                padding: "12px 0",
                borderBottom: "1px solid #e7e9ef",
              }}
            >
              <b>{product.product_name}</b>

              <div className="muted">
                {Number(product.stock)} {product.unit} remaining
                {" • "}minimum {Number(product.minimum_stock)}
              </div>
            </div>
          ))}

          {lowStockProducts.length === 0 && (
            <p className="muted">
              No low-stock items.
            </p>
          )}
        </div>
      </div>
    </>
  );
}