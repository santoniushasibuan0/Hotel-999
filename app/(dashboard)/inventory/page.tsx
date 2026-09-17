export const dynamic = "force-dynamic";
import { supabase } from "@/lib/supabase";
import InventoryActions from "./inventory-actions";

export default async function Inventory() {
  const { data: products, error: productsError } = await supabase
    .from("inventory_products")
    .select(
      "id, product_name, category, stock, minimum_stock, unit"
    )
    .order("product_name", { ascending: true });

  const { data: transactions, error: transactionsError } =
    await supabase
      .from("inventory_transactions")
      .select(`
        id,
        product_id,
        transaction_type,
        quantity,
        notes,
        created_at,
        inventory_products (
          product_name,
          unit
        )
      `)
      .order("created_at", { ascending: false })
      .limit(20);

  if (productsError) {
    return (
      <>
        <div className="topbar">
          <div>
            <div className="title">Inventory</div>
            <div className="muted">
              Hotel inventory and stock monitoring
            </div>
          </div>
        </div>

        <div className="card">
          <p>Failed to load inventory: {productsError.message}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="title">Inventory</div>
          <div className="muted">
            Hotel inventory and stock monitoring
          </div>
        </div>
      </div>

      <InventoryActions products={products ?? []} />

      <div className="card">
        <h3>Current Stock</h3>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Minimum Stock</th>
              <th>Unit</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {products?.map((product) => {
              const isLowStock =
                Number(product.stock) <
                Number(product.minimum_stock);

              return (
                <tr key={product.id}>
                  <td>
                    <b>{product.product_name}</b>
                  </td>

                  <td>{product.category}</td>

                  <td>{Number(product.stock)}</td>

                  <td>{Number(product.minimum_stock)}</td>

                  <td>{product.unit}</td>

                  <td>
                    <span className="badge">
                      {isLowStock ? "LOW STOCK" : "NORMAL"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {(!products || products.length === 0) && (
          <p className="muted">No inventory products found.</p>
        )}
      </div>

      <div className="card">
        <h3>Transaction History</h3>

        {transactionsError ? (
          <p>
            Failed to load transactions:{" "}
            {transactionsError.message}
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Notes</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {transactions?.map((transaction) => {
                const product = Array.isArray(
                  transaction.inventory_products
                )
                  ? transaction.inventory_products[0]
                  : transaction.inventory_products;

                return (
                  <tr key={transaction.id}>
                    <td>
                      <b>{product?.product_name || "-"}</b>
                    </td>

                    <td>
                      <span className="badge">
                        {transaction.transaction_type}
                      </span>
                    </td>

                    <td>{Number(transaction.quantity)}</td>

                    <td>{product?.unit || "-"}</td>

                    <td>{transaction.notes || "-"}</td>

                    <td>
                      {new Date(
                        transaction.created_at
                      ).toLocaleString("id-ID")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {(!transactions || transactions.length === 0) &&
          !transactionsError && (
            <p className="muted">
              No inventory transactions yet.
            </p>
          )}
      </div>
    </>
  );
}