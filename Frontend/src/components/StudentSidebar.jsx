import { NavLink } from "react-router-dom";
import "./StudentSidebar.css";
import logo from "../assets/FullLogo.jpg";

function StudentSidebar() {
  const navClass = ({ isActive }) =>
    `nav-item ${isActive ? "active" : ""}`;

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <img
            src={logo}
            alt="Student Performance AI"
            className="sidebar-logo-image"
          />
        </div>

        <div className="sidebar-brand">
          <h2>Student Performance AI</h2>
          <span>AI Learning Platform</span>
        </div>
      </div>

      {/* Core Modules */}
      <div className="sidebar-section">
        <p className="sidebar-title">CORE MODULES</p>

        <nav>
          <NavLink to="/student/dashboard" className={navClass}>
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/student/profile" className={navClass}>
            <span className="material-symbols-outlined">person</span>
            <span>My Profile</span>
          </NavLink>

          <NavLink to="/student/performance" className={navClass}>
            <span className="material-symbols-outlined">school</span>
            <span>Academic Performance</span>
          </NavLink>

          <NavLink to="/student/attendance" className={navClass}>
            <span className="material-symbols-outlined">event_available</span>
            <span>Attendance</span>
          </NavLink>

          <NavLink to="/student/study-habits" className={navClass}>
            <span className="material-symbols-outlined">schedule</span>
            <span>Study Habits</span>
            <span className="nav-badge">AI</span>
          </NavLink>

          <NavLink to="/student/assignments" className={navClass}>
            <span className="material-symbols-outlined">assignment</span>
            <span>Assignments & Exams</span>
          </NavLink>

          <NavLink to="/student/prediction" className={navClass}>
            <span className="material-symbols-outlined">auto_awesome</span>
            <span>Performance Prediction</span>
            <span className="nav-badge">AI</span>
          </NavLink>

          <NavLink to="/student/prediction-history" className={navClass}>
            <span className="material-symbols-outlined">history</span>
            <span>Prediction History</span>
          </NavLink>
        </nav>
      </div>

      {/* System */}
      <div className="system-section">
        <p className="sidebar-title">SYSTEM</p>

        <nav>
          <NavLink to="/student/settings" className={navClass}>
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </NavLink>

          <NavLink to="/student/help" className={navClass}>
            <span className="material-symbols-outlined">help</span>
            <span>Help & Support</span>
          </NavLink>

          <button
            type="button"
            className="nav-item logout"
            onClick={() => {
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");
              localStorage.removeItem("user");
              window.location.href = "/";
            }}
          >
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </aside>
  );
}

export default StudentSidebar;
