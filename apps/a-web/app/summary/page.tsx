"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function SummaryPage() {
  const [data, setData] = useState<any>(null);
  const [status, setStatus] = useState<string>("");

  const load = async () => {
    setStatus("Loading...");
    try {
      const out = await apiFetch("/summary", { method: "GET" });
      setData(out);
      setStatus("Loaded.");
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    }
  };

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Summary</h1>

      <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
        <button onClick={load} style={{ padding: "8px 12px" }}>
          Load summary
        </button>
        {status && <p>{status}</p>}
      </div>

      <hr style={{ margin: "24px 0" }} />

      <pre style={{ whiteSpace: "pre-wrap" }}>
        {data ? JSON.stringify(data, null, 2) : "No data yet."}
      </pre>
    </main>
  );
}
