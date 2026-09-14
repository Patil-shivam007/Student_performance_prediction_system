import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../../services/api";
import "./Attendance.css";

function Attendance() {
  const today = new Date();

  const [attendance, setAttendance] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [summary, setSummary] = useState({
    overall_attendance: 0,
    total_classes: 0,
    classes_attended: 0,
    classes_absent: 0,
  });

  const [selectedMonth, setSelectedMonth] = useState(
    String(today.getMonth() + 1)
  );

  const [selectedYear, setSelectedYear] = useState(
    String(today.getFullYear())
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // =====================================================
  // FETCH ATTENDANCE
  // =====================================================

  const fetchAttendance = useCallback(
    async (silent = false) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await api.get(
          `student/attendance/?month=${selectedMonth}&year=${selectedYear}`
        );

        console.log("Attendance:", response.data);

        setSummary(
          response.data.summary || {
            overall_attendance: 0,
            total_classes: 0,
            classes_attended: 0,
            classes_absent: 0,
          }
        );

        setSubjects(response.data.subjects || []);
        setAttendance(response.data.attendance || []);

        setLastUpdated(new Date());
      } catch (err) {
        console.error(
          "Attendance Error:",
          err.response?.data
        );

        if (err.response?.status === 401) {
          setError(
            "Your login session has expired. Please login again."
          );
        } else {
          setError(
            err.response?.data?.error ||
              "Unable to load attendance."
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedMonth, selectedYear]
  );

  // =====================================================
  // FETCH WHEN MONTH/YEAR CHANGES
  // =====================================================

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // =====================================================
  // AUTO REFRESH EVERY 30 SECONDS
  // =====================================================

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAttendance(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchAttendance]);

  // =====================================================
  // MONTHS
  // =====================================================

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // =====================================================
  // YEARS
  // =====================================================

  const years = useMemo(() => {
    const currentYear = today.getFullYear();

    return Array.from(
      { length: 5 },
      (_, index) => currentYear - index
    );
  }, [today]);

  // =====================================================
  // ATTENDANCE HEALTH
  // =====================================================

  const attendanceValue = Number(
    summary.overall_attendance || 0
  );

  const attendanceStatus =
    attendanceValue >= 85
      ? "Excellent"
      : attendanceValue >= 75
      ? "Good"
      : attendanceValue >= 65
      ? "Warning"
      : "Critical";

  const attendanceStatusClass =
    attendanceValue >= 85
      ? "excellent"
      : attendanceValue >= 75
      ? "good"
      : attendanceValue >= 65
      ? "warning"
      : "critical";

  const selectedMonthName =
    months.find(
      (month) => month.value === selectedMonth
    )?.label || "Month";

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="attendance-page">
        <div className="attendance-loading">

          <div className="attendance-spinner"></div>

          <h3>
            Loading Attendance
          </h3>

          <p>
            Fetching your latest attendance records...
          </p>

        </div>
      </div>
    );
  }

  return (
    <div className="attendance-page">

      {/* =================================================
          HEADER
      ================================================== */}

      <div className="attendance-header">

        <div>

          <div className="attendance-title-row">

            <h1>
              Attendance
            </h1>

            <span className="attendance-live">
              <span className="attendance-live-dot"></span>
              Live
            </span>

          </div>

          <p>
            Monitor your subject-wise attendance and
            class participation.
          </p>

        </div>

        <div className="attendance-header-actions">

          {lastUpdated && (
            <span className="attendance-last-updated">
              Updated{" "}
              {lastUpdated.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}

          <button
            type="button"
            className="attendance-refresh-btn"
            onClick={() => fetchAttendance(true)}
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <span className="small-spinner"></span>
                Updating...
              </>
            ) : (
              <>↻ Refresh</>
            )}
          </button>

        </div>

      </div>

      {/* =================================================
          FILTERS
      ================================================== */}

      <div className="attendance-filter-card">

        <div className="attendance-filter-title">

          <span className="material-symbols-outlined">
            calendar_month
          </span>

          <div>
            <strong>
              Attendance Period
            </strong>

            <span>
              Select the month and year
            </span>
          </div>

        </div>

        <div className="attendance-filters">

          <div className="attendance-filter-group">

            <label>
              Month
            </label>

            <select
              value={selectedMonth}
              onChange={(e) =>
                setSelectedMonth(e.target.value)
              }
            >
              {months.map((month) => (
                <option
                  key={month.value}
                  value={month.value}
                >
                  {month.label}
                </option>
              ))}
            </select>

          </div>

          <div className="attendance-filter-group">

            <label>
              Year
            </label>

            <select
              value={selectedYear}
              onChange={(e) =>
                setSelectedYear(e.target.value)
              }
            >
              {years.map((year) => (
                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>
              ))}
            </select>

          </div>

        </div>

      </div>

      {/* =================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="attendance-error">

          <div className="attendance-error-icon">
            !
          </div>

          <div>
            <strong>
              Unable to load attendance
            </strong>

            <p>
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchAttendance()}
          >
            Try Again
          </button>

        </div>
      )}

      {/* =================================================
          SUMMARY
      ================================================== */}

      <div className="attendance-summary">

        {/* Overall */}
        <div className="attendance-summary-card overall-card">

          <div className="attendance-card-icon purple">
            📊
          </div>

          <div className="attendance-summary-content">

            <span>
              Overall Attendance
            </span>

            <strong>
              {summary.overall_attendance}%
            </strong>

            <small
              className={`attendance-status-text ${attendanceStatusClass}`}
            >
              {attendanceStatus}
            </small>

          </div>

        </div>

        {/* Total */}
        <div className="attendance-summary-card">

          <div className="attendance-card-icon blue">
            📚
          </div>

          <div className="attendance-summary-content">

            <span>
              Total Classes
            </span>

            <strong>
              {summary.total_classes}
            </strong>

            <small>
              {selectedMonthName} {selectedYear}
            </small>

          </div>

        </div>

        {/* Attended */}
        <div className="attendance-summary-card">

          <div className="attendance-card-icon green">
            ✓
          </div>

          <div className="attendance-summary-content">

            <span>
              Classes Attended
            </span>

            <strong>
              {summary.classes_attended}
            </strong>

            <small>
              Successfully attended
            </small>

          </div>

        </div>

        {/* Absent */}
        <div className="attendance-summary-card">

          <div className="attendance-card-icon red">
            !
          </div>

          <div className="attendance-summary-content">

            <span>
              Classes Absent
            </span>

            <strong>
              {summary.classes_absent}
            </strong>

            <small>
              Missed classes
            </small>

          </div>

        </div>

      </div>

      {/* =================================================
          ATTENDANCE OVERVIEW
      ================================================== */}

      <div className="attendance-dashboard-grid">

        {/* Overall Progress */}
        <div className="attendance-panel attendance-overview-panel">

          <div className="attendance-panel-header">

            <div>
              <h2>
                Attendance Overview
              </h2>

              <p>
                Your attendance health for{" "}
                {selectedMonthName} {selectedYear}
              </p>
            </div>

            <span
              className={`attendance-health-badge ${attendanceStatusClass}`}
            >
              {attendanceStatus}
            </span>

          </div>

          <div className="attendance-overview-body">

            {/* Circular indicator */}
            <div
              className="attendance-circle"
              style={{
                "--attendance":
                  `${Math.min(attendanceValue, 100)}%`,
              }}
            >
              <div className="attendance-circle-inner">

                <strong>
                  {summary.overall_attendance}%
                </strong>

                <span>
                  Attendance
                </span>

              </div>
            </div>

            <div className="attendance-overview-info">

              <div className="attendance-info-row">
                <span>
                  Required Attendance
                </span>

                <strong>
                  75%
                </strong>
              </div>

              <div className="attendance-info-row">
                <span>
                  Current Attendance
                </span>

                <strong>
                  {summary.overall_attendance}%
                </strong>
              </div>

              <div className="attendance-info-row">
                <span>
                  Classes Attended
                </span>

                <strong>
                  {summary.classes_attended}
                </strong>
              </div>

              <div className="attendance-info-row">
                <span>
                  Classes Absent
                </span>

                <strong>
                  {summary.classes_absent}
                </strong>
              </div>

            </div>

          </div>

        </div>

        {/* Attendance Status */}
        <div className="attendance-panel attendance-tips-panel">

          <div className="attendance-panel-header">

            <div>
              <h2>
                Attendance Status
              </h2>

              <p>
                Quick assessment
              </p>
            </div>

            <span className="attendance-status-icon">
              🎯
            </span>

          </div>

          {attendanceValue >= 75 ? (
            <div className="attendance-message success-message">

              <div className="message-icon">
                ✓
              </div>

              <div>
                <strong>
                  You're on track!
                </strong>

                <p>
                  Your attendance is above the
                  minimum required level.
                </p>
              </div>

            </div>
          ) : (
            <div className="attendance-message warning-message">

              <div className="message-icon">
                !
              </div>

              <div>
                <strong>
                  Attendance needs attention
                </strong>

                <p>
                  Your attendance is below 75%.
                  Try to attend upcoming classes
                  regularly.
                </p>
              </div>

            </div>
          )}

          <div className="attendance-target">

            <div className="attendance-target-top">

              <span>
                Target
              </span>

              <strong>
                75%
              </strong>

            </div>

            <div className="attendance-target-track">

              <div
                className="attendance-target-fill"
                style={{
                  width: `${Math.min(
                    attendanceValue,
                    100
                  )}%`,
                }}
              ></div>

              <div className="attendance-target-marker">
                <span></span>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          SUBJECT ATTENDANCE
      ================================================== */}

      <div className="attendance-content">

        <div className="attendance-section-header">

          <div>
            <h2>
              Subject Attendance
            </h2>

            <p>
              Attendance performance for each subject
            </p>
          </div>

          <span className="attendance-subject-count">
            {subjects.length} Subjects
          </span>

        </div>

        {subjects.length === 0 ? (
          <div className="attendance-empty">
            <div className="empty-icon">
              📚
            </div>

            <h3>
              No Attendance Records
            </h3>

            <p>
              No attendance records are available
              for {selectedMonthName} {selectedYear}.
            </p>
          </div>
        ) : (
          <div className="subject-attendance-grid">

            {subjects.map((subject) => {

              const percentage = Number(
                subject.attendance_percentage || 0
              );

              const status =
                percentage >= 85
                  ? "excellent"
                  : percentage >= 75
                  ? "good"
                  : percentage >= 65
                  ? "warning"
                  : "critical";

              return (
                <div
                  className="subject-attendance-card"
                  key={subject.subject_id}
                >

                  <div className="subject-attendance-top">

                    <div className="subject-avatar">
                      {subject.subject
                        ?.charAt(0)
                        ?.toUpperCase()}
                    </div>

                    <div className="subject-attendance-title">

                      <strong>
                        {subject.subject}
                      </strong>

                      <span>
                        {subject.classes_attended} of{" "}
                        {subject.total_classes} classes
                      </span>

                    </div>

                    <strong
                      className={`subject-percentage ${status}`}
                    >
                      {percentage}%
                    </strong>

                  </div>

                  <div className="subject-progress">

                    <div
                      className={`subject-progress-bar ${status}`}
                      style={{
                        width: `${Math.min(
                          percentage,
                          100
                        )}%`,
                      }}
                    ></div>

                  </div>

                  <div className="subject-attendance-bottom">

                    <span>
                      Attended{" "}
                      <strong>
                        {subject.classes_attended}
                      </strong>
                    </span>

                    <span>
                      Total{" "}
                      <strong>
                        {subject.total_classes}
                      </strong>
                    </span>

                  </div>

                  {percentage < 75 && (
                    <div className="subject-warning">
                      ⚠️ Attendance is below 75%
                    </div>
                  )}

                </div>
              );
            })}

          </div>
        )}

      </div>

      {/* =================================================
          ATTENDANCE HISTORY
      ================================================== */}

      <div className="attendance-content">

        <div className="attendance-section-header">

          <div>
            <h2>
              Attendance History
            </h2>

            <p>
              Recent attendance records
            </p>
          </div>

          <span className="attendance-subject-count">
            {attendance.length} Records
          </span>

        </div>

        {attendance.length === 0 ? (
          <div className="attendance-empty">
            <div className="empty-icon">
              🗓️
            </div>

            <h3>
              No History Available
            </h3>

            <p>
              No attendance history is available
              for the selected month.
            </p>
          </div>
        ) : (
          <div className="attendance-history">

            {attendance.map((record) => {

              const statusClass =
                record.status === "Present"
                  ? "present"
                  : record.status === "Absent"
                  ? "absent"
                  : "late";

              return (
                <div
                  className="attendance-history-row"
                  key={record.id}
                >

                  <div className="history-date">

                    <div className="history-date-icon">
                      📅
                    </div>

                    <div>
                      <strong>
                        {record.date}
                      </strong>

                      <span>
                        {record.classroom ||
                          "Classroom"}
                      </span>
                    </div>

                  </div>

                  <div className="history-subject">
                    <strong>
                      {record.subject}
                    </strong>

                    <span>
                      Attendance record
                    </span>
                  </div>

                  <span
                    className={`history-status ${statusClass}`}
                  >
                    {record.status === "Present" && "✓ "}
                    {record.status === "Absent" && "✕ "}
                    {record.status === "Late" && "◷ "}
                    {record.status}
                  </span>

                </div>
              );
            })}

          </div>
        )}

      </div>

    </div>
  );
}

export default Attendance;