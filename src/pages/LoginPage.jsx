import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { adminLogin, clearError } from "../store/slices/authSlice";
import toast from "react-hot-toast";
export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: "", password: "" });
  useEffect(() => {
    if (isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(adminLogin(form));
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
      }}
    >
      <div
        style={{
          background: "#111",
          border: "1px solid #222",
          borderRadius: 20,
          padding: "48px 40px",
          width: "100%",
          maxWidth: 400,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: "linear-gradient(135deg,#f59e0b,#ef4444)",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              margin: "0 auto 16px",
            }}
          >
            💪
          </div>
          <h1
            style={{
              color: "#fff",
              fontSize: 24,
              fontWeight: 900,
              marginBottom: 4,
            }}
          >
            HY Nutrition Admin
          </h1>
          <p style={{ color: "#6b7280", fontSize: 14 }}>
            Sign in to manage your store
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          {[
            ["email", "Email", "email", "admin@hynutrition.in"],
            ["password", "Password", "password", "••••••••"],
          ].map(([k, l, t, ph]) => (
            <div key={k} style={{ marginBottom: 16 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#9ca3af",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                {l}
              </label>
              <input
                type={t}
                value={form[k]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [k]: e.target.value }))
                }
                placeholder={ph}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "#1a1a1a",
                  border: "1px solid #333",
                  color: "#fff",
                  borderRadius: 8,
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: "#f59e0b",
              color: "#000",
              border: "none",
              padding: 14,
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: 8,
            }}
          >
            {loading ? "Signing in..." : "Sign In to Admin"}
          </button>
        </form>
        <p
          style={{
            textAlign: "center",
            color: "#4b5563",
            fontSize: 12,
            marginTop: 20,
          }}
        >
          Admin and Superadmin access only
        </p>
      </div>
    </div>
  );
}
