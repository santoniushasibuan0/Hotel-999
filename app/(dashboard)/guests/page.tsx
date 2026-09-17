"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Guest = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  identity_number: string | null;
  address: string | null;
};

export default function Guests() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [address, setAddress] = useState("");

  async function loadGuests() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("guests")
      .select(
        "id, full_name, phone, email, identity_number, address"
      )
      .order("full_name", { ascending: true });

    setLoading(false);

    if (error) {
      setMessage(
        `Failed to load guests: ${error.message}`
      );
      return;
    }

    setGuests(data ?? []);
  }

  useEffect(() => {
    loadGuests();
  }, []);

  function resetForm() {
    setFullName("");
    setPhone("");
    setEmail("");
    setIdentityNumber("");
    setAddress("");
    setMessage("");
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setOpen(false);
    resetForm();
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");

    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    const trimmedIdentity = identityNumber.trim();
    const trimmedAddress = address.trim();

    if (!trimmedName) {
      setMessage("Full name is required.");
      return;
    }

    if (trimmedEmail) {
      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(trimmedEmail)) {
        setMessage("Please enter a valid email address.");
        return;
      }
    }

    setSaving(true);

    const { error } = await supabase
      .from("guests")
      .insert({
        full_name: trimmedName,
        phone: trimmedPhone || null,
        email: trimmedEmail || null,
        identity_number:
          trimmedIdentity || null,
        address: trimmedAddress || null,
      });

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setOpen(false);
    resetForm();

    await loadGuests();
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="title">
            Guests
          </div>

          <div className="muted">
            Guest profiles and contact information
          </div>
        </div>

        <button
          type="button"
          className="btn"
          onClick={() => {
            setOpen(true);
            setMessage("");
          }}
        >
          + New Guest
        </button>
      </div>

      {message && !open && (
        <div
          className="error-state"
          style={{ marginBottom: "16px" }}
        >
          {message}
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="empty-state">
            Loading guests...
          </div>
        ) : (
          <>
            <div className="table-wrapper">
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
                  {guests.map((guest) => (
                    <tr key={guest.id}>
                      <td>
                        <b>{guest.full_name}</b>
                      </td>

                      <td>
                        {guest.phone || "-"}
                      </td>

                      <td>
                        {guest.email || "-"}
                      </td>

                      <td>
                        {guest.identity_number || "-"}
                      </td>

                      <td>
                        {guest.address || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {guests.length === 0 && (
              <div className="empty-state">
                No guests found.
              </div>
            )}
          </>
        )}
      </div>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            background:
              "rgba(16, 24, 40, 0.45)",
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "620px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "flex-start",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              <div>
                <div
                  className="title"
                  style={{ fontSize: "22px" }}
                >
                  New Guest
                </div>

                <div className="muted">
                  Create a new guest profile
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "22px",
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                  color: "#667085",
                }}
              >
                ×
              </button>
            </div>

            <form
              className="form"
              onSubmit={handleSubmit}
            >
              <label>
                Full Name *
                <input
                  type="text"
                  className="input"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(
                      event.target.value
                    )
                  }
                  placeholder="Enter guest full name"
                  required
                />
              </label>

              <label>
                Phone
                <input
                  type="tel"
                  className="input"
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value
                    )
                  }
                  placeholder="Enter phone number"
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="Enter email address"
                />
              </label>

              <label>
                Identity Number
                <input
                  type="text"
                  className="input"
                  value={identityNumber}
                  onChange={(event) =>
                    setIdentityNumber(
                      event.target.value
                    )
                  }
                  placeholder="Enter identity number"
                />
              </label>

              <label>
                Address
                <textarea
                  value={address}
                  onChange={(event) =>
                    setAddress(
                      event.target.value
                    )
                  }
                  placeholder="Enter guest address"
                />
              </label>

              {message && (
                <div className="error-state">
                  {message}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "flex-end",
                  gap: "10px",
                  marginTop: "4px",
                }}
              >
                <button
                  type="button"
                  className="btn"
                  onClick={closeModal}
                  disabled={saving}
                  style={{
                    background: "#ffffff",
                    color: "#344054",
                    border:
                      "1px solid #d0d5dd",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Guest"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}