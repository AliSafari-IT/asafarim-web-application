import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Suspense } from "react";

// Layout
import Layout from "./components/layout/Layout";

// Pages
import Home from "./components/Home/Home";
import Dashboard from "./components/Dashboard/Dashboard";
import MarkdownViewer from "./components/MarkdownViewer/MarkdownViewer";
import Profile from "./components/Profile/Profile";
import UserSettings from "./components/UserSettings/UserSettings";

// Auth Components
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Styles
import "./styles/settings.css";
import ProjectsDisplay from "./components/ProjectsDisplay/ProjectsDisplay";
import AddProject from "./components/AddProject/AddProject";
import ProjectDetails from "./components/ProjectDetails/ProjectDetails";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTechStacks from "./pages/admin/AdminTechStacks";
import AdminRepositories from "./pages/admin/AdminRepositories";

// Component to conditionally render content based on the current route
const AppContent = () => {
  const location = useLocation();

  // Determine API base URL based on environment
  const getApiBaseUrl = () => {
    // For GitHub Pages deployment, use relative path or disable API calls
    if (window.location.hostname.includes("alisafari-it.github.io")) {
      // For demo purposes on GitHub Pages, we'll use mock data or disable server features
      return null; // This will disable server-dependent features
    }

    // For local development or production, use the local server URL
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    ) {
      return "http://localhost:3300"; // Adjust this URL as needed
    }

    // For asafarim.com, return the appropriate API base URL
    if (window.location.hostname === "asafarim.com") {
      return "https://asafarim.com/api"; // Adjust this URL as needed
    }

    // For asafarim.be, return the appropriate API base URL
    if (window.location.hostname === "asafarim.be") {
      return "https://asafarim.be/api"; // Adjust this URL as needed
    }
    // Default case, return null or a fallback URL
    console.warn("Unknown environment, API calls may not work as expected.");
    return null;
  };

  const serverErrorMessage = (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Server Error</h2>
      <p>
        This feature requires a server. Please visit the GitHub repository for
        full functionality.
      </p>
      <a
        href="https://github.com/AliSafari-IT/complete-md-viewer"
        target="_blank"
        rel="noopener noreferrer"
      >
        View on GitHub
      </a>
    </div>
  );

  const apiBaseUrl = getApiBaseUrl();
  console.log("Nodejs API Base URL:", apiBaseUrl);

  // If the path starts with /docs, render the StandaloneMarkdownViewer
  if (location.pathname.startsWith("/docs")) {
    // For GitHub Pages, redirect to static demo or show message
    if (!apiBaseUrl) {
      return serverErrorMessage;
    }

    return (
      <MarkdownViewer
        apiBaseUrl={apiBaseUrl}
        basePath="/docs"
        hideFileTree={false}
        integrated={false}
        key={`docs-${location.pathname}`} // Force re-render on path change
      />
    );
  }

  // If the path starts with /md-docs, render the IntegratedMarkdownViewer
  if (location.pathname.startsWith("/md-docs")) {
    // For GitHub Pages, redirect to static demo or show message
    if (!apiBaseUrl) {
      return serverErrorMessage;
    }

    return (
      <MarkdownViewer
        apiBaseUrl={apiBaseUrl}
        basePath="/md-docs"
        hideFileTree={false}
        integrated={true}
        key={`md-docs-${location.pathname}`} // Force re-render on path change
      />
    );
  }
  // Otherwise render the regular routes
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<ProtectedRoute ><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><ProjectsDisplay showUserProjectsOnly={true} showAddButton={true} /></ProtectedRoute>} />
      <Route path="/projects/new" element={<ProtectedRoute><AddProject /></ProtectedRoute>} />
      <Route path="/projects/:id" element={<ProjectDetails />} />
      <Route path="/projects/:id/edit" element={<ProtectedRoute><AddProject /></ProtectedRoute>} />
      <Route path="/admin/projects" element={<ProtectedRoute requiredRole="Admin"><AdminProjects /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute requiredRole="Admin"><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/techstacks" element={<ProtectedRoute requiredRole="Admin"><AdminTechStacks /></ProtectedRoute>} />
      <Route path="/admin/repositories" element={<ProtectedRoute requiredRole="Admin"><AdminRepositories /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  // Set basename for GitHub Pages deployment
  const basename =
    window.location.hostname === "alisafari-it.github.io"
      ? "/asafarim-web-application"
      : "";

  return (
      <AuthProvider>
        <div className="app">
          <BrowserRouter basename={basename}>
            <Layout>
              <Suspense fallback={<div>Loading...</div>}>
                <AppContent />
              </Suspense>
            </Layout>
          </BrowserRouter>
        </div>
      </AuthProvider>
  );
}

export default App;
