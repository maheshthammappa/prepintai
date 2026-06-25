import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DatabaseConnection from "./connection/DatabaseConnection";
import BackendConnection from "./connection/BackendConnection";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/prepintai">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/standard-practice" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/interview" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/resume-practice" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/report/:id" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          
          <Route path="/database-connection" element={<DatabaseConnection />} />
          <Route path="/backend-connection" element={<BackendConnection />} />

          <Route path="*" element={<h1 className="text-center text-5xl min-h-screen flex flex-col items-center justify-center">There is no Route for this URL in the frontend </h1>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;