import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./StudentDashboard.css";

function StudentDashboard() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================
  // DYNAMIC GREETING
  // =========================================
  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good Morning";
    } else if (hour < 17) {
      return "Good Afternoon";
    } else if (hour < 21) {
      return "Good Evening";
    } else {
      return "Good Night";
    }
  };

  // =========================================
  // LOGGED-IN USER
  // =========================================
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const userName =
    `${user.first_name || ""} ${user.last_name || ""}`.trim()
    || "Student";

  // =========================================
  // STUDENT INITIALS
  // =========================================
  const initials = userName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // =========================================
  // FETCH PREDICTION HISTORY
  // =========================================
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "student/prediction-history/"
        );
        const attendanceResponse = await api.get(
          "student/attendance/"
        );

        setAttendance(
          attendanceResponse.data.attendance || []
        );
        console.log(
          "Dashboard Prediction History:",
          response.data
        );

        setHistory(response.data.history || []);
      } catch (error) {
        console.error(
          "Dashboard History Error:",
          error.response?.data
        );

        setError(
          error.response?.data?.error ||
          "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // =========================================
  // DASHBOARD CALCULATIONS
  // =========================================

  const totalPredictions = history.length;

  const averagePredictedScore =
    totalPredictions > 0
      ? (
          history.reduce(
            (total, item) =>
              total + Number(item.predicted_final_marks || 0),
            0
          ) / totalPredictions
        ).toFixed(2)
      : 0;

  const latestPrediction =
    history.length > 0
      ? history[0]
      : null;

  const bestPrediction =
    history.length > 0
      ? Math.max(
          ...history.map(
            (item) =>
              Number(item.predicted_final_marks || 0)
          )
        )
      : 0;

  // Show maximum 5 recent predictions
  const recentPredictions = history.slice(0, 5);

  // Show maximum 5 subjects in chart
  const performanceData = history
    .slice(0, 5)
    .map((item) => ({
      subject: item.subject,
      score: Number(item.predicted_final_marks || 0),
    }));

  // =========================================
  // PERFORMANCE CATEGORY
  // =========================================
  const getPerformanceMessage = (score) => {
    if (score >= 80) {
      return "Excellent Performance";
    } else if (score >= 60) {
      return "Good Performance";
    } else if (score >= 40) {
      return "Average Performance";
    }

    return "Needs Improvement";
  };
  const totalClasses = attendance.reduce(
  (total, record) =>
    total + Number(record.total_classes || 0),
  0
);

const attendedClasses = attendance.reduce(
  (total, record) =>
    total + Number(record.attended_classes || 0),
  0
);

const absentClasses = totalClasses - attendedClasses;

const overallAttendance =
  totalClasses > 0
    ? ((attendedClasses / totalClasses) * 100).toFixed(2)
    : 0;

  return (
    <div className="dashboard-page">

      {/* =========================================
          TOP HEADER
      ========================================= */}
      <header className="top-header">

        <div className="search-box">
          <span className="material-symbols-outlined">
            search
          </span>

          <input
            type="text"
            placeholder="Search telemetry, cohorts, predictions..."
          />

          <span className="search-shortcut">
            /
          </span>
        </div>

        <div className="header-right">

          <div className="semester-info">
            <span className="material-symbols-outlined">
              calendar_month
            </span>

            <div>
              <span className="header-label">
                Current Semester
              </span>

              <span className="header-value">
                Student Dashboard
              </span>
            </div>
          </div>

          <div className="system-status">

            <span className="status-dot"></span>

            <div>
              <span className="header-label">
                Model Synced
              </span>

              <span className="header-value">
                Django REST Active
              </span>
            </div>

          </div>

          <div className="notification">
            <span className="material-symbols-outlined">
              notifications
            </span>

            <span className="notification-count">
              {totalPredictions}
            </span>
          </div>

          <div className="student-menu">

            <div className="student-avatar">
              {initials}
            </div>

            <div className="student-info">
              <strong>
                {userName}
              </strong>

              <span>
                Student
              </span>
            </div>

            <span className="material-symbols-outlined">
              keyboard_arrow_down
            </span>

          </div>

        </div>
      </header>


      {/* =========================================
          DASHBOARD CONTENT
      ========================================= */}
      <section className="dashboard-content">

        {/* =========================================
            WELCOME
        ========================================= */}
        <div className="dashboard-welcome">

          <div>
            <h1>
              {getGreeting()}, {userName} 👋
            </h1>

            <p>
              Here's your academic performance overview.
            </p>
          </div>

          <div className="dashboard-date">

            <span className="material-symbols-outlined">
              calendar_today
            </span>

            <span>
              AI Performance Dashboard
            </span>

          </div>

        </div>


        {/* =========================================
            ERROR
        ========================================= */}
        {error && (
          <div className="history-error">
            {error}
          </div>
        )}


        {/* =========================================
            KPI GRID
        ========================================= */}
        <div className="kpi-grid">

          {/* Total Predictions */}
          <div className="kpi-card">

            <div className="kpi-card-top">

              <div className="kpi-icon blue">
                <span className="material-symbols-outlined">
                  psychology
                </span>
              </div>

              <span className="kpi-trend ai">
                AI
              </span>

            </div>

            <p className="kpi-label">
              Total Predictions
            </p>

            <h2>
              {loading ? "..." : totalPredictions}
            </h2>

            <p className="kpi-description">
              AI predictions generated
            </p>

          </div>


          {/* Average Score */}
          <div className="kpi-card">

            <div className="kpi-card-top">

              <div className="kpi-icon green">
                <span className="material-symbols-outlined">
                  analytics
                </span>
              </div>

              <span className="kpi-trend positive">
                Average
              </span>

            </div>

            <p className="kpi-label">
              Average Predicted Score
            </p>

            <h2>
              {loading ? "..." : averagePredictedScore}%
            </h2>

            <p className="kpi-description">
              Across all predictions
            </p>

          </div>


          {/* Best Score */}
          <div className="kpi-card">

            <div className="kpi-card-top">

              <div className="kpi-icon orange">
                <span className="material-symbols-outlined">
                  emoji_events
                </span>
              </div>

              <span className="kpi-trend positive">
                Best
              </span>

            </div>

            <p className="kpi-label">
              Best Predicted Score
            </p>

            <h2>
              {loading ? "..." : bestPrediction}%
            </h2>

            <p className="kpi-description">
              Highest prediction
            </p>

          </div>


          {/* Latest Prediction */}
          <div className="kpi-card">

            <div className="kpi-card-top">

              <div className="kpi-icon purple">
                <span className="material-symbols-outlined">
                  auto_awesome
                </span>
              </div>

              <span className="kpi-trend ai">
                Latest
              </span>

            </div>

            <p className="kpi-label">
              Latest Prediction
            </p>

            <h2>
              {loading
                ? "..."
                : latestPrediction
                ? `${latestPrediction.predicted_final_marks}%`
                : "0%"}
            </h2>

            <p className="kpi-description">
              {latestPrediction
                ? latestPrediction.subject
                : "No prediction yet"}
            </p>

          </div>

        </div>


        {/* =========================================
            MAIN DASHBOARD GRID
        ========================================= */}
        <div className="dashboard-grid">


          {/* =========================================
              PERFORMANCE OVERVIEW
          ========================================= */}
          <div className="dashboard-card performance-card">

            <div className="card-header">

              <div>
                <h3>
                  Prediction Overview
                </h3>

                <p>
                  Your latest subject predictions
                </p>
              </div>

              <button
                className="card-action"
                onClick={() =>
                  navigate("/student/prediction-history")
                }
              >
                View Details
              </button>

            </div>


            <div className="performance-chart">

              {loading ? (
                <p>Loading predictions...</p>
              ) : performanceData.length === 0 ? (

                <p>
                  No predictions available yet.
                </p>

              ) : (

                performanceData.map((item, index) => (

                  <div
                    className="performance-column"
                    key={`${item.subject}-${index}`}
                  >

                    <div className="performance-value">
                      {item.score}%
                    </div>

                    <div className="bar-wrapper">

                      <div
                        className="performance-bar"
                        style={{
                          height: `${item.score}%`,
                        }}
                      ></div>

                    </div>

                    <span className="subject-name">
                      {item.subject}
                    </span>

                  </div>

                ))

              )}

            </div>

          </div>


          {/* =========================================
              AI PREDICTION
          ========================================= */}
          <div className="dashboard-card prediction-card">

            <div className="card-header">

              <div>
                <h3>
                  AI Performance Prediction
                </h3>

                <p>
                  Based on your latest prediction
                </p>
              </div>

              <span className="ai-label">
                AI
              </span>

            </div>


            <div className="prediction-body">

              <div className="prediction-score">

                <span>
                  Predicted Score
                </span>

                <strong>
                  {loading
                    ? "..."
                    : latestPrediction
                    ? `${latestPrediction.predicted_final_marks}%`
                    : "0%"}
                </strong>

                {latestPrediction && (
                  <div className="prediction-status">

                    <span className="status-dot"></span>

                    {getPerformanceMessage(
                      Number(
                        latestPrediction.predicted_final_marks
                      )
                    )}

                  </div>
                )}

              </div>


              <div className="prediction-message">

                <span className="material-symbols-outlined">
                  trending_up
                </span>

                <p>
                  {latestPrediction
                    ? `Your latest prediction for ${latestPrediction.subject} is ${latestPrediction.predicted_final_marks}%.`
                    : "Generate your first AI prediction to see your predicted performance here."}
                </p>

              </div>


              <button
                className="prediction-button"
                onClick={() =>
                  navigate("/student/prediction")
                }
              >
                {latestPrediction
                  ? "View Full Prediction"
                  : "Generate Prediction"}

                <span className="material-symbols-outlined">
                  arrow_forward
                </span>
              </button>

            </div>

          </div>


          {/* =========================================
              ATTENDANCE SUMMARY
          ========================================= */}
          <div className="dashboard-card attendance-card">

              <div className="card-header">
                  <div>
                    <h3>Attendance Summary</h3>
                    <p>Overall attendance</p>
                  </div>

                  <button
                    className="card-action"
                    onClick={() => navigate("/student/attendance")}
                  >
                    View Details
                  </button>

                <span className="material-symbols-outlined card-icon">
                  event_available
                </span>
              </div>

              <div className="attendance-body">

                <div className="attendance-circle">
                  <div>
                    <strong>{overallAttendance}%</strong>
                    <span>Attendance</span>
                  </div>
                </div>

                <div className="attendance-stats">

                  <div>
                    <span className="attendance-dot present"></span>
                    <span>Present</span>
                    <strong>{attendedClasses}</strong>
                  </div>

                  <div>
                    <span className="attendance-dot absent"></span>
                    <span>Absent</span>
                    <strong>{absentClasses}</strong>
                  </div>

                  <div>
                    <span className="attendance-dot late"></span>
                    <span>Total</span>
                    <strong>{totalClasses}</strong>
                  </div>

                </div>

              </div>

            </div>


          {/* =========================================
              RECENT ACTIVITY
          ========================================= */}
          <div className="dashboard-card activity-card">

            <div className="card-header">

              <div>
                <h3>
                  Recent Predictions
                </h3>

                <p>
                  Your latest AI prediction activity
                </p>
              </div>

              <button
                className="card-action"
                onClick={() =>
                  navigate("/student/prediction-history")
                }
              >
                View All
              </button>

            </div>


            <div className="activity-list">

              {loading ? (

                <div className="activity-item">
                  <div className="activity-content">
                    <strong>
                      Loading...
                    </strong>
                  </div>
                </div>

              ) : recentPredictions.length === 0 ? (

                <div className="activity-item">
                  <div className="activity-content">
                    <strong>
                      No predictions yet
                    </strong>

                    <span>
                      Generate an AI prediction to get started.
                    </span>
                  </div>
                </div>

              ) : (

                recentPredictions.map((prediction) => (

                  <div
                    className="activity-item"
                    key={prediction.id}
                  >

                    <div className="activity-icon purple">

                      <span className="material-symbols-outlined">
                        auto_awesome
                      </span>

                    </div>

                    <div className="activity-content">

                      <strong>
                        {prediction.subject}
                      </strong>

                      <span>
                        Predicted score:{" "}
                        {prediction.predicted_final_marks}%
                        {" • "}
                        {new Date(
                          prediction.created_at
                        ).toLocaleDateString()}
                      </span>

                    </div>

                  </div>

                ))

              )}

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default StudentDashboard;