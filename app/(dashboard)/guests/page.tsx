export const dynamic = "force-dynamic";
import { supabase } from "@/lib/supabase";

export default async function Guests() {
  const { data: guests, error } = await supabase
    .from("guests")
    .select("id, full_name, phone, email, identity_number, address")
    .order("full_name", { ascending: true });

  if (error) {
    return (
      <>
        <div className="topbar">
          <div>
            <div className="title">Guests</div>
            <div className="muted">
              Guest profiles and contact information
            </div>
          </div>
        </div>

        <div className="card">
          <p>Failed to load guests: {error.message}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="title">Guests</div>
          <div className="muted">
            Guest profiles and contact information
          </div>
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Identity Number</th>
              <th>Address</th>
            </tr>
          </thead>

          <tbody>
            {guests?.map((guest) => (
              <tr key={guest.id}>
                <td>
                  <b>{guest.full_name}</b>
                </td>
                <td>{guest.phone || "-"}</td>
                <td>{guest.email || "-"}</td>
                <td>{guest.identity_number || "-"}</td>
                <td>{guest.address || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!guests || guests.length === 0) && (
          <p className="muted">No guests found.</p>
        )}
      </div>
    </>
  );
}