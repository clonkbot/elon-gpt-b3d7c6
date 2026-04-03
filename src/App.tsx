import { useConvexAuth } from "convex/react";
import { AuthScreen } from "./components/AuthScreen";
import { ChatApp } from "./components/ChatApp";
import "./styles.css";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return <ChatApp />;
}

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="mars-logo">
          <svg viewBox="0 0 100 100" className="mars-icon">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="50" cy="50" r="8" fill="currentColor" />
          </svg>
        </div>
        <div className="loading-text">ESTABLISHING LINK</div>
        <div className="loading-bar">
          <div className="loading-bar-fill" />
        </div>
      </div>
    </div>
  );
}
