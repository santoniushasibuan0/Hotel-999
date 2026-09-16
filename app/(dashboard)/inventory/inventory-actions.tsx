"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  product_name: string;
  stock: number;
  unit: string;
};

type InventoryActionsProps = {
  products: Product[];
};

export default function InventoryActions({
  products,
}: InventoryActionsProps) {
  const [transactionType, setTransactionType] =
    useState<"STOCK_IN" | "STOCK_OUT">("STOCK_IN");

  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");

    const parsedQuantity = Number(quantity);

    if (!productId) {
      setMessage("Please select a product.");
      return;
    }

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setMessage("Quantity must be greater than 0.");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("inventory_transactions")
      .insert({
        product_id: productId,
        transaction_type: transactionType,
        quantity: parsedQuantity,
        notes: notes.trim() || null,
        created_by: null,
      });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      `${transactionType === "STOCK_IN" ? "Stock In" : "Stock Out"} berhasil disimpan.`
    );

    setQuantity("");
    setNotes("");

    window.location.reload();
  }

  return (
    <div className="card">
      <h3>Inventory Transaction</h3>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            marginTop: "16px",
          }}
        >
          <div>
            <label>Transaction Type</label>

            <select
              value={transactionType}
              onChange={(event) =>
                setTransactionType(
                  event.target.value as
                    | "STOCK_IN"
                    | "STOCK_OUT"
                )
              }
            >
              <option value="STOCK_IN">Stock In</option>
              <option value="STOCK_OUT">Stock Out</option>
            </select>
          </div>

          <div>
            <label>Product</label>

            <select
              value={productId}
              onChange={(event) =>
                setProductId(event.target.value)
              }
            >
              <option value="">Select product</option>

              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.product_name} — Stock:{" "}
                  {Number(product.stock)} {product.unit}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Quantity</label>

            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) =>
                setQuantity(event.target.value)
              }
              placeholder="Enter quantity"
            />
          </div>

          <div>
            <label>Notes</label>

            <input
              type="text"
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              placeholder="Optional notes"
            />
          </div>
        </div>

        <div style={{ marginTop: "16px" }}>
          <button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : transactionType === "STOCK_IN"
                ? "Save Stock In"
                : "Save Stock Out"}
          </button>
        </div>

        {message && (
          <p style={{ marginTop: "12px" }}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}