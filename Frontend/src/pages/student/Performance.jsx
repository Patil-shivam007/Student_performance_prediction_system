import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Performance.css";

const API_URL =
  "http://127.0.0.1:8000/api/student/academic-performance/";

function Performance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchPerformance = useCallback(async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("Your login session is missing. Please login again.");
        return;
      }

      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setData(response.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Academic performance error:", err);

      if (err.response?.status === 401) {
        setError("Your login session has expired. Please login again.");
      } else {
        setError(
          err.response?.data?.detail ||
            err.response?.data?.error ||
            "Unable to load academic performance."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPerformance();

    // Refresh the academic data every 30 seconds
    const interval = setInterval(() => {
      fetchPerformance(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchPerformance]);

  const subjects = useMemo(() => {
    const records = data?.records || [];
    const latestBySubject = {};

    records.forEach((record) => {
      const current = latestBySubject[record.subject];

      if (
        !current ||
        new Date(record.created_at) >
          new Date(current.created_at)
      ) {
        latestBySubject[record.subject] = record;
      }
    });

    return Object.values(latestBySubject);
  }, [data]);

  const summary = useMemo(() => {
    if (!subjects.length) {
      return {
        performanceIndex: 0,
        attendance: 0,
        assignment: 0,
        predictedMarks: 0,
        previousSgpa: 0,
      };
    }

    const performanceIndex =
      subjects.reduce(
        (sum, item) =>
          sum + Number(item.average_marks || 0),
        0
      ) / subjects.length;

    const attendance =
      subjects.reduce(
        (sum, item) =>
          sum + Number(item.attendance_percentage || 0),
        0
      ) / subjects.length;

    const assignment =
      subjects.reduce(
        (sum, item) =>
          sum +
          Number(
            item.assignment_completion_percentage || 0
          ),
        0
      ) / subjects.length;

    const predictedMarks =
      subjects.reduce(
        (sum, item) =>
          sum + Number(item.predicted_final_marks || 0),
        0
      ) / subjects.length;

    return {
      performanceIndex: performanceIndex.toFixed(2),
      attendance: attendance.toFixed(1),
      assignment: assignment.toFixed(1),
      predictedMarks: predictedMarks.toFixed(2),
      previousSgpa: subjects[0]?.previous_semester_sgpa || 0,
    };
  }, [subjects]);

  const strongSubjects = useMemo(() => {
    return [...subjects]
      .sort(
        (a, b) =>
          Number(b.predicted_final_marks || 0) -
          Number(a.predicted_final_marks || 0)
      )
      .slice(0, 3);
  }, [subjects]);

  const weakSubjects = useMemo(() => {
    return [...subjects]
      .sort(
        (a, b) =>
          Number(a.predicted_final_marks || 0) -
          Number(b.predicted_final_marks || 0)
      )
      .slice(0, 3);
  }, [subjects]);

  if (loading) {
    return (
      <div className="performance-page">
        <div className="performance-loading">
          <div className="performance-spinner"></div>

          <h4>Loading Academic Performance</h4>

          <p>
            Collecting your latest academic data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="performance-page">
        <div className="performance-error">
          <div className="error-icon">!</div>

          <h4>Unable to load performance</h4>

          <p>{error}</p>

          <button
            className="performance-refresh-btn"
            onClick={() => fetchPerformance()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!subjects.length) {
    return (
      <div className="performance-page">
        <div className="performance-empty">
          <div className="empty-icon">📚</div>

          <h3>No Academic Data Yet</h3>

          <p>
            Your academic performance data will appear here
            after prediction records are available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="performance-page">

      {/* =========================================
          HEADER
      ========================================== */}
      <div className="performance-header">

        <div>
          <div className="performance-title-row">

            <h1>Academic Performance</h1>

            <span className="live-status">
              <span className="live-dot"></span>
              Live
            </span>

          </div>

          <p>
            Monitor your academic progress, attendance,
            assignments and predicted performance.
          </p>
        </div>

        <div className="header-actions">

          {lastUpdated && (
            <span className="last-updated">
              Updated{" "}
              {lastUpdated.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}

          <button
            className="performance-refresh-btn"
            onClick={() => fetchPerformance(true)}
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <span className="small-spinner"></span>
                Updating...
              </>
            ) : (
              <>
                ↻ Refresh
              </>
            )}
          </button>

        </div>

      </div>

      {/* =========================================
          SUMMARY CARDS
      ========================================== */}
      <div className="performance-summary-grid">

        <div className="performance-card summary-card">
          <div className="summary-icon purple">
            📊
          </div>

          <div>
            <span className="summary-label">
              Performance Index
            </span>

            <strong>
              {summary.performanceIndex}
            </strong>

            <small>
              Across all subjects
            </small>
          </div>
        </div>

        <div className="performance-card summary-card">
          <div className="summary-icon blue">
            🎯
          </div>

          <div>
            <span className="summary-label">
              Predicted Marks
            </span>

            <strong>
              {summary.predictedMarks}
            </strong>

            <small>
              Average predicted score
            </small>
          </div>
        </div>

        <div className="performance-card summary-card">
          <div className="summary-icon green">
            ✅
          </div>

          <div>
            <span className="summary-label">
              Attendance
            </span>

            <strong>
              {summary.attendance}%
            </strong>

            <small>
              Average attendance
            </small>
          </div>
        </div>

        <div className="performance-card summary-card">
          <div className="summary-icon orange">
            📝
          </div>

          <div>
            <span className="summary-label">
              Assignments
            </span>

            <strong>
              {summary.assignment}%
            </strong>

            <small>
              Completion rate
            </small>
          </div>
        </div>

      </div>

      {/* =========================================
          MAIN GRAPH
      ========================================== */}
      <div className="performance-main-grid">

        <div className="performance-card chart-card">

          <div className="card-heading">

            <div>
              <h3>Performance Overview</h3>
              <p>
                Predicted marks and attendance by subject
              </p>
            </div>

            <div className="chart-legend">
              <span>
                <i className="legend-dot marks"></i>
                Predicted Marks
              </span>

              <span>
                <i className="legend-dot attendance"></i>
                Attendance
              </span>
            </div>

          </div>

          <PerformanceChart subjects={subjects} />

        </div>

        {/* =====================================
            ACADEMIC SCORE
        ====================================== */}
        <div className="performance-card score-card">

          <div className="card-heading">
            <div>
              <h3>Academic Health</h3>
              <p>Overall academic indicators</p>
            </div>
          </div>

          <ScoreProgress
            label="Performance"
            value={Number(summary.performanceIndex)}
            icon="📈"
          />

          <ScoreProgress
            label="Attendance"
            value={Number(summary.attendance)}
            icon="🕐"
          />

          <ScoreProgress
            label="Assignments"
            value={Number(summary.assignment)}
            icon="📝"
          />

          <div className="sgpa-box">
            <div>
              <span>Previous Semester SGPA</span>
              <strong>{summary.previousSgpa}</strong>
            </div>

            <span className="sgpa-icon">🎓</span>
          </div>

        </div>

      </div>

      {/* =========================================
          SUBJECT TABLE
      ========================================== */}
      <div className="performance-card subject-card">

        <div className="card-heading">
          <div>
            <h3>Subject-wise Performance</h3>
            <p>
              Latest available academic information
            </p>
          </div>

          <span className="subject-count">
            {subjects.length} Subjects
          </span>
        </div>

        <div className="table-wrapper">

          <table className="performance-table">

            <thead>
              <tr>
                <th>Subject</th>
                <th>Internal</th>
                <th>Midterm</th>
                <th>Predicted</th>
                <th>Attendance</th>
                <th>Assignment</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {subjects.map((item) => {

                const marks = Number(
                  item.predicted_final_marks || 0
                );

                const statusClass =
                  marks >= 75
                    ? "excellent"
                    : marks >= 60
                    ? "good"
                    : marks >= 40
                    ? "average"
                    : "poor";

                return (
                  <tr key={item.id}>

                    <td>
                      <div className="subject-name">
                        <div className="subject-avatar">
                          {item.subject
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {item.subject}
                          </strong>

                          <span>
                            Updated recently
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <strong>
                        {item.internal_marks}
                      </strong>
                    </td>

                    <td>
                      <strong>
                        {item.midterm_marks}
                      </strong>
                    </td>

                    <td>
                      <strong className="predicted-mark">
                        {item.predicted_final_marks}
                      </strong>
                    </td>

                    <td>
                      <div className="mini-progress">
                        <div>
                          <span>
                            {item.attendance_percentage}%
                          </span>
                        </div>

                        <div className="mini-progress-track">
                          <div
                            className="mini-progress-fill attendance-fill"
                            style={{
                              width: `${Math.min(
                                Number(
                                  item.attendance_percentage || 0
                                ),
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="mini-progress">
                        <div>
                          <span>
                            {
                              item.assignment_completion_percentage
                            }%
                          </span>
                        </div>

                        <div className="mini-progress-track">
                          <div
                            className="mini-progress-fill assignment-fill"
                            style={{
                              width: `${Math.min(
                                Number(
                                  item.assignment_completion_percentage ||
                                    0
                                ),
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${statusClass}`}
                      >
                        {item.performance_category}
                      </span>
                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

      </div>

      {/* =========================================
          STRONG + WEAK SUBJECTS
      ========================================== */}
      <div className="strength-grid">

        <div className="performance-card strength-card">

          <div className="card-heading">
            <div>
              <h3>🌟 Strong Subjects</h3>
              <p>
                Subjects with higher predicted performance
              </p>
            </div>
          </div>

          {strongSubjects.map((item, index) => (
            <SubjectPerformanceItem
              key={item.id}
              item={item}
              index={index}
              type="strong"
            />
          ))}

        </div>

        <div className="performance-card strength-card">

          <div className="card-heading">
            <div>
              <h3>⚠️ Needs Improvement</h3>
              <p>
                Subjects that may need more attention
              </p>
            </div>
          </div>

          {weakSubjects.map((item, index) => (
            <SubjectPerformanceItem
              key={item.id}
              item={item}
              index={index}
              type="weak"
            />
          ))}

        </div>

      </div>

    </div>
  );
}

/* =====================================================
   PERFORMANCE GRAPH
===================================================== */

function PerformanceChart({ subjects }) {
  const width = 900;
  const height = 350;

  const paddingLeft = 55;
  const paddingRight = 25;
  const paddingTop = 30;
  const paddingBottom = 75;

  const chartWidth =
    width - paddingLeft - paddingRight;

  const chartHeight =
    height - paddingTop - paddingBottom;

  const points = subjects.map((item, index) => {

    const x =
      paddingLeft +
      (index / Math.max(subjects.length - 1, 1)) *
        chartWidth;

    const marks = Math.max(
      0,
      Math.min(
        100,
        Number(item.predicted_final_marks || 0)
      )
    );

    const attendance = Math.max(
      0,
      Math.min(
        100,
        Number(item.attendance_percentage || 0)
      )
    );

    const yMarks =
      paddingTop +
      chartHeight -
      (marks / 100) * chartHeight;

    const yAttendance =
      paddingTop +
      chartHeight -
      (attendance / 100) * chartHeight;

    return {
      x,
      yMarks,
      yAttendance,
      marks,
      attendance,
      subject: item.subject,
    };
  });

  const marksPath = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x} ${point.yMarks}`
    )
    .join(" ");

  const attendancePath = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x} ${point.yAttendance}`
    )
    .join(" ");

  const gridLines = [0, 20, 40, 60, 80, 100];

  return (
    <div className="chart-container">

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="performance-chart"
        role="img"
        aria-label="Academic performance chart"
      >

        {/* Grid */}
        {gridLines.map((value) => {

          const y =
            paddingTop +
            chartHeight -
            (value / 100) * chartHeight;

          return (
            <g key={value}>

              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                className="chart-grid-line"
              />

              <text
                x={paddingLeft - 12}
                y={y + 4}
                textAnchor="end"
                className="chart-label"
              >
                {value}
              </text>

            </g>
          );
        })}

        {/* Marks Area */}
        {points.length > 1 && (
          <path
            d={`${marksPath} L ${points.at(-1).x} ${
              paddingTop + chartHeight
            } L ${points[0].x} ${
              paddingTop + chartHeight
            } Z`}
            className="marks-area"
          />
        )}

        {/* Marks line */}
        <path
          d={marksPath}
          className="marks-line"
          fill="none"
        />

        {/* Attendance line */}
        <path
          d={attendancePath}
          className="attendance-line"
          fill="none"
        />

        {/* Points */}
        {points.map((point, index) => (
          <g key={index}>

            <circle
              cx={point.x}
              cy={point.yMarks}
              r="6"
              className="marks-point"
            />

            <circle
              cx={point.x}
              cy={point.yAttendance}
              r="5"
              className="attendance-point"
            />

            <text
              x={point.x}
              y={height - 28}
              textAnchor="middle"
              className="chart-subject-label"
            >
              {point.subject.length > 12
                ? `${point.subject.substring(0, 12)}...`
                : point.subject}
            </text>

          </g>
        ))}

      </svg>

    </div>
  );
}

/* =====================================================
   SCORE PROGRESS
===================================================== */

function ScoreProgress({ label, value, icon }) {
  const safeValue = Math.max(
    0,
    Math.min(100, Number(value || 0))
  );

  return (
    <div className="score-progress">

      <div className="score-progress-top">
        <span>
          {icon} {label}
        </span>

        <strong>
          {safeValue.toFixed(1)}%
        </strong>
      </div>

      <div className="score-track">

        <div
          className="score-fill"
          style={{
            width: `${safeValue}%`,
          }}
        ></div>

      </div>

    </div>
  );
}

/* =====================================================
   SUBJECT PERFORMANCE ITEM
===================================================== */

function SubjectPerformanceItem({
  item,
  index,
  type,
}) {
  const marks = Number(
    item.predicted_final_marks || 0
  );

  return (
    <div className="subject-performance-item">

      <div className="rank-badge">
        #{index + 1}
      </div>

      <div className="subject-item-main">

        <strong>
          {item.subject}
        </strong>

        <div className="subject-item-bar">

          <div
            className={`subject-item-fill ${
              type === "strong"
                ? "strong-fill"
                : "weak-fill"
            }`}
            style={{
              width: `${Math.min(
                Math.max(marks, 0),
                100
              )}%`,
            }}
          ></div>

        </div>

      </div>

      <strong className="subject-item-score">
        {marks}
      </strong>

    </div>
  );
}

export default Performance;