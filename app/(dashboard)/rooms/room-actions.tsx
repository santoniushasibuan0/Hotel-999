"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type RoomActionsProps = {
  roomId: string;
  status: string;
};

export default function RoomActions({
  roomId,
  status,
}: RoomActionsProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleMarkAvailable() {
    if (
      status !== "CLEANING" &&
      status !== "MAINTENANCE"
    ) {
      return;
    }

    const question =
      status === "CLEANING"
        ? "Apakah room ini sudah selesai dibersihkan dan siap digunakan?"
        : "Apakah maintenance room ini sudah selesai dan room sudah siap digunakan?";

    const confirmed = window.confirm(question);

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase
      .from("rooms")
      .update({
        status: "AVAILABLE",
      })
      .eq("id", roomId)
      .eq("status", status);

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    window.location.reload();
  }

  if (
    status !== "CLEANING" &&
    status !== "MAINTENANCE"
  ) {
    return (
      <span className="muted">—</span>
    );
  }

  return (
    <div>
      <button
        type="button"
        className="btn"
        onClick={handleMarkAvailable}
        disabled={loading}
      >
        {loading
          ? "Updating..."
          : "Mark Available"}
      </button>

      {message && (
        <div
          className="error-state"
          style={{ marginTop: "8px" }}
        >
          {message}
        </div>
      )}
    </div>
  );
}

