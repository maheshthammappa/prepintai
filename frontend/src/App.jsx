import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import DatabaseConnection from "./connection/DatabaseConnection";
import BackendConnection from "./connection/BackendConnection";

function App() {
  return (
    <BrowserRouter basename="/prepintai">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/database-connection" element={<DatabaseConnection />}></Route>
        <Route path="/backend-connection" element={<BackendConnection />} />

        <Route path="*" element={<h1 className="text-center text-5xl min-h-screen flex flex-col items-center justify-center">There is no Route for this URL in the frontend </h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;