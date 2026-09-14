import { useEffect, useState } from "react";
import api from "../../services/api";
import "./TeacherAssignments.css";

const TeacherAssignments = () => {
  const [assignments, setAssignments] = useState([]);

  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    subject: "",
    classroom: "",
    title: "",
    description: "",
    due_date: "",
  });

  const [formError, setFormError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignmentsResponse, dashboardResponse] = await Promise.all([
        api.get("assignments/"),
        api.get("teacher/dashboard/"),
      ]);

      setAssignments(assignmentsResponse.data);

      if (dashboardResponse.data.success) {
        setSubjects(dashboardResponse.data.subjects);
        setClasses(dashboardResponse.data.classes);
      }
    } catch (error) {
      console.error(error);
      setError("Unable to load assignment data.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormError("");
    setCreating(true);

    try {
      await api.post("assignments/", formData);

      setFormData({
        subject: "",
        classroom: "",
        title: "",
        description: "",
        due_date: "",
      });

      setShowForm(false);

      await fetchData();
    } catch (error) {
      console.error(error);

      if (error.response?.data) {
        setFormError(
          typeof error.response.data === "object"
            ? JSON.stringify(error.response.data)
            : error.response.data
        );
      } else {
        setFormError("Unable to create assignment.");
      }
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="teacher-assignment-page">
        <h3>Loading assignments...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-assignment-page">
        <h3>{error}</h3>
      </div>
    );
  }

  return (
    <div className="teacher-assignment-page">

      <div className="assignment-header">
        <div>
          <h2>My Assignments</h2>
          <p>Create and manage assignments for your students.</p>
        </div>

        <button
          className="create-assignment-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "✕ Close" : "➕ Create Assignment"}
        </button>
      </div>

      {showForm && (
        <div className="assignment-form-card">

          <h3>Create Assignment</h3>

          {formError && (
            <div className="assignment-form-error">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="form-row">

              <div className="form-group">
                <label>Subject</label>

                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Subject</option>

                  {subjects.map((subject) => (
                    <option
                      key={subject.id}
                      value={subject.id}
                    >
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Classroom</label>

                <select
                  name="classroom"
                  value={formData.classroom}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Classroom</option>

                  {classes.map((classroom) => (
                    <option
                      key={classroom.id}
                      value={classroom.id}
                    >
                      {classroom.name}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <div className="form-group">
              <label>Assignment Title</label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter assignment title"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter assignment description"
                rows="5"
                required
              />
            </div>

            <div className="form-group">
              <label>Due Date</label>

              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="submit-assignment-btn"
              disabled={creating}
            >
              {creating ? "Creating..." : "Create Assignment"}
            </button>

          </form>
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="no-assignments">
          <h3>No assignments created yet.</h3>
          <p>Click "Create Assignment" to create your first assignment.</p>
        </div>
      ) : (
        <div className="assignment-grid">

          {assignments.map((assignment) => (
            <div
              className="assignment-card"
              key={assignment.id}
            >
              <div className="assignment-card-body">

                <h3>{assignment.title}</h3>

                <p>
                  <strong>Subject:</strong>{" "}
                  {assignment.subject_name}
                </p>

                <p>
                  <strong>Class:</strong>{" "}
                  {assignment.classroom_name}
                </p>

                <p className="assignment-description">
                  {assignment.description}
                </p>

                <p className="assignment-due-date">
                  <strong>Due Date:</strong>{" "}
                  {assignment.due_date}
                </p>

              </div>
            </div>
          ))}

        </div>
      )}

    </div>
  );
};

export default TeacherAssignments;