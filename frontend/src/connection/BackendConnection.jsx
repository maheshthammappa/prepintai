// ─────────────────────────────────────────────────────────────────────────────
// connection/BackendConnection.jsx — DEV/DEBUG UTILITY (not part of main app)
//
// This page exists ONLY to verify that the Spring Boot backend server is
// running and reachable from the frontend. It hits /backend-connection and
// displays either a success message or "Backend Connection Failed".
//
// Accessible at: /backend-connection
// NOT linked from any navigation — only used manually during development.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import api from "../services/api";

function BackendConnection() {
  const [message, setMessage] = useState("Checking connection...");

  useEffect(() => {
    api
      .get("/backend-connection")
      .then((response) => {
        setMessage(response.data);
      })
      .catch(() => {
        setMessage("Backend Connection Failed");
      });
  }, []);

  return (
    <div className="text-center max-w-7xl mx-auto min-h-screen flex flex-col justify-center">
      <h1 className="text-3xl">{message}</h1>
    </div>
  );
}

export default BackendConnection;