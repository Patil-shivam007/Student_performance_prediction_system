import { useEffect, useState } from "react";
import axios from "axios";

const StudyHabits = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // GET SAVED AI SUGGESTIONS
  // Does NOT call Ollama
  // =====================================================
  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("You are not logged in. Please login again.");
        return;
      }

      const response = await axios.get(
        "http://127.0.0.1:8000/api/student/study-habits/suggestions/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setData(response.data);
    } catch (err) {
      console.error("Study habits AI error:", err);

      if (err.response?.status === 401) {
        setError("Your login session has expired. Please login again.");
      } else {
        setError(
          err.response?.data?.detail ||
            err.response?.data?.error ||
            "Unable to load your study habit recommendations."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // GENERATE FRESH AI SUGGESTIONS
  // This calls Django -> Ollama
  // =====================================================
  const refreshAISuggestions = async () => {
    try {
      setRefreshing(true);
      setError("");

      const token = localStorage.getItem("access_token");

      if (!token) {
        setError("You are not logged in. Please login again.");
        return;
      }

      await axios.post(
        "http://127.0.0.1:8000/api/student/study-habits/suggestions/refresh/",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Get the newly saved result from database
      await fetchSuggestions();
    } catch (err) {
      console.error("AI refresh error:", err);

      if (err.response?.status === 401) {
        setError("Your login session has expired. Please login again.");
      } else {
        setError(
          err.response?.data?.detail ||
            err.response?.data?.error ||
            "Unable to refresh AI study recommendations."
        );
      }
    } finally {
      setRefreshing(false);
    }
  };

  // =====================================================
  // PAGE LOAD
  // Only loads saved data
  // =====================================================
  useEffect(() => {
    fetchSuggestions();
  }, []);

  // =====================================================
  // LOADING
  // =====================================================
  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="text-center">

          <div
            className="spinner-border"
            role="status"
            aria-hidden="true"
          ></div>

          <h5 className="mt-3 fw-bold">
            Loading your study habits...
          </h5>

          <p className="text-muted mb-0">
            Loading saved AI recommendations.
          </p>

        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================
  if (error) {
    return (
      <div className="container-fluid py-4">

        <div className="alert alert-danger">

          <h5 className="fw-bold">
            Unable to load Study Habits
          </h5>

          <p className="mb-3">
            {error}
          </p>

          <button
            type="button"
            className="btn btn-dark"
            onClick={fetchSuggestions}
            disabled={loading}
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  // =====================================================
  // NO DATA
  // =====================================================
  if (!data || !data.suggestions?.length) {
    return (
      <div className="container-fluid py-4">

        <div className="card border-0 shadow-sm">

          <div className="card-body text-center py-5">

            <div className="fs-1 mb-3">
              📚
            </div>

            <h4 className="fw-bold">
              Study Habits
            </h4>

            <p className="text-muted mb-0">
              Add your study habits first to receive
              personalized AI recommendations.
            </p>

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================
  return (
    <div className="container-fluid py-4">

      {/* PAGE HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold mb-1">
            📚 Study Habits
          </h2>

          <p className="text-muted mb-0">
            Track your study routine and get personalized AI recommendations.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-dark"
          onClick={refreshAISuggestions}
          disabled={refreshing}
        >
          {refreshing ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>

              Analyzing...
            </>
          ) : (
            <>
              🔄 Refresh AI Analysis
            </>
          )}
        </button>

      </div>

      {/* AI INFO */}
      <div className="alert alert-light border shadow-sm mb-4">

        <div className="d-flex align-items-start">

          <div className="fs-3 me-3">
            🤖
          </div>

          <div>

            <h5 className="fw-bold mb-1">
              AI-Powered Study Recommendations
            </h5>

            <p className="mb-0 text-muted">
              Recommendations use your study habits,
              attendance and academic performance.
            </p>

          </div>

        </div>

      </div>

      {/* SUBJECTS */}
      {data.suggestions.map((item, index) => {

        const suggestion = item.suggestion;

        if (!suggestion || suggestion.error) {
          return (
            <div
              key={index}
              className="alert alert-danger mb-4"
            >
              <strong>{item.subject}:</strong>{" "}
              {suggestion?.error ||
                "AI recommendation unavailable."}
            </div>
          );
        }

        return (
          <div
            key={index}
            className="mb-5"
          >

            {/* SUBJECT HEADER */}
            <div className="card border-0 shadow-sm mb-4">

              <div className="card-body d-flex justify-content-between align-items-center">

                <div>
                  <p className="text-muted mb-1">
                    Subject
                  </p>

                  <h4 className="fw-bold mb-0">
                    📖 {item.subject}
                  </h4>
                </div>

                <div className="text-end">

                  <p className="text-muted mb-1">
                    AI Focus Level
                  </p>

                  <span
                    className={`badge fs-6 px-3 py-2 ${
                      suggestion.focus_level === "High"
                        ? "bg-success"
                        : suggestion.focus_level === "Medium"
                        ? "bg-warning text-dark"
                        : "bg-danger"
                    }`}
                  >
                    {suggestion.focus_level || "Unknown"}
                  </span>

                </div>

              </div>

            </div>

            {/* OVERALL ANALYSIS */}
            <div className="card border-0 shadow-sm mb-4">

              <div className="card-body">

                <h5 className="fw-bold mb-3">
                  📊 Overall Analysis
                </h5>

                <p className="text-muted mb-0">
                  {suggestion.overall_analysis}
                </p>

              </div>

            </div>

            {/* STRENGTHS + WEAKNESSES */}
            <div className="row g-4 mb-4">

              <div className="col-lg-6">

                <div className="card border-0 shadow-sm h-100">

                  <div className="card-body">

                    <h5 className="fw-bold mb-3">
                      ✅ Your Strengths
                    </h5>

                    {suggestion.strengths?.length ? (
                      <ul className="list-group list-group-flush">

                        {suggestion.strengths.map(
                          (strength, i) => (
                            <li
                              key={i}
                              className="list-group-item px-0"
                            >
                              <span className="text-success me-2">
                                ✓
                              </span>

                              {strength}
                            </li>
                          )
                        )}

                      </ul>
                    ) : (
                      <p className="text-muted mb-0">
                        No strengths identified.
                      </p>
                    )}

                  </div>

                </div>

              </div>

              <div className="col-lg-6">

                <div className="card border-0 shadow-sm h-100">

                  <div className="card-body">

                    <h5 className="fw-bold mb-3">
                      ⚠️ Areas to Improve
                    </h5>

                    {suggestion.weaknesses?.length ? (
                      <ul className="list-group list-group-flush">

                        {suggestion.weaknesses.map(
                          (weakness, i) => (
                            <li
                              key={i}
                              className="list-group-item px-0"
                            >
                              <span className="text-warning me-2">
                                ⚠
                              </span>

                              {weakness}
                            </li>
                          )
                        )}

                      </ul>
                    ) : (
                      <p className="text-muted mb-0">
                        No major weaknesses identified.
                      </p>
                    )}

                  </div>

                </div>

              </div>

            </div>

            {/* DAILY PLAN */}
            <div className="card border-0 shadow-sm mb-4">

              <div className="card-body">

                <h5 className="fw-bold mb-4">
                  📅 Recommended Daily Study Plan
                </h5>

                {suggestion.daily_plan?.length ? (
                  <div className="row g-3">

                    {suggestion.daily_plan.map(
                      (plan, i) => (
                        <div
                          className="col-lg-6"
                          key={i}
                        >

                          <div className="border rounded p-3 h-100">

                            <div className="fw-bold mb-2">
                              🕐 {plan.time}
                            </div>

                            <p className="text-muted mb-0">
                              {plan.activity}
                            </p>

                          </div>

                        </div>
                      )
                    )}

                  </div>
                ) : (
                  <p className="text-muted mb-0">
                    No daily plan generated.
                  </p>
                )}

              </div>

            </div>

            {/* SUBJECT SUGGESTIONS */}
            <div className="card border-0 shadow-sm mb-4">

              <div className="card-body">

                <h5 className="fw-bold mb-3">
                  🎯 Subject-Specific Recommendations
                </h5>

                {suggestion.subject_suggestions?.length ? (
                  <ul className="mb-0">

                    {suggestion.subject_suggestions.map(
                      (suggestionText, i) => (
                        <li
                          key={i}
                          className="mb-2"
                        >
                          {suggestionText}
                        </li>
                      )
                    )}

                  </ul>
                ) : (
                  <p className="text-muted mb-0">
                    No subject-specific recommendations available.
                  </p>
                )}

              </div>

            </div>

            {/* CONCENTRATION TIPS */}
            <div className="card border-0 shadow-sm">

              <div className="card-body">

                <h5 className="fw-bold mb-3">
                  🧠 Concentration & Study Tips
                </h5>

                {suggestion.concentration_tips?.length ? (
                  <ul className="mb-0">

                    {suggestion.concentration_tips.map(
                      (tip, i) => (
                        <li
                          key={i}
                          className="mb-2"
                        >
                          {tip}
                        </li>
                      )
                    )}

                  </ul>
                ) : (
                  <p className="text-muted mb-0">
                    No concentration tips available.
                  </p>
                )}

              </div>

            </div>

          </div>
        );
      })}

    </div>
  );
};

export default StudyHabits;