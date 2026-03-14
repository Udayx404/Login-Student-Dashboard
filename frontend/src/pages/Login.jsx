import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const COLLEGE_NAME = "IIEST Shibpur";
const API = "http://localhost:4000/iiest/api/user";

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");  // login / register / otp
  const [form, setForm] = useState({ name: "", rollno: "", email: "", password: "" });
  const [otpValues, setOtpValues] = useState(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");  // email waiting for OTP
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef()];

  const handleChange = (e) => {
    setError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setForm({ name: "", rollno: "", email: "", password: "" });
    setOtpValues(["", "", "", "", ""]);
    setError("");
    setSuccessMsg("");
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // digits only
    const newOtp = [...otpValues];
    newOtp[index] = value.slice(-1); // only last char
    setOtpValues(newOtp);
    setError("");
    if (value && index < 4) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
    if (e.key === "Enter") handleVerifyOTP();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 5);
    const newOtp = ["", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) newOtp[i] = pasted[i];
    setOtpValues(newOtp);
    if (pasted.length > 0) otpRefs[Math.min(pasted.length, 4)].current.focus();
  };

  const handleLogin = async () => {
    setError(""); 
    setLoading(true);
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        navigate("/home");
      } else {
        setError(data.message);
      }
    } catch {
      setError("Cannot connect to server. Is the backend running?");
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    setError(""); 
    setLoading(true);
    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setPendingEmail(form.email);
        setMode("otp");
        setSuccessMsg(`OTP sent to ${form.email}`);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Cannot connect to server. Is the backend running?");
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    const otp = otpValues.join("");
    if (otp.length < 5) {
      setError("Please enter all 5 digits."); 
      return; 
    }
    setError(""); 
    setLoading(true);
    try {
      const res = await fetch(`${API}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, otp }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        navigate("/home");
      } else {
        setError(data.message);
        setOtpValues(["", "", "", "", ""]);
        otpRefs[0].current.focus();
      }
    } catch {
      setError("Cannot connect to server.");
    }
    setLoading(false);
  };

  const handleResendOTP = async () => {
    setError(""); 
    setLoading(true);
    try {
      const res = await fetch(`${API}/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("New OTP sent to your email!");
        setOtpValues(["", "", "", "", ""]);
        otpRefs[0].current.focus();
      } else {
        setError(data.message);
      }
    } catch {
      setError("Cannot connect to server.");
    }
    setLoading(false);
  };

  const handleSubmit = () => {
    if (mode === "login") handleLogin();
    else if (mode === "register") handleRegister();
  };

  const isLogin = mode === "login";
  const isOTP = mode === "otp";
  const accent = isLogin ? "#2e7d32" : "#0288d1";
  const accentLight = isLogin ? "#e8f5e9" : "#e1f5fe";
  const accentMid = isLogin ? "#43a047" : "#039be5";
  const accentBorder = isLogin ? "rgba(46,125,50,0.3)" : "rgba(2,136,209,0.3)";

  return (
    <div style={{
      minHeight: "100vh", background: "#ffffff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Trebuchet MS', sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      {/* Background blobs */}
      <div style={{ position: "absolute", top: "-80px", left: "-80px", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(46,125,50,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-60px", right: "-60px", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(2,136,209,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{
        position: "relative", zIndex: 1, width: "100%", maxWidth: 430,
        background: "#ffffff", border: `1px solid ${isOTP ? "rgba(2,136,209,0.3)" : accentBorder}`,
        borderRadius: 12,
        boxShadow: `0 8px 40px rgba(0,0,0,0.08), 0 0 0 1px ${isOTP ? "rgba(2,136,209,0.3)" : accentBorder}`,
        overflow: "hidden", transition: "border-color 0.4s, box-shadow 0.4s",
      }}>
        {/* Top bar */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${isOTP ? "#0277bd" : accent}, ${isOTP ? "#039be5" : accentMid})`, transition: "background 0.4s" }} />

        {/* Header */}
        <div style={{
          padding: "32px 40px 22px", textAlign: "center",
          borderBottom: `1px solid ${isOTP ? "rgba(2,136,209,0.2)" : accentBorder}`,
          background: isOTP ? "#e1f5fe" : accentLight,
          transition: "background 0.4s",
        }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#1a1a1a", letterSpacing: "0.04em" }}>
            {COLLEGE_NAME}
          </h1>
          <div style={{ marginTop: 6, fontSize: 15, color: isOTP ? "#0288d1" : accent, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            Student Registration Portal (OCR)
          </div>
        </div>

        {/* Tabs — hidden on OTP screen */}
        {!isOTP && (
          <div style={{ display: "flex", borderBottom: `1px solid ${accentBorder}`, background: "#fafafa" }}>
            {["login", "register"].map((tab) => {
              const tabAccent = tab === "login" ? "#2e7d32" : "#0288d1";
              const active = mode === tab;
              return (
                <button key={tab} onClick={() => switchMode(tab)} style={{
                  flex: 1, padding: "13px 0", background: active ? "#ffffff" : "transparent",
                  border: "none", borderBottom: active ? `2.5px solid ${tabAccent}` : "2.5px solid transparent",
                  color: active ? tabAccent : "#aaa", fontSize: 13.5, letterSpacing: "0.2em",
                  textTransform: "uppercase", fontFamily: "'Trebuchet MS', sans-serif",
                  fontWeight: active ? 700 : 400, cursor: "pointer", transition: "all 0.2s ease",
                }}>
                  {tab}
                </button>
              );
            })}
          </div>
        )}

        {/* ── OTP Screen ─────────────────────────────────────── */}
        {isOTP ? (
          <div style={{ padding: "32px 40px 36px", background: "#ffffff" }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>📧</div>
              <h2 style={{ margin: 0, fontSize: 21, fontWeight: 700, color: "#1a1a1a" }}>
                Verify Your Email
              </h2>
              <p style={{ margin: "8px 0 0", fontSize: 14, color: "#888", lineHeight: 1.6 }}>
                We sent a 5-digit OTP to<br />
                <strong style={{ color: "#0288d1" }}>{pendingEmail}</strong>
              </p>
            </div>

            {/* 5 OTP boxes */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 24 }}>
              {otpValues.map((val, i) => (
                <input
                  key={i}
                  ref={otpRefs[i]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  style={{
                    width: 52, height: 58, textAlign: "center",
                    fontSize: 24, fontWeight: 700,
                    border: `2px solid ${val ? "#0288d1" : "#e0e0e0"}`,
                    borderRadius: 10, outline: "none",
                    background: val ? "#e1f5fe" : "#f9f9f9",
                    color: "#0277bd",
                    fontFamily: "'Trebuchet MS', sans-serif",
                    transition: "border-color 0.2s, background 0.2s",
                    boxSizing: "border-box",
                  }}
                />
              ))}
            </div>

            {/* Error / success messages */}
            {error && (
              <div style={{ background: "#ffebee", border: "1px solid #ffcdd2", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#c62828", textAlign: "center" }}>
                ❌ {error}
              </div>
            )}
            {successMsg && !error && (
              <div style={{ background: "#e8f5e9", border: "1px solid #c8e6c9", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#2e7d32", textAlign: "center" }}>
                ✅ {successMsg}
              </div>
            )}

            {/* Verify button */}
            <button onClick={handleVerifyOTP} disabled={loading} style={{
              width: "100%", padding: "13px", marginBottom: 14,
              background: loading ? "#b0bec5" : "linear-gradient(135deg, #0277bd, #0288d1)",
              border: "none", borderRadius: 6, color: "#fff",
              fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase",
              fontFamily: "'Trebuchet MS', sans-serif", fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 4px 16px rgba(2,136,209,0.25)",
              transition: "all 0.3s",
            }}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <div style={{ textAlign: "center", fontSize: 13, color: "#aaa" }}>
              Didn't receive it?{" "}
              <span onClick={!loading ? handleResendOTP : undefined} style={{
                color: "#0288d1", cursor: "pointer", textDecoration: "underline",
              }}>
                Resend OTP
              </span>
              {" · "}
              <span onClick={() => switchMode("register")} style={{
                color: "#888", cursor: "pointer", textDecoration: "underline",
              }}>
                Go back
              </span>
            </div>
          </div>

        ) : (
          /* ── Login / Register form ───────────────────────── */
          <div style={{ padding: "28px 40px 34px", background: "#ffffff" }}>
            <div style={{ marginBottom: 22 }}>
              <h2 style={{ margin: 0, fontSize: 23, fontWeight: 700, color: "#1a1a1a" }}>
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p style={{ margin: "5px 0 0", fontSize: 16, color: "#888" }}>
                {isLogin ? "Sign in to your student account" : "Register as a new student"}
              </p>
            </div>

            {!isLogin && (
              <Field label="Full Name" name="name" type="text" placeholder="Enter your full name"
                value={form.name} onChange={handleChange} accent={accent} onSubmit={handleSubmit} />
            )}
            <Field label="Roll Number" name="rollno" type="text" placeholder="e.g. 2024CSB***"
              value={form.rollno} onChange={handleChange} accent={accent} onSubmit={handleSubmit} />
            <Field label="Email (gsuite)" name="email" type="email" placeholder="you@example.com"
              value={form.email} onChange={handleChange} accent={accent} onSubmit={handleSubmit} />
            <Field label="Password" name="password" type="password" placeholder="••••••••"
              value={form.password} onChange={handleChange} accent={accent} onSubmit={handleSubmit} />

            {/* Error message */}
            {error && (
              <div style={{ background: "#ffebee", border: "1px solid #ffcdd2", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: "#c62828" }}>
                ❌ {error}
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading} style={{
              width: "100%", padding: "13px", marginTop: 4,
              background: loading ? "#b0bec5" : `linear-gradient(135deg, ${accent} 0%, ${accentMid} 100%)`,
              border: "none", borderRadius: 6, color: "#ffffff",
              fontSize: 14, letterSpacing: "0.25em", textTransform: "uppercase",
              fontFamily: "'Trebuchet MS', sans-serif", fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              boxShadow: `0 4px 16px ${isLogin ? "rgba(46,125,50,0.25)" : "rgba(2,136,209,0.25)"}`,
            }}>
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Register"}
            </button>

            <p style={{ textAlign: "center", marginTop: 18, fontSize: 15, color: "#aaa" }}>
              {isLogin ? "New student? " : "Already registered? "}
              <span onClick={() => switchMode(isLogin ? "register" : "login")} style={{
                color: accent, cursor: "pointer", textDecoration: "underline",
              }}>
                {isLogin ? "Register here" : "Sign in"}
              </span>
            </p>
          </div>
        )}

        {/* Bottom bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${isOTP ? "#039be5" : accentMid}, transparent)`, transition: "background 0.4s" }} />
      </div>
    </div>
  );
}

function Field({ label, name, type, placeholder, value, onChange, accent, onSubmit }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: "block", marginBottom: 6, fontSize: 13,
        letterSpacing: "0.18em", textTransform: "uppercase",
        color: focused ? accent : "#999",
        fontFamily: "'Trebuchet MS', sans-serif", transition: "color 0.2s",
      }}>
        {label}
      </label>
      <input
        name={name} type={type} placeholder={placeholder} value={value}
        onChange={onChange}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onSubmit(); } }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", padding: "11px 13px",
          background: focused ? "#fafffe" : "#f9f9f9",
          border: `1.5px solid ${focused ? accent : "#e0e0e0"}`,
          borderRadius: 6, color: "#1a1a1a",
          fontSize: 15, fontFamily: "'Trebuchet MS', sans-serif",
          outline: "none", boxSizing: "border-box",
          transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
          boxShadow: focused ? `0 0 0 3px ${accent}18` : "none",
        }}
      />
    </div>
  );
}
