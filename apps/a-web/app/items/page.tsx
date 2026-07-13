"use client";

import { useState } from "react";
import { apiFetch, getErrorMessageFromUnknown } from "@/lib/api";

type Item = {
  pk?: string;
  sk?: string;
  name?: string;
  amount?: number;
  createdAt?: string;
};

function isItem(value: unknown): value is Item {
  return typeof value === "object" && value !== null;
}

function getItems(value: unknown): Item[] {
  if (Array.isArray(value)) {
    return value.filter(isItem);
  }

  if (typeof value === "object" && value !== null && "items" in value) {
    const items = value.items;
    return Array.isArray(items) ? items.filter(isItem) : [];
  }

  return [];
}

export default function ItemsPage() {
  const [name, setName] = useState("coffee");
  const [amount, setAmount] = useState<number>(450);
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState<string>("");

  const listItems = async () => {
    setStatus("Loading...");

    try {
      const out = await apiFetch("/items", { method: "GET" });
      setItems(getItems(out));
      setStatus("Loaded.");
    } catch (error: unknown) {
      setStatus(`Error: ${getErrorMessageFromUnknown(error)}`);
    }
  };

  const createItem = async () => {
    setStatus("Creating...");

    try {
      await apiFetch("/items", {
        method: "POST",
        body: JSON.stringify({ name, amount }),
      });

      setStatus("Created.");
      await listItems();
    } catch (error: unknown) {
      setStatus(`Error: ${getErrorMessageFromUnknown(error)}`);
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
            onChange={(event) => setName(event.target.value)}
            style={{
              display: "block",
              width: "100%",
              padding: 8,
              marginTop: 4,
            }}
          />
        </label>

        <label>
          Amount
          <input
            type="number"
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
            style={{
              display: "block",
              width: "100%",
              padding: 8,
              marginTop: 4,
            }}
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
