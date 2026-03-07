import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";

function App() {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>🎉 Socratic Tutor</h1>
      <p>React is working!</p>
      <p>API URL: {import.meta.env.VITE_API_URL || "not set"}</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
