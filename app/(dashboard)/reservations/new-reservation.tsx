"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

type Guest = {
  id: string;
  full_name: string;
};

type Room = {
  id: string;
  room_number: string;
  status: string;
  price_per_night: number;
};

type NewReservationProps = {
  guests: Guest[];
  rooms: Room[];
};

type ExistingReservation = {
  check_in_date: string;
  check_out_date: string;
  status: string;
};

export default function NewReservation({
  guests,
  rooms,
}: NewReservationProps) {
  const [open, setOpen] = useState(false);
  const [guestId, setGuestId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] =
    useState(false);
  const [message, setMessage] = useState("");

  const selectedRoom = rooms.find((room) => room.id === roomId);

  function calculateTotal(
    room = selectedRoom,
    checkIn = checkInDate,
    checkOut = checkOutDate
  ) {
    if (!room || !checkIn || !checkOut) {
      return;
    }

    const checkInTime = new Date(checkIn).getTime();
    const checkOutTime = new Date(checkOut).getTime();

    const difference = checkOutTime - checkInTime;

    const nights = Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );

    if (nights <= 0) {
      setTotalAmount("");
      return;
    }

    setTotalAmount(
      String(nights * Number(room.price_per_night))
    );
  }

  function handleRoomChange(value: string) {
    setRoomId(value);

    const room = rooms.find((item) => item.id === value);

    calculateTotal(
      room,
      checkInDate,
      checkOutDate
    );
  }

  async function checkRoomAvailability() {
    if (!roomId || !checkInDate || !checkOutDate) {
      return true;
    }

    setCheckingAvailability(true);
    setMessage("");

    const { data, error } = await supabase
      .from("reservations")
      .select(
        "check_in_date, check_out_date, status"
      )
      .eq("room_id", roomId)
      .in("status", [
        "PENDING",
        "CONFIRMED",
        "CHECKED_IN",
      ])
      .lt("check_in_date", checkOutDate)
      .gt("check_out_date", checkInDate);

    setCheckingAvailability(false);

    if (error) {
      setMessage(
        `Failed to check room availability: ${error.message}`
      );
      return false;
    }

    const reservations =
      (data as ExistingReservation[] | null) ?? [];

    if (reservations.length > 0) {
      setMessage(
        "This room is not available for the selected dates because it already has an active reservation."
      );
      return false;
    }

    return true;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");

    if (!guestId) {
      setMessage("Please select a guest.");
      return;
    }

    if (!roomId) {
      setMessage("Please select a room.");
      return;
    }

    if (!checkInDate || !checkOutDate) {
      setMessage(
        "Please select check-in and check-out dates."
      );
      return;
    }

    if (checkOutDate <= checkInDate) {
      setMessage(
        "Check-out date must be after check-in date."
      );
      return;
    }

    const room = rooms.find(
      (item) => item.id === roomId
    );

    if (!room) {
      setMessage("Selected room could not be found.");
      return;
    }

    if (room.status !== "AVAILABLE") {
      setMessage(
        "This room is currently not available."
      );
      return;
    }

    calculateTotal(
      room,
      checkInDate,
      checkOutDate
    );

    const nights = Math.ceil(
      (new Date(checkOutDate).getTime() -
        new Date(checkInDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const calculatedAmount =
      nights * Number(room.price_per_night);

    if (
      !Number.isFinite(calculatedAmount) ||
      calculatedAmount <= 0
    ) {
      setMessage(
        "Unable to calculate reservation total."
      );
      return;
    }

    setTotalAmount(String(calculatedAmount));

    const available = await checkRoomAvailability();

    if (!available) {
      return;
    }

    setLoading(true);

    const reservationCode = `RES-${Date.now()}`;

    const { error } = await supabase
      .from("reservations")
      .insert({
        reservation_code: reservationCode,
        guest_id: guestId,
        room_id: roomId,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        status: "PENDING",
        total_amount: calculatedAmount,
        notes: notes.trim() || null,
      });

    setLoading(false);

    if (error) {
      if (
        error.message
          .toLowerCase()
          .includes("reservation overlap")
      ) {
        setMessage(
          "This room is already reserved for the selected dates."
        );
      } else {
        setMessage(error.message);
      }

      return;
    }

    window.location.reload();
  }

  return (
    <>
      <button
        type="button"
        className="btn"
        onClick={() => {
          setOpen(true);
          setMessage("");
        }}
      >
        + New Reservation
      </button>

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
            background: "rgba(16, 24, 40, 0.45)",
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
                justifyContent: "space-between",
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
                  New Reservation
                </div>

                <div className="muted">
                  Create a new hotel reservation
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  background: "transparent",
                  fontSize: "22px",
                  cursor: "pointer",
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
                Guest
                <select
                  className="select"
                  value={guestId}
                  onChange={(event) =>
                    setGuestId(event.target.value)
                  }
                >
                  <option value="">
                    Select guest
                  </option>

                  {guests.map((guest) => (
                    <option
                      key={guest.id}
                      value={guest.id}
                    >
                      {guest.full_name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Room
                <select
                  className="select"
                  value={roomId}
                  onChange={(event) =>
                    handleRoomChange(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Select room
                  </option>

                  {rooms
                    .filter(
                      (room) =>
                        room.status ===
                        "AVAILABLE"
                    )
                    .map((room) => (
                      <option
                        key={room.id}
                        value={room.id}
                      >
                        Room {room.room_number} — Rp{" "}
                        {Number(
                          room.price_per_night
                        ).toLocaleString("id-ID")}
                        /night
                      </option>
                    ))}
                </select>
              </label>

              <div className="grid grid-2">
                <label>
                  Check-in
                  <input
                    type="date"
                    className="input"
                    value={checkInDate}
                    onChange={(event) => {
                      const value =
                        event.target.value;

                      setCheckInDate(value);

                      calculateTotal(
                        selectedRoom,
                        value,
                        checkOutDate
                      );
                    }}
                  />
                </label>

                <label>
                  Check-out
                  <input
                    type="date"
                    className="input"
                    value={checkOutDate}
                    onChange={(event) => {
                      const value =
                        event.target.value;

                      setCheckOutDate(value);

                      calculateTotal(
                        selectedRoom,
                        checkInDate,
                        value
                      );
                    }}
                  />
                </label>
              </div>

              <label>
                Total Amount
                <input
                  type="number"
                  className="input"
                  value={totalAmount}
                  readOnly
                  min="0"
                  step="1000"
                  placeholder="0"
                />
              </label>

              <label>
                Notes
                <textarea
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                  placeholder="Optional reservation notes"
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
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "4px",
                }}
              >
                <button
                  type="button"
                  className="btn"
                  onClick={() => setOpen(false)}
                  style={{
                    background: "#ffffff",
                    color: "#344054",
                    border: "1px solid #d0d5dd",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn"
                  disabled={
                    loading ||
                    checkingAvailability
                  }
                >
                  {loading
                    ? "Creating..."
                    : checkingAvailability
                    ? "Checking..."
                    : "Create Reservation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

