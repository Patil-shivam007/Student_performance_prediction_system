import { useState } from "react";
import api from "../../services/api";
import "./AIPredication.css";

function AIPrediction() {
  const [formData, setFormData] = useState({
    age: 20,
    gender: "Male",
    category: "General",
    semester: 5,
    subject: "Mathematics",
    attendance_percentage: 85,
    study_hours_per_day: 4,
    assignment_completion_percentage: 90,
    internal_marks: 25,
    midterm_marks: 70,
    previous_semester_sgpa: 8.2,
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setPrediction(null);

    try {
      const response = await api.post(
        "student/prediction/",
        formData
      );

      console.log("Prediction Response:", response.data);

      setPrediction(response.data.prediction);

    } catch (error) {
      console.error(
        "Prediction Error:",
        error.response?.data
      );

      if (error.response?.data?.details) {
        setError(error.response.data.details);
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError(
          "Unable to generate prediction. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setPrediction(null);
  };

  const categoryClass = prediction
    ? prediction.performance_category?.toLowerCase()
    : "";

  return (
    <div className="ai-prediction-page">

      {/* PAGE HEADER */}
      <div className="prediction-header">
        <h1>AI Performance Prediction</h1>

        <p>
          Enter your academic information to predict your
          final performance using AI.
        </p>
      </div>

      {/* FORM */}
      <form
        className="prediction-form"
        onSubmit={handleSubmit}
      >

        {/* PERSONAL INFORMATION */}
        <section className="prediction-section">

          <h2>Student Information</h2>

            <div className="form-field">
              <label>Age</label>

              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="15"
                max="30"
                required
              />
            </div>

            <div className="form-field">
              <label>Gender</label>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="form-field">
              <label>Category</label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>

            <div className="form-field">
              <label>Semester</label>

              <input
                type="number"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                min="1"
                max="8"
                required
              />
            </div>

            <div className="form-field">
                <label>Subject</label>

                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="Programming Fundamentals">
                    Programming Fundamentals
                  </option>

                  <option value="Mathematics I">
                    Mathematics I
                  </option>

                  <option value="Digital Electronics">
                    Digital Electronics
                  </option>

                  <option value="Computer Fundamentals">
                    Computer Fundamentals
                  </option>

                  <option value="Communication Skills">
                    Communication Skills
                  </option>

                  <option value="Python Programming">
                    Python Programming
                  </option>

                  <option value="Mathematics II">
                    Mathematics II
                  </option>

                  <option value="Data Structures">
                    Data Structures
                  </option>

                  <option value="Database Management Systems">
                    Database Management Systems
                  </option>

                  <option value="Computer Organization">
                    Computer Organization
                  </option>

                  <option value="Object Oriented Programming">
                    Object Oriented Programming
                  </option>

                  <option value="Operating Systems">
                    Operating Systems
                  </option>

                  <option value="Computer Networks">
                    Computer Networks
                  </option>

                  <option value="Statistics">
                    Statistics
                  </option>

                  <option value="Web Development">
                    Web Development
                  </option>

                  <option value="Machine Learning">
                    Machine Learning
                  </option>

                  <option value="Artificial Intelligence">
                    Artificial Intelligence
                  </option>

                  <option value="Software Engineering">
                    Software Engineering
                  </option>

                  <option value="Web Technologies">
                    Web Technologies
                  </option>

                  <option value="Theory of Computation">
                    Theory of Computation
                  </option>

                  <option value="Deep Learning">
                    Deep Learning
                  </option>

                  <option value="Cloud Computing">
                    Cloud Computing
                  </option>

                  <option value="Data Mining">
                    Data Mining
                  </option>

                  <option value="Big Data Analytics">
                    Big Data Analytics
                  </option>

                  <option value="Cyber Security">
                    Cyber Security
                  </option>

                  <option value="Natural Language Processing">
                    Natural Language Processing
                  </option>

                  <option value="Computer Vision">
                    Computer Vision
                  </option>

                  <option value="Advanced Machine Learning">
                    Advanced Machine Learning
                  </option>

                  <option value="Project Management">
                    Project Management
                  </option>

                  <option value="Major Project">
                    Major Project
                  </option>
                </select>
              </div>
        </section>

        {/* ACADEMIC INFORMATION */}
        <section className="prediction-section">

          <h2>Academic Information</h2>

          <div className="form-grid">

            <div className="form-field">
              <label>Attendance (%)</label>

              <input
                type="number"
                name="attendance_percentage"
                value={formData.attendance_percentage}
                onChange={handleChange}
                min="0"
                max="100"
                required
              />
            </div>

            <div className="form-field">
              <label>Study Hours / Day</label>

              <input
                type="number"
                name="study_hours_per_day"
                value={formData.study_hours_per_day}
                onChange={handleChange}
                min="0"
                max="24"
                step="0.1"
                required
              />
            </div>

            <div className="form-field">
              <label>Assignment Completion (%)</label>

              <input
                type="number"
                name="assignment_completion_percentage"
                value={
                  formData.assignment_completion_percentage
                }
                onChange={handleChange}
                min="0"
                max="100"
                required
              />
            </div>

            <div className="form-field">
              <label>Internal Marks</label>

              <input
                type="number"
                name="internal_marks"
                value={formData.internal_marks}
                onChange={handleChange}
                min="0"
                max="100"
                required
              />
            </div>

            <div className="form-field">
              <label>Midterm Marks</label>

              <input
                type="number"
                name="midterm_marks"
                value={formData.midterm_marks}
                onChange={handleChange}
                min="0"
                max="100"
                required
              />
            </div>

            <div className="form-field">
              <label>Previous Semester SGPA</label>

              <input
                type="number"
                name="previous_semester_sgpa"
                value={formData.previous_semester_sgpa}
                onChange={handleChange}
                min="0"
                max="10"
                step="0.01"
                required
              />
            </div>

          </div>
        </section>

        {/* SUBMIT */}
        <div className="prediction-actions">

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Analyzing..."
              : "Predict My Performance"}
          </button>

        </div>

        {/* ERROR */}
        {error && (
          <div className="prediction-error">
            {error}
          </div>
        )}

      </form>

      {/* =====================================================
          PREDICTION MODAL
      ===================================================== */}

      {prediction && (
        <div
          className="prediction-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="prediction-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="prediction-modal-close"
              onClick={closeModal}
              type="button"
            >
              ×
            </button>

            <div className="prediction-modal-icon">
              ✨
            </div>

            <h2>AI Prediction Result</h2>

            <p className="prediction-modal-subtitle">
              Based on the academic information you provided
            </p>

            <div className="prediction-score">

              <span>Predicted Final Marks</span>

              <strong>
                {prediction.predicted_final_marks}
              </strong>

              <small>/ 100</small>

            </div>

            <div className={`prediction-category prediction-category-${categoryClass}`}>

              <span>Performance Category</span>

              <strong>
                {prediction.performance_category}
              </strong>

            </div>

            <button
              className="prediction-modal-button"
              onClick={closeModal}
              type="button"
            >
              Done
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default AIPrediction;