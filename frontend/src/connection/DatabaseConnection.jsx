// ─────────────────────────────────────────────────────────────────────────────
// connection/DatabaseConnection.jsx — DEV/DEBUG UTILITY (not part of main app)
//
// This page exists ONLY to verify that the database connection is working.
// It hits /database-connection (a backend endpoint that tests DB connectivity)
// and displays either a success message or "Database Connection Failed".
//
// Accessible at: /database-connection
// NOT linked from any navigation — only used manually during development.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import api from "../services/api";

function DatabaseConnection() {
  const [message, setMessage] = useState("Checking connection...");

  useEffect(() => {
    api
      .get("/database-connection")
      .then((response) => {
        setMessage(response.data);
      })
      .catch(() => {
        setMessage(" Database Connection Failed");
      });
  }, []);

  return (
    <div className="text-center max-w-7xl mx-auto min-h-screen flex flex-col justify-center">
      <h1 className="text-3xl">{message}</h1>
    </div>
  );
}

export default DatabaseConnection;