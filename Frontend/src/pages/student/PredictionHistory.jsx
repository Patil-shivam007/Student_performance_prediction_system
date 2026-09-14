import { useEffect, useState } from "react";
import api from "../../services/api";
import "./PredictionHistory.css";

function PredictionHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "student/prediction-history/"
      );

      console.log("Prediction History:", response.data);

      setHistory(response.data.history || []);

    } catch (error) {
      console.error(
        "History Error:",
        error.response?.data
      );

      setError(
        error.response?.data?.error ||
        "Unable to load prediction history."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="prediction-history-page">
        <div className="history-loading">
          Loading prediction history...
        </div>
      </div>
    );
  }

  return (
    <div className="prediction-history-page">

      <div className="history-header">
        <h1>Prediction History</h1>

        <p>
          View your previous AI performance predictions.
        </p>
      </div>

      {error && (
        <div className="history-error">
          {error}
        </div>
      )}

      {!error && history.length === 0 && (
        <div className="history-empty">
          <div className="history-empty-icon">
            📊
          </div>

          <h2>No Predictions Yet</h2>

          <p>
            You haven't made any AI performance
            predictions yet.
          </p>
        </div>
      )}

      {history.length > 0 && (
        <div className="history-table-container">

          <table className="history-table">

            <thead>
              <tr>
                <th>Subject</th>
                <th>Predicted Marks</th>
                <th>Performance</th>
                <th>Attendance</th>
                <th>Study Hours</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>

              {history.map((prediction) => (

                <tr key={prediction.id}>

                  <td>
                    {prediction.subject}
                  </td>

                  <td>
                    <strong>
                      {prediction.predicted_final_marks}
                    </strong>
                    / 100
                  </td>

                  <td>
                    <span
                      className={`history-category history-category-${prediction.performance_category
                        ?.toLowerCase()
                        .replaceAll(" ", "-")}`}
                    >
                      {prediction.performance_category}
                    </span>
                  </td>

                  <td>
                    {prediction.attendance_percentage}%
                  </td>

                  <td>
                    {prediction.study_hours_per_day}
                  </td>

                  <td>
                    {new Date(
                      prediction.created_at
                    ).toLocaleDateString()}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}

export default PredictionHistory;