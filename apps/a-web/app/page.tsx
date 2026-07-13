"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";

const LS_KEY = "accessToken";

function subscribeToTokenChanges(callback: () => void) {
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("storage", callback);
  };
}

function getStoredToken() {
  return localStorage.getItem(LS_KEY) ?? "";
}

function getServerStoredToken() {
  return "";
}

export default function HomePage() {
  const storedToken = useSyncExternalStore(
    subscribeToTokenChanges,
    getStoredToken,
    getServerStoredToken,
  );
  const [editedToken, setEditedToken] = useState("");
  const [hasEditedToken, setHasEditedToken] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  const token = hasEditedToken ? editedToken : storedToken;
  const status = saved ?? (storedToken ? "Token is saved in localStorage." : null);

  const save = () => {
    localStorage.setItem(LS_KEY, token.trim());
    setEditedToken(token.trim());
    setHasEditedToken(true);
    setSaved("Saved.");
  };

  const clear = () => {
    localStorage.removeItem(LS_KEY);
    setEditedToken("");
    setHasEditedToken(true);
    setSaved("Cleared.");
  };

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>
        Project A — Serverless SaaS
      </h1>

      <p style={{ marginTop: 8 }}>
        Paste a Cognito token (from Postman) to call the API.
      </p>

      <div style={{ marginTop: 16 }}>
        <label
          style={{ display: "block", fontWeight: 600, marginBottom: 6 }}
        >
          Access token
        </label>

        <textarea
          value={token}
          onChange={(event) => {
            setEditedToken(event.target.value);
            setHasEditedToken(true);
          }}
          rows={6}
          style={{ width: "100%", padding: 10, fontFamily: "monospace" }}
          placeholder="Paste token here..."
        />

        <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
          <button onClick={save} style={{ padding: "8px 12px" }}>
            Save token
          </button>
          <button onClick={clear} style={{ padding: "8px 12px" }}>
            Clear
          </button>
        </div>

        {status && <p style={{ marginTop: 10 }}>{status}</p>}
      </div>

      <hr style={{ margin: "24px 0" }} />

      <div style={{ display: "flex", gap: 16 }}>
        <Link href="/items">Items</Link>
        <Link href="/summary">Summary</Link>
      </div>

      <p style={{ marginTop: 12, opacity: 0.7 }}>
        API Base URL:{" "}
        {process.env.NEXT_PUBLIC_API_BASE_URL ?? "(not set)"}
      </p>
    </main>
  );
}
