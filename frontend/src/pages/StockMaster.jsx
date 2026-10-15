import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/stock.css";

const API_URL = "http://localhost:5000/api/stockmaster";
const LOCATIONS = ["Vadalur", "Bangalore", "Tirupur"];

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Generate product ID from the first two letters of the product name.
// Example: Pen -> PE01, Pencil -> PE02, Paper -> PA01.
const generateProductId = (productName, products) => {
  const prefix =
    productName.trim().replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase() ||
    "PR";

  const existingNumbers = products.map((product) => {
    const match = String(product.productId || "")
      .toUpperCase()
      .match(new RegExp(`^${prefix}(\\d+)$`));
    return match ? Number(match[1]) : 0;
  });

  const nextNumber = Math.max(0, ...existingNumbers) + 1;
  return `${prefix}${String(nextNumber).padStart(2, "0")}`;
};

const emptyForm = {
  productId: "",
  productName: "",
  location: "Vadalur",
  receivedDate: getTodayDate(),
  yourName: "",
  totalQty: "",
};

const emptyRestockForm = {
  qty: "",
  assignDate: getTodayDate(),
  location: "Vadalur",
  updatedBy: "",
};

function formatDate(dateValue) {
  if (!dateValue) return "—";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ProductMaster() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [restockForm, setRestockForm] = useState({ ...emptyRestockForm });
  const [editingId, setEditingId] = useState(null);
  const [restockingProduct, setRestockingProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get(API_URL);
      setProducts(Array.isArray(response.data.data) ? response.data.data : []);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to fetch products. Please check the server."
      );
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => {
      const updatedForm = { ...previous, [name]: value };
      if (name === "productName" && !editingId) {
        updatedForm.productId = value.trim()
          ? generateProductId(value, products)
          : "";
      }
      return updatedForm;
    });
  };

  const handleRestockChange = (event) => {
    const { name, value } = event.target;
    setRestockForm((previous) => ({ ...previous, [name]: value }));
  };

  const resetForm = () => {
    setForm({ ...emptyForm, receivedDate: getTodayDate() });
    setEditingId(null);
    setMessage("");
    setError("");
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setRestockingProduct(null);
    setForm({
      productId: product.productId || "",
      productName: product.productName || "",
      location: LOCATIONS.includes(product.location) ? product.location : "Vadalur",
      receivedDate: product.receivedDate
        ? String(product.receivedDate).slice(0, 10)
        : getTodayDate(),
      yourName: product.yourName || "",
      totalQty: String(product.totalQty ?? ""),
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (
      !form.productName.trim() ||
      !form.productId.trim() ||
      !form.location ||
      !form.receivedDate ||
      !form.yourName.trim()
    ) {
      setError("Product ID, Product Name, Location, Received Date and Your Name are required.");
      return;
    }

    const totalQty = Number(form.totalQty);
    if (form.totalQty === "" || !Number.isFinite(totalQty) || totalQty < 0) {
      setError("Please enter a valid Total Quantity.");
      return;
    }

    const payload = {
      productId: form.productId.trim(),
      productName: form.productName.trim(),
      location: form.location,
      receivedDate: form.receivedDate,
      yourName: form.yourName.trim(),
      totalQty,
    };

    setLoading(true);
    try {
      if (editingId) {
        const response = await axios.put(`${API_URL}/update/${editingId}`, {
          productName: payload.productName,
          location: payload.location,
          receivedDate: payload.receivedDate,
          yourName: payload.yourName,
          totalQty: payload.totalQty,
        });
        setMessage(response.data.message || "Product updated successfully.");
      } else {
        const response = await axios.post(`${API_URL}/create`, payload);
        setMessage(response.data.message || "Product created successfully.");
      }

      setForm({ ...emptyForm, receivedDate: getTodayDate() });
      setEditingId(null);
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save product.");
    } finally {
      setLoading(false);
    }
  };

  const openRestock = (product) => {
    setRestockingProduct(product);
    setEditingId(null);
    setForm({ ...emptyForm, receivedDate: getTodayDate() });
    setRestockForm({
      ...emptyRestockForm,
      assignDate: getTodayDate(),
      location: LOCATIONS.includes(product.location) ? product.location : "Vadalur",
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRestockSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    const quantity = Number(restockForm.qty);
    if (restockForm.qty === "" || !Number.isFinite(quantity) || quantity <= 0) {
      setError("Restock quantity must be greater than zero.");
      return;
    }
    if (!restockForm.assignDate || !restockForm.location || !restockForm.updatedBy.trim()) {
      setError("Restock Date, Location and Updated By are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/restock/${restockingProduct._id}`,
        {
          qty: quantity,
          assignDate: restockForm.assignDate,
          location: restockForm.location,
          updatedBy: restockForm.updatedBy.trim(),
        }
      );
      setMessage(response.data.message || "Product restocked successfully.");
      setRestockingProduct(null);
      setRestockForm({ ...emptyRestockForm, assignDate: getTodayDate() });
      await fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to restock product.");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const term = search.trim().toLowerCase();
    return (
      String(product.productId || "").toLowerCase().includes(term) ||
      String(product.productName || "").toLowerCase().includes(term) ||
      String(product.location || "").toLowerCase().includes(term) ||
      String(product.yourName || "").toLowerCase().includes(term) ||
      formatDate(product.receivedDate).toLowerCase().includes(term)
    );
  });

  return (
    <div className="stock-page">
      <header className="stock-header">
        <div className="stock-header-icon">▦</div>
        <div>
          <h1>Product Management</h1>
          <p>Add, edit and restock products</p>
        </div>
        <button type="button" className="stock-save-btn" onClick={() => navigate("/lcc")}>
          Go to LCC
        </button>
      </header>

      <main className="stock-content">
        <section className="stock-card">
          <div className="stock-card-heading">
            <h2>{editingId ? "Edit Product" : "Add Product"}</h2>
          </div>
          {message && <div className="stock-success">{message}</div>}
          {error && <div className="stock-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="stock-form-grid">
              <label>
                Product Name *
                <input
                  type="text"
                  name="productName"
                  value={form.productName}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  required
                />
              </label>

              <label>
                Product ID *
                <input
                  type="text"
                  name="productId"
                  value={form.productId}
                  placeholder="Generated automatically"
                  readOnly
                  required
                />
              </label>

              <label>
                Location *
                <select name="location" value={form.location} onChange={handleChange} required>
                  {LOCATIONS.map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </label>

              <label>
                Received Date *
                <input
                  type="date"
                  name="receivedDate"
                  value={form.receivedDate}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Your Name *
                <input
                  type="text"
                  name="yourName"
                  value={form.yourName}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />
              </label>

              <label>
                Total Qty *
                <input
                  type="number"
                  name="totalQty"
                  min="0"
                  step="any"
                  value={form.totalQty}
                  onChange={handleChange}
                  placeholder="Enter total quantity"
                  required
                />
              </label>
            </div>

            <p className="stock-hint">
              {editingId
                ? "Product ID cannot be changed. Update the other details and save."
                : "Enter the product name to generate its ID automatically."}
            </p>

            <div className="stock-form-actions">
              <button type="button" className="stock-reset-btn" onClick={resetForm}>Reset</button>
              <button type="submit" className="stock-save-btn" disabled={loading}>
                {loading ? "Saving..." : editingId ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </form>
        </section>

        {restockingProduct && (
          <section className="stock-card">
            <div className="stock-card-heading">
              <h2>Restock: {restockingProduct.productName}</h2>
            </div>
            {message && <div className="stock-success">{message}</div>}
            {error && <div className="stock-error">{error}</div>}
            <p>
              Product ID: <strong>{restockingProduct.productId}</strong> | Total Qty: <strong>{restockingProduct.totalQty}</strong> | Balance Qty: <strong>{restockingProduct.balanceQty}</strong>
            </p>

            <form onSubmit={handleRestockSubmit}>
              <div className="stock-form-grid">
                <label>
                  Restock Quantity *
                  <input type="number" name="qty" min="0.01" step="any" value={restockForm.qty} onChange={handleRestockChange} placeholder="Enter quantity" required />
                </label>
                <label>
                  Restock Date *
                  <input type="date" name="assignDate" value={restockForm.assignDate} onChange={handleRestockChange} required />
                </label>
                <label>
                  Location *
                  <select name="location" value={restockForm.location} onChange={handleRestockChange} required>
                    {LOCATIONS.map((location) => <option key={location} value={location}>{location}</option>)}
                  </select>
                </label>
                <label>
                  Updated By *
                  <input type="text" name="updatedBy" value={restockForm.updatedBy} onChange={handleRestockChange} placeholder="Enter your name" required />
                </label>
              </div>
              <div className="stock-form-actions">
                <button type="button" className="stock-reset-btn" onClick={() => { setRestockingProduct(null); setMessage(""); setError(""); }}>Cancel</button>
                <button type="submit" className="stock-save-btn" disabled={loading}>
                  {loading ? "Restocking..." : "Confirm Restock"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="stock-card stock-list-card">
          <div className="stock-list-heading">
            <h2>Product List</h2>
            <input
              type="text"
              className="stock-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by ID, name, location, date or your name..."
            />
          </div>

          <div className="stock-table-wrapper">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th>Received Date</th>
                  <th>Your Name</th>
                  <th>Location</th>
                  <th>Total Qty</th>
                  <th>Balance Qty</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="stock-empty">
                      {search ? "No matching product records found." : "No product records found."}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product, index) => (
                    <tr key={product._id}>
                      <td>{index + 1}</td>
                      <td>{product.productId}</td>
                      <td>{product.productName}</td>
                      <td>{formatDate(product.receivedDate)}</td>
                      <td>{product.yourName || "—"}</td>
                      <td>{product.location || "—"}</td>
                      <td>{product.totalQty}</td>
                      <td>{product.balanceQty}</td>
                      <td>
                        <button type="button" className="stock-edit-btn" onClick={() => handleEdit(product)}>Edit</button>{" "}
                        <button type="button" className="stock-save-btn" onClick={() => openRestock(product)}>+ Restock</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ProductMaster;
