import { useEffect, useState } from "react";
import api from "../services/api";

function Test() {
  const [message, setMessage] = useState("Checking connection...");

  useEffect(() => {
    api
      .get("/connection-test")
      .then((response) => {
        setMessage(response.data);
      })
      .catch(() => {
        setMessage("Connection Failed");
      });
  }, []);

  return (
    <div>
      <h1>{message}</h1>
    </div>
  );
}

export default Test;