import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./LoginModel.css";

function LoginModal({ onClose }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.username.trim()) {
      setError("Please enter your username.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Login API
      const response = await api.post("login/", {
        username: formData.username.trim(),
        password: formData.password,
      });

      // Get user information
      const user = response.data.user;

      // Store authentication tokens
      localStorage.setItem(
        "access_token",
        response.data.access
      );

      localStorage.setItem(
        "refresh_token",
        response.data.refresh
      );

      // Store user information including role
      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      // Close login modal
      onClose();

      // Role-based navigation
      if (user.role === "Teacher") {
        navigate("/teacher/students");
      } else if (user.role === "Admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/student/dashboard");
      }

    } catch (error) {
      console.log(
        "LOGIN ERROR:",
        error.response?.data
      );

      if (error.response?.status === 401) {
        setError("Invalid username or password.");
      } else if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError(
          "Unable to connect to the server. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    if (loading) return;

    onClose();
    navigate("/register");
  };

  return (
    <div
      className="login-overlay"
      onClick={loading ? undefined : onClose}
    >
      <div
        className="login-modal"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Close Button */}
        <button
          type="button"
          className="close-btn"
          onClick={onClose}
          disabled={loading}
          aria-label="Close login"
        >
          &times;
        </button>

        {/* Header */}
        <div className="login-header">

          <div className="login-icon">
            🎓
          </div>

          <h2>Welcome Back</h2>

          <p>
            Sign in to access your Student Performance AI
            dashboard.
          </p>

        </div>

        {/* Error Message */}
        {error && (
          <div
            className="login-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
        >

          {/* Username */}
          <div className="form-group">

            <label htmlFor="username">
              Username
            </label>

            <input
              id="username"
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              disabled={loading}
              required
            />

          </div>

          {/* Password */}
          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <div className="password-wrapper">

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={loading}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    (prev) => !prev
                  )
                }
                disabled={loading}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >

            {loading ? (
              <>
                <span className="login-spinner"></span>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}

          </button>

        </form>

        {/* Register */}
        <div className="register-text">

          <span>
            Don't have an account?
          </span>{" "}

          <button
            type="button"
            onClick={handleRegister}
            disabled={loading}
          >
            Create an account
          </button>

        </div>

      </div>
    </div>
  );
}

export default LoginModal;