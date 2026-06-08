import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login"; // Import the new Login Page
import Dashboard from "./pages/Dashboard";
import Practice from "./pages/Practice";
import Statistics from "./pages/Statistics";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import SettingsPage from "./pages/Settings";
import Achievements from "./pages/Achievements";
import { useAuth } from "./_core/hooks/useAuth";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!isAuthenticated) return <Redirect to="/login" />; // Redirect to local login route
  
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} /> {/* Added local login route */}
      <Route path={"/dashboard"} component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path={"/practice"} component={() => <ProtectedRoute component={Practice} />} />
      <Route path={"/statistics"} component={() => <ProtectedRoute component={Statistics} />} />
      <Route path={"/leaderboard"} component={() => <ProtectedRoute component={Leaderboard} />} />
      <Route path={"/profile"} component={() => <ProtectedRoute component={Profile} />} />
      <Route path={"/settings"} component={() => <ProtectedRoute component={SettingsPage} />} />
      <Route path={"/achievements"} component={() => <ProtectedRoute component={Achievements} />} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;