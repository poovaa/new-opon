
import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/lcc.css";

const STOCK_API = "http://localhost:5000/api/stockmaster";
const LCC_API = "http://localhost:5000/api/lccmaster";

const emptyForm = {
  stockMasterId: "",
  qty: "",
  location: "LCC Building",
  updatedBy: "",
};

function getStockPrefix(stockName = "") {
  return stockName.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase() || "ST";
}

// Generate the next ID for a stock prefix using existing LCC records.
function generateLCCId(stockName, lccStocks) {
  if (!stockName?.trim()) return "";

  const prefix = getStockPrefix(stockName);
  const pattern = new RegExp(`^LCC(\\d+)-${prefix}$`);

  let maxNumber = 0;

  lccStocks.forEach((item) => {
    const match = item.lccId?.match(pattern);

    if (match) {
      maxNumber = Math.max(maxNumber, Number(match[1]));
    }
  });

  return `LCC${String(maxNumber + 1).padStart(2, "0")}-${prefix}`;
}

function LCC() {
  const [stocks, setStocks] = useState([]);
  const [lccStocks, setLccStocks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedStock = stocks.find(
    (stock) => stock._id === form.stockMasterId
  );

  // Show the generated ID for the selected stock.
  // If that stock already exists at the chosen location,
  // the backend updates that record and keeps its current ID.
  const existingLCC = selectedStock
    ? lccStocks.find(
        (item) =>
          item.stockId === selectedStock.stockId &&
          item.location === (form.location.trim() || "LCC Building")
      )
    : null;

  const generatedLCCId = existingLCC
    ? existingLCC.lccId
    : generateLCCId(selectedStock?.stockName, lccStocks);

  const fetchStocks = async () => {
    try {
      const response = await axios.get(STOCK_API);
      setStocks(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch Stock Master data"
      );
    }
  };

  const fetchLCCStocks = async () => {
    setLoading(true);

    try {
      const response = await axios.get(LCC_API);
      setLccStocks(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to fetch LCC stocks"
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await Promise.all([fetchStocks(), fetchLCCStocks()]);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!selectedStock) {
      setError("Please select a stock");
      return;
    }

    const qty = Number(form.qty);

    if (!Number.isInteger(qty) || qty <= 0) {
      setError("Enter a valid whole-number quantity");
      return;
    }

    if (qty > Number(selectedStock.balanceQty)) {
      setError(
        `Only ${selectedStock.balanceQty} units are available in Stock Master`
      );
      return;
    }

    if (!form.location.trim()) {
      setError("Please enter a destination location");
      return;
    }

    if (!form.updatedBy.trim()) {
      setError("Please enter Updated By");
      return;
    }

    if (!generatedLCCId) {
      setError("Could not generate the LCC ID. Please refresh and try again.");
      return;
    }

    setTransferring(true);

    try {
      // Send the frontend-generated LCC ID to the backend.
      // The backend must save this lccId when creating a new record.
      const response = await axios.post(LCC_API, {
        stockId: selectedStock.stockId,
        lccId: generatedLCCId,
        qty,
        location: form.location.trim(),
        updatedBy: form.updatedBy.trim(),
      });

      setMessage(
        response.data.message || "Stock transferred successfully"
      );

      setForm({
        ...emptyForm,
        updatedBy: form.updatedBy,
      });

      await refreshData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Stock transfer failed. Please try again."
      );
    } finally {
      setTransferring(false);
    }
  };

  const filteredStocks = lccStocks.filter((stock) => {
    const query = search.toLowerCase();

    return (
      stock.stockId?.toLowerCase().includes(query) ||
      stock.stockName?.toLowerCase().includes(query) ||
      stock.location?.toLowerCase().includes(query) ||
      stock.lccId?.toLowerCase().includes(query)
    );
  });

  const totalLCCBalance = lccStocks.reduce(
    (total, stock) => total + (Number(stock.balanceQty) || 0),
    0
  );

  return (
    <div className="lcc-page">
      <div className="lcc-header">
        <div>
          <h1>LCC Building</h1>
          <p>Transfer and manage stocks received from Stock Master.</p>
        </div>

        <button
          type="button"
          className="lcc-refresh-btn"
          onClick={refreshData}
        >
          Refresh
        </button>
      </div>

      {message && (
        <div className="lcc-alert lcc-success">{message}</div>
      )}

      {error && (
        <div className="lcc-alert lcc-error">{error}</div>
      )}

      <div className="lcc-summary">
        <div className="lcc-summary-card">
          <span>Total Stock Items</span>
          <h2>{lccStocks.length}</h2>
        </div>

        <div className="lcc-summary-card">
          <span>Total Available Quantity</span>
          <h2>{totalLCCBalance}</h2>
        </div>

        <div className="lcc-summary-card">
          <span>Available Source Items</span>
          <h2>
            {
              stocks.filter(
                (stock) => Number(stock.balanceQty) > 0
              ).length
            }
          </h2>
        </div>
      </div>

      <section className="lcc-panel">
        <div className="lcc-panel-heading">
          <h2>Transfer Stock to LCC</h2>
          <p>
            Select stock from Stock Master and enter the transfer quantity.
          </p>
        </div>

        <form className="lcc-form" onSubmit={handleTransfer}>
          <div className="lcc-form-grid">
            <label>
              Select Stock *
              <select
                name="stockMasterId"
                value={form.stockMasterId}
                onChange={handleChange}
                required
              >
                <option value="">Choose a stock</option>

                {stocks
                  .filter((stock) => Number(stock.balanceQty) > 0)
                  .map((stock) => (
                    <option key={stock._id} value={stock._id}>
                      {stock.stockId} - {stock.stockName}
                    </option>
                  ))}
              </select>
            </label>

            <label>
              Stock ID
              <input
                value={selectedStock?.stockId || ""}
                placeholder="Select stock first"
                readOnly
              />
            </label>

            <label>
              Generated LCC ID
              <input
                value={generatedLCCId}
                placeholder="Generated automatically"
                readOnly
              />
            </label>

            <label>
              Available in Stock Master
              <input
                value={selectedStock?.balanceQty ?? ""}
                placeholder="Available quantity"
                readOnly
              />
            </label>

            <label>
              Transfer Quantity *
              <input
                type="number"
                name="qty"
                value={form.qty}
                onChange={handleChange}
                min="1"
                max={selectedStock?.balanceQty ?? undefined}
                step="1"
                placeholder="Enter quantity"
                required
              />
            </label>

            <label>
              Destination Location
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Updated By *
              <input
                name="updatedBy"
                value={form.updatedBy}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </label>
          </div>

          {selectedStock && (
            <div className="lcc-transfer-preview">
              <div>
                <span>Stock Name</span>
                <strong>{selectedStock.stockName}</strong>
              </div>

              <div>
                <span>LCC ID</span>
                <strong>{generatedLCCId}</strong>
              </div>

              <div>
                <span>Remaining after transfer</span>
                <strong>
                  {Math.max(
                    0,
                    Number(selectedStock.balanceQty) -
                      (Number(form.qty) || 0)
                  )}
                </strong>
              </div>
            </div>
          )}

          <div className="lcc-form-actions">
            <button
              type="button"
              className="lcc-cancel-btn"
              onClick={() => {
                setForm(emptyForm);
                setMessage("");
                setError("");
              }}
            >
              Clear
            </button>

            <button
              type="submit"
              className="lcc-submit-btn"
              disabled={transferring || !stocks.length}
            >
              {transferring ? "Transferring..." : "Transfer to LCC"}
            </button>
          </div>
        </form>
      </section>

      <section className="lcc-panel">
        <div className="lcc-table-heading">
          <div>
            <h2>LCC Stock Master</h2>
            <p>Stocks currently available in the LCC Building.</p>
          </div>

          <input
            className="lcc-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stock..."
          />
        </div>

        <div className="lcc-table-wrapper">
          <table className="lcc-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>LCC ID</th>
                <th>Stock ID</th>
                <th>Stock Name</th>
                <th>Location</th>
                <th>Total Received</th>
                <th>Balance Qty</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="lcc-empty">
                    Loading LCC stocks...
                  </td>
                </tr>
              ) : filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="lcc-empty">
                    No LCC stocks found.
                  </td>
                </tr>
              ) : (
                filteredStocks.map((stock, index) => (
                  <tr key={stock._id}>
                    <td>{index + 1}</td>
                    <td>{stock.lccId}</td>
                    <td>{stock.stockId}</td>
                    <td>{stock.stockName}</td>
                    <td>{stock.location}</td>
                    <td>{stock.totalQty}</td>
                    <td>
                      <span className="lcc-quantity">
                        {stock.balanceQty}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default LCC;
