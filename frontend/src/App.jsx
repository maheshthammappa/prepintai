import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SetupPage from "./pages/SetupPage";
import InterviewPage from "./pages/InterviewPage";
import ReportPage from "./pages/ReportPage";
import DatabaseConnection from "./connection/DatabaseConnection";
import BackendConnection from "./connection/BackendConnection";

function App() {
  return (
    <BrowserRouter basename="/prepintai">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/database-connection" element={<DatabaseConnection />}></Route>
        <Route path="/backend-connection" element={<BackendConnection />} />

        <Route path="*" element={<h1 className="text-center text-5xl min-h-screen flex flex-col items-center justify-center">There is no Route for this URL in the frontend </h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;