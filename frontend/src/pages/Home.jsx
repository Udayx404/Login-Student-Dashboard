import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Decode student info from JWT token stored after login
  const token = localStorage.getItem("token");
  const [student, setStudent] = useState({
    name: "Loading...",
    email: "",
    rollno: "",
  });

  useEffect(() => {
  if (!token) {
    navigate("/login");
    return;
  }
  // Fetch real user data from backend
  fetch("http://localhost:4000/iiest/api/user/me", {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setStudent({
          name: data.user.name,
          email: data.user.email,
          rollno: data.user.rollno,
        });
      } else {
        navigate("/login");
      }
    })
    .catch(() => navigate("/login"));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setUploadSuccess(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
      setUploadSuccess(false);
    }
  };

  const handleUpload = () => {
    if (!uploadedFile) return;
    // Simulate upload — replace with actual API call
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 3000);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const initials = student.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f7f8fa",
      fontFamily: "'Trebuchet MS', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Subtle background blobs */}
      <div style={{
        position: "fixed", top: -100, right: -100,
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(46,125,50,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", bottom: -80, left: -80,
        width: 350, height: 350, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(2,136,209,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Top navbar */}
      <nav style={{
        background: "#ffffff",
        borderBottom: "1px solid #e8e8e8",
        padding: "0 40px",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 10,
        boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 25, color: "#1a1a1a", letterSpacing: "0.03em" }}>
            IIEST Shibpur
          </span>
        </div>
        <button onClick={handleLogout} style={{
          background: "transparent",
          border: "1.5px solid #e0e0e0",
          borderRadius: 6, padding: "7px 16px",
          fontSize: 12.5, color: "#666", cursor: "pointer",
          letterSpacing: "0.1em", textTransform: "uppercase",
          transition: "all 0.2s",
          fontFamily: "'Trebuchet MS', sans-serif",
        }}
          onMouseEnter={e => { e.target.style.borderColor = "#e53935"; e.target.style.color = "#e53935"; }}
          onMouseLeave={e => { e.target.style.borderColor = "#e0e0e0"; e.target.style.color = "#666"; }}
        >
          Logout
        </button>
      </nav>

      {/* Main content */}
      <div style={{
        maxWidth: 600,
        margin: "48px auto",
        padding: "0 20px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}>

        {/* Page title */}
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#1a1a1a" }}>
            Student Dashboard
          </h1>
          <p style={{ margin: "15px 0 0", fontSize: 16, color: "#999" }}>
            Welcome back! Here are your details.
          </p>
        </div>

        {/* Student Details Card */}
        <div style={{
          background: "linear-gradient(135deg, #e8f5e9 0%, #e3f2fd 100%)",
          border: "1px solid rgba(46,125,50,0.15)",
          borderRadius: 16,
          padding: "32px 36px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Decorative circle */}
          <div style={{
            position: "absolute", top: -30, right: -30,
            width: 120, height: 120, borderRadius: "50%",
            background: "rgba(46,125,50,0.07)",
            pointerEvents: "none",
          }} />

          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
            {/* Avatar */}
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "linear-gradient(135deg, #2e7d32, #43a047)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26, fontWeight: 700, color: "#fff",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(46,125,50,0.3)",
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 25, fontWeight: 700, color: "#1a1a1a" }}>{student.name}</div>
              <div style={{
                fontSize: 11, color: "#2e7d32", background: "rgba(46,125,50,0.1)",
                display: "inline-block", padding: "2px 10px", borderRadius: 20,
                marginTop: 4, letterSpacing: "0.1em", textTransform: "uppercase",
              }}>
                Registered Student
              </div>
            </div>
          </div>

          {/* Detail rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <DetailRow label="Name" value={student.name} />
            <DetailRow label="Roll Number" value={student.rollno} />
            <DetailRow label="Email" value={student.email} />
            <DetailRow label="Institution" value="IIEST Shibpur" />
          </div>
        </div>

        {/* Upload Card */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e8e8e8",
          borderRadius: 16,
          padding: "28px 36px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
        }}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1a1a1a" }}>
              Upload Document
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 15, color: "#999" }}>
              Upload any file from your device for OCR processing
            </p>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("fileInput").click()}
            style={{
              border: `2px dashed ${dragOver ? "#2e7d32" : uploadedFile ? "#0288d1" : "#d0d0d0"}`,
              borderRadius: 10,
              padding: "28px 20px",
              textAlign: "center",
              cursor: "pointer",
              background: dragOver ? "#f0faf0" : uploadedFile ? "#f0f8ff" : "#fafafa",
              transition: "all 0.2s ease",
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 35, marginBottom: 8 }}>
              {uploadedFile ? "📄" : "📂"}
            </div>
            {uploadedFile ? (
              <>
                <div style={{ fontSize: 17, fontWeight: 600, color: "#0288d1" }}>
                  {uploadedFile.name}
                </div>
                <div style={{ fontSize: 13.9, color: "#999", marginTop: 4 }}>
                  {(uploadedFile.size / 1024).toFixed(1)} KB · Click to change file
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 17, fontWeight: 600, color: "#555" }}>
                  Drag & drop a file here
                </div>
                <div style={{ fontSize: 14, color: "#aaa", marginTop: 4 }}>
                  or click to browse from your device
                </div>
              </>
            )}
            <input
              id="fileInput"
              type="file"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={!uploadedFile}
            style={{
              width: "100%", padding: "13px",
              background: uploadSuccess
                ? "linear-gradient(135deg, #388e3c, #43a047)"
                : uploadedFile
                  ? "linear-gradient(135deg, #0277bd, #0288d1)"
                  : "#e0e0e0",
              border: "none", borderRadius: 8,
              color: uploadedFile ? "#ffffff" : "#aaa",
              fontSize: 14, letterSpacing: "0.2em", textTransform: "uppercase",
              fontFamily: "'Trebuchet MS', sans-serif",
              fontWeight: 700,
              cursor: uploadedFile ? "pointer" : "not-allowed",
              transition: "all 0.3s ease",
              boxShadow: uploadedFile && !uploadSuccess
                ? "0 4px 16px rgba(2,136,209,0.3)" : "none",
            }}
          >
            {uploadSuccess ? "Uploaded Successfully" : "Upload File"}
          </button>
        </div>

      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "10px 14px",
      background: "rgba(255,255,255,0.6)",
      borderRadius: 8,
      border: "1px solid rgba(255,255,255,0.8)",
    }}>
      <span style={{ fontSize: 16, width: 22, textAlign: "center" }}>{icon}</span>
      <span style={{ fontSize: 13.5, color: "#388a97", width: 110, flexShrink: 0, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
        {label}
      </span>
      <span style={{ fontSize: 17, color: "#1a1a1a", fontWeight: 580 }}>
        {value}
      </span>
    </div>
  );
}
