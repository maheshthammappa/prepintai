// ─────────────────────────────────────────────────────────────────────────────
// App.jsx — ROOT COMPONENT & APPLICATION ROUTER
//
// PURPOSE:
//   This is the top-level React component. It is responsible for setting up
//   the application's global context (Authentication) and defining all URL routes.
//
// DATA FLOW & ARCHITECTURE:
//   1. Global State (Context):
//      The entire app is wrapped in `<AuthProvider>`. This means ANY component
//      inside the app can call `useAuth()` to instantly access the currently
//      logged-in user's data (username, token, etc.) and login/logout functions.
//
//   2. Routing (React Router):
//      `<BrowserRouter>` intercepts URL changes (e.g., when a user clicks a link
//      to "/dashboard"). Instead of refreshing the page, React Router looks at
//      the `<Routes>` block below and instantly renders the matching component.
//
//   3. Protected Routes:
//      Routes like `/dashboard` or `/interview` are wrapped in `<ProtectedRoute>`.
//      When a user navigates to these URLs, `ProtectedRoute` checks the `AuthProvider`
//      to see if a valid token exists. If yes, it renders `<DashboardPage />`.
//      If no, it kicks the user back to the `/login` page.
//
//   4. The "Shell" Pattern:
//      Notice that ALL protected routes render `<DashboardPage />`. 
//      Instead of loading completely new pages, `<DashboardPage />` acts as a 
//      persistent "Shell" (keeping the sidebar and top navbar alive) and only 
//      swaps out the middle content area based on the specific URL.
// ─────────────────────────────────────────────────────────────────────────────
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DatabaseConnection from "./connection/DatabaseConnection";
import BackendConnection from "./connection/BackendConnection";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ui/ProtectedRoute";

function App() {
  return (
    // AuthProvider makes user/token/login/logout available to all child components
    <AuthProvider>
      {/* BrowserRouter enables URL-based navigation. basename="/prepintai" means
          all routes are relative to /prepintai (e.g. the GitHub Pages deployment path) */}
      <BrowserRouter basename="/prepintai">
        <Routes>
          {/* ── PUBLIC ROUTES ── accessible without login ── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* ── PROTECTED ROUTES ── ProtectedRoute checks auth before rendering ── */}
          {/* All these routes render <DashboardPage /> which internally swaps its content
              based on the current URL path */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/standard-practice" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/interview" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/resume-practice" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/qa" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/report/:id" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          
          {/* ── DEV/DEBUG ROUTES ── for testing server connectivity only ── */}
          <Route path="/database-connection" element={<DatabaseConnection />} />
          <Route path="/backend-connection" element={<BackendConnection />} />

          {/* ── CATCH-ALL ── shown for any URL that doesn't match a defined route ── */}
          <Route path="*" element={<h1 className="text-center text-5xl min-h-screen flex flex-col items-center justify-center">There is no Route for this URL in the frontend </h1>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;