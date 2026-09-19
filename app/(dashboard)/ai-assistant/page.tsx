"use client";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  text: string;
};

export default function AI() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hello. I am the Hotel 999 Operational AI Assistant. Ask about rooms, reservations, or inventory.",
    },
  ]);

  async function send() {
    const question = q.trim();

    if (!question || loading) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        role: "user",
        text: question,
      },
    ]);

    setQ("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: question,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.details ||
            data?.error ||
            "Failed to get AI response."
        );
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text:
            data?.message ||
            "No response received from the AI.",
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to process request.";

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: `Error: ${message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="title">AI Assistant</div>

          <div className="muted">
            Hotel 999 Operational AI Assistant • Live
          </div>
        </div>
      </div>

      <div className="card chat">
        <div className="messages">
          {messages.map((message, index) => (
            <div
              className={`bubble ${
                message.role === "user" ? "user" : ""
              }`}
              key={index}
            >
              {message.text}
            </div>
          ))}

          {loading && (
            <div className="bubble">
              Thinking...
            </div>
          )}
        </div>

        <div className="chatbar">
          <input
            className="input"
            value={q}
            onChange={(event) =>
              setQ(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                send();
              }
            }}
            placeholder="Ask: How many rooms are available?"
            disabled={loading}
          />

          <button
            className="btn"
            onClick={send}
            disabled={loading || !q.trim()}
          >
            {loading ? "Thinking..." : "Ask"}
          </button>
        </div>
      </div>

      <div
        className="muted"
        style={{ marginTop: 12 }}
      >
        Live mode: UI → server-side AI API → Supabase hotel data → Gemini → response.
      </div>
    </>
  );
}