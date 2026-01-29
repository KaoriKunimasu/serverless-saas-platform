"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

type Item = {
  pk?: string;
  sk?: string;
  name?: string;
  amount?: number;
  createdAt?: string;
};

export default function ItemsPage() {
  const [name, setName] = useState("coffee");
  const [amount, setAmount] = useState<number>(450);
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState<string>("");

  const createItem = async () => {
    setStatus("Creating...");
    try {
      const out = await apiFetch("/items", {
        method: "POST",
        body: JSON.stringify({ name, amount }),
      });
      setStatus("Created.");
      // optional: refresh list
      await listItems();
      return out;
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    }
  };

  const listItems = async () => {
    setStatus("Loading...");
    try {
      const out = await apiFetch("/items", { method: "GET" });
      const arr = Array.isArray(out) ? out : out?.items ?? [];
      setItems(arr);
      setStatus("Loaded.");
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    }
  };

  return (
    <main style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>Items</h1>

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <label>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
          />
        </label>

        <label>
          Amount
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            style={{ display: "block", width: "100%", padding: 8, marginTop: 4 }}
          />
        </label>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={createItem} style={{ padding: "8px 12px" }}>
            Create
          </button>
          <button onClick={listItems} style={{ padding: "8px 12px" }}>
            Refresh list
          </button>
        </div>

        {status && <p>{status}</p>}
      </div>

      <hr style={{ margin: "24px 0" }} />

      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(items, null, 2)}
      </pre>
    </main>
  );
}
