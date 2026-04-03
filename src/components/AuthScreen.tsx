import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError(flow === "signIn"
        ? "Invalid credentials. Please try again."
        : "Sign up failed. Please try a different email."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
    } catch (err) {
      setError("Failed to sign in as guest. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="auth-logo-ring" />
            <div className="auth-logo-inner">E</div>
          </div>
          <h1 className="auth-title">ElonGPT</h1>
          <p className="auth-subtitle">Mission Control Access</p>
        </div>

        <div className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                name="email"
                type="email"
                className="form-input"
                placeholder="astronaut@spacex.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                name="password"
                type="password"
                className="form-input"
                placeholder="Enter your password"
                required
                autoComplete={flow === "signIn" ? "current-password" : "new-password"}
              />
            </div>
            <input name="flow" type="hidden" value={flow} />

            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? "Connecting..." : flow === "signIn" ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="auth-toggle"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Create new account" : "Already have an account?"}
          </button>

          <button
            type="button"
            className="guest-btn"
            onClick={handleGuest}
            disabled={isLoading}
          >
            Continue as Guest
          </button>
        </div>
      </div>

      <footer className="app-footer" style={{ marginTop: "auto", paddingTop: 48 }}>
        Requested by <a href="https://twitter.com/OxPaulius" target="_blank" rel="noopener noreferrer">@OxPaulius</a> · Built by <a href="https://twitter.com/clonkbot" target="_blank" rel="noopener noreferrer">@clonkbot</a>
      </footer>
    </div>
  );
}
