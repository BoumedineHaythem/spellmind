import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
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
  if (!isAuthenticated) return <Home />;
  
  return <Component />;
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
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

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

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
