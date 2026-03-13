import { useState } from "react";
import { useNavigate } from "react-router-dom";


const COLLEGE_NAME = "IIEST Shibpur";

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", rollno: "", email: "", password: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const url = isLogin
        ? "http://localhost:4000/api/user/login"
        : "http://localhost:4000/api/user/register";

      const body = isLogin
        ? { rollno: form.rollno, email: form.email, password: form.password }
        : { name: form.name, rollno: form.rollno, email: form.email, password: form.password };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("studentName", form.name || "Student");
        localStorage.setItem("studentEmail", form.email);
        localStorage.setItem("studentRollno", form.rollno);
        navigate("/home");
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 2000);
      } else {
        alert(data.message); // shows error like "Invalid password"
      }
    } catch (error) {
      alert("Cannot connect to server. Is the backend running?");
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setForm({ name: "", rollno: "", password: "" });
    setSubmitted(false);
  };

  const isLogin = mode === "login";
  const accent = isLogin ? "#2e7d32" : "#0288d1";
  const accentLight = isLogin ? "#e8f5e9" : "#e1f5fe";
  const accentMid = isLogin ? "#43a047" : "#039be5";
  const accentBorder = isLogin ? "rgba(46,125,50,0.3)" : "rgba(2,136,209,0.3)";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Trebuchet MS', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: "-80px", left: "-80px",
        width: 350, height: 350, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(46,125,50,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-60px", right: "-60px",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(2,136,209,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: 600, height: 600, borderRadius: "50%",
        background: `radial-gradient(circle, ${isLogin ? "rgba(46,125,50,0.04)" : "rgba(2,136,209,0.04)"} 0%, transparent 70%)`,
        pointerEvents: "none", transition: "background 0.5s",
      }} />

      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: 430,
        background: "#ffffff",
        border: `1px solid ${accentBorder}`,
        borderRadius: 12,
        boxShadow: `0 8px 40px rgba(0,0,0,0.08), 0 0 0 1px ${accentBorder}`,
        overflow: "hidden",
        transition: "border-color 0.4s, box-shadow 0.4s",
      }}>
        <div style={{
          height: 4,
          background: `linear-gradient(90deg, ${accent}, ${accentMid})`,
          transition: "background 0.4s",
        }} />

        <div style={{
          padding: "32px 40px 22px", textAlign: "center",
          borderBottom: `1px solid ${accentBorder}`,
          background: accentLight,
          transition: "background 0.4s, border-color 0.4s",
        }}>
          <h1 style={{
            margin: 0, fontSize: 28, fontWeight: 700,
            color: "#1a1a1a", letterSpacing: "0.04em", lineHeight: 1.3,
            fontFamily: "'Trebuchet MS', sans-serif",
          }}>
            {COLLEGE_NAME}
          </h1>
          <div style={{
            marginTop: 6, fontSize: 15, color: accent,
            letterSpacing: "0.2em", textTransform: "uppercase",
            transition: "color 0.4s",
          }}>
            Student Registration Portal (OCR)
          </div>
        </div>

        <div style={{ display: "flex", borderBottom: `1px solid ${accentBorder}`, background: "#fafafa" }}>
          {["login", "register"].map((tab) => {
            const tabAccent = tab === "login" ? "#2e7d32" : "#0288d1";
            const active = mode === tab;
            return (
              <button key={tab} onClick={() => switchMode(tab)} style={{
                flex: 1, padding: "13px 0",
                background: active ? "#ffffff" : "transparent",
                border: "none",
                borderBottom: active ? `2.5px solid ${tabAccent}` : "2.5px solid transparent",
                color: active ? tabAccent : "#aaa",
                fontSize: 13.5, letterSpacing: "0.2em", textTransform: "uppercase",
                fontFamily: "'Trebuchet MS', sans-serif",
                fontWeight: active ? 700 : 400,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}>
                {tab}
              </button>
            );
          })}
        </div>

        <div style={{ padding: "28px 40px 34px", background: "#ffffff" }}>
          <div style={{ marginBottom: 22 }}>
            <h2 style={{
              margin: 0, fontSize: 23, fontWeight: 700,
              color: "#1a1a1a", letterSpacing: "0.02em",
              fontFamily: "'Trebuchet MS', sans-serif",
            }}>
              {isLogin ? "Welcome Back" : "Create Account"}
            </h2>
            <p style={{
              margin: "5px 0 0", fontSize: 16,
              color: "#888",
            }}>
              {isLogin ? "Sign in to your student account" : "Register as a new student"}
            </p>
          </div>

          {!isLogin && (
            <Field label="Full Name" name="name" type="text" placeholder=""
              value={form.name} onChange={handleChange} accent={accent} onSubmit={handleSubmit}/>
          )}
          <Field label="Roll Number" name="rollno" type="text" placeholder=""
            value={form.rollno} onChange={handleChange} accent={accent} onSubmit={handleSubmit}/>
          <Field label="Email (gsuite)" name="email" type="email" placeholder=""
            value={form.email} onChange={handleChange} accent={accent} onSubmit={handleSubmit}/>
          <Field label="Password" name="password" type="password" placeholder=""
            value={form.password} onChange={handleChange} accent={accent} onSubmit={handleSubmit}/>

          <button onClick={handleSubmit} style={{
            width: "100%", padding: "13px",
            marginTop: 6,
            background: submitted
              ? "#388e3c"
              : `linear-gradient(135deg, ${accent} 0%, ${accentMid} 100%)`,
            border: "none", borderRadius: 6,
            color: "#ffffff",
            fontSize: 14, letterSpacing: "0.25em", textTransform: "uppercase",
            fontFamily: "'Trebuchet MS', sans-serif",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: submitted
              ? "0 4px 16px rgba(56,142,60,0.35)"
              : `0 4px 16px ${isLogin ? "rgba(46,125,50,0.25)" : "rgba(2,136,209,0.25)"}`,
          }}>
            {submitted ? "Success" : isLogin ? "Sign In" : "Register"}
          </button>

          <p style={{
            textAlign: "center", marginTop: 18,
            fontSize: 15, color: "#aaa",
          }}>
            {isLogin ? "New student? " : "Already registered? "}
            <span onClick={() => switchMode(isLogin ? "register" : "login")} style={{
              color: accent, cursor: "pointer", textDecoration: "underline",
              transition: "color 0.3s",
            }}>
              {isLogin ? "Register here" : "Sign in"}
            </span>
          </p>
        </div>

        <div style={{
          height: 3,
          background: `linear-gradient(90deg, transparent, ${accentMid}, transparent)`,
          transition: "background 0.4s",
        }} />
      </div>
    </div>
  );
}

function Field({ label, name, type, placeholder, value, onChange, accent, onSubmit }) {
  const [focused, setFocused] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: "block", marginBottom: 6,
        fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase",
        color: focused ? accent : "#999",
        fontFamily: "'Trebuchet MS', sans-serif",
        transition: "color 0.2s",
      }}>
        {label}
      </label>
      <input
        name={name} type={type} placeholder={placeholder} value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
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