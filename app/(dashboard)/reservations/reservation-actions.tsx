"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type ReservationActionProps = {
  reservationId: string;
  roomId: string;
  status: string;
};

export default function ReservationActions({
  reservationId,
  roomId,
  status,
}: ReservationActionProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleConfirm() {
    if (status !== "PENDING") {
      return;
    }

    const confirmed = window.confirm(
      "Apakah Anda yakin ingin mengonfirmasi reservation ini?"
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setMessage("");

    const { error: roomError } = await supabase
      .from("rooms")
      .update({
        status: "RESERVED",
      })
      .eq("id", roomId)
      .eq("status", "AVAILABLE");

    if (roomError) {
      setLoading(false);
      setMessage(roomError.message);
      return;
    }

    const { error: reservationError } = await supabase
      .from("reservations")
      .update({
        status: "CONFIRMED",
      })
      .eq("id", reservationId)
      .eq("status", "PENDING");

    setLoading(false);

    if (reservationError) {
      setMessage(reservationError.message);
      return;
    }

    window.location.reload();
  }

  async function handleCheckIn() {
    if (status !== "CONFIRMED") {
      return;
    }

    const confirmed = window.confirm(
      "Apakah Anda yakin ingin melakukan check-in untuk reservation ini?"
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setMessage("");

    const { error: reservationError } = await supabase
      .from("reservations")
      .update({
        status: "CHECKED_IN",
      })
      .eq("id", reservationId)
      .eq("status", "CONFIRMED");

    if (reservationError) {
      setLoading(false);
      setMessage(reservationError.message);
      return;
    }

    const { error: roomError } = await supabase
      .from("rooms")
      .update({
        status: "OCCUPIED",
      })
      .eq("id", roomId)
      .eq("status", "RESERVED");

    setLoading(false);

    if (roomError) {
      setMessage(roomError.message);
      return;
    }

    window.location.reload();
  }

  async function handleCheckOut() {
    if (status !== "CHECKED_IN") {
      return;
    }

    const confirmed = window.confirm(
      "Apakah Anda yakin ingin melakukan check-out untuk reservation ini?"
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setMessage("");

    const { error: reservationError } = await supabase
      .from("reservations")
      .update({
        status: "CHECKED_OUT",
      })
      .eq("id", reservationId)
      .eq("status", "CHECKED_IN");

    if (reservationError) {
      setLoading(false);
      setMessage(reservationError.message);
      return;
    }

    const { error: roomError } = await supabase
      .from("rooms")
      .update({
        status: "CLEANING",
      })
      .eq("id", roomId)
      .eq("status", "OCCUPIED");

    setLoading(false);

    if (roomError) {
      setMessage(roomError.message);
      return;
    }

    window.location.reload();
  }

  return (
    <div>
      {status === "PENDING" && (
        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? "Processing..." : "Confirm"}
        </button>
      )}

      {status === "CONFIRMED" && (
        <button
          type="button"
          onClick={handleCheckIn}
          disabled={loading}
        >
          {loading ? "Processing..." : "Check-in"}
        </button>
      )}

      {status === "CHECKED_IN" && (
        <button
          type="button"
          onClick={handleCheckOut}
          disabled={loading}
        >
          {loading ? "Processing..." : "Check-out"}
        </button>
      )}

      {message && (
        <div style={{ marginTop: "8px" }}>
          {message}
        </div>
      )}
    </div>
  );
}

