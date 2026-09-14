import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./TeacherDashboard.css";

const TeacherDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
    fetchStudents();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get("teacher/dashboard/");

      if (response.data.success) {
        setDashboard(response.data);
      }
    } catch (error) {
      console.error(error);
      setError("Unable to load teacher dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get("teacher/students/");

      if (response.data.success) {
        setStudents(response.data.students || []);
      }
    } catch (error) {
      console.error(error);
      setStudentsError("Unable to load students.");
    } finally {
      setStudentsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="teacher-dashboard-loading">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="teacher-dashboard-error">
        {error}
      </div>
    );
  }

  return (
    <div className="teacher-dashboard">

      {/* Header */}

      <div className="teacher-dashboard-header">
        <div>
          <h1>
            Welcome,{" "}
            {dashboard.teacher.first_name ||
              dashboard.teacher.username}{" "}
            👋
          </h1>

          <p>
            Manage your classes, subjects and students
          </p>
        </div>
      </div>

      {/* Stats */}

      <div className="teacher-stats">

        <div className="teacher-stat-card">
          <div className="teacher-stat-icon">
            📚
          </div>

          <div>
            <span>Subjects</span>

            <strong>
              {dashboard.summary.total_subjects}
            </strong>
          </div>
        </div>

        <div className="teacher-stat-card">
          <div className="teacher-stat-icon">
            🏫
          </div>

          <div>
            <span>Classes</span>

            <strong>
              {dashboard.summary.total_classes}
            </strong>
          </div>
        </div>

        <div className="teacher-stat-card">
          <div className="teacher-stat-icon">
            👨‍🎓
          </div>

          <div>
            <span>Students</span>

            <strong>
              {students.length}
            </strong>
          </div>
        </div>

      </div>

      {/* Subjects and Classes */}

      <div className="teacher-dashboard-grid">

        {/* Subjects */}

        <section className="teacher-dashboard-card">

          <div className="teacher-card-header">
            <h2>My Subjects</h2>
          </div>

          {dashboard.subjects.length === 0 ? (
            <p className="empty-message">
              No subjects assigned.
            </p>
          ) : (
            <div className="subject-list">

              {dashboard.subjects.map((subject) => (
                <div
                  className="subject-item"
                  key={subject.id}
                >
                  <div>
                    <h3>{subject.name}</h3>
                    <p>{subject.code}</p>
                  </div>
                </div>
              ))}

            </div>
          )}

        </section>

        {/* Classes */}

        <section className="teacher-dashboard-card">

          <div className="teacher-card-header">
            <h2>My Classes</h2>
          </div>

          {dashboard.classes.length === 0 ? (
            <p className="empty-message">
              No classes assigned.
            </p>
          ) : (
            <div className="class-list">

              {dashboard.classes.map((classroom) => (
                <div
                  className="class-item"
                  key={classroom.id}
                >
                  <h3>{classroom.name}</h3>

                  <p>
                    Semester {classroom.semester}
                    {" • "}
                    Division {classroom.division}
                  </p>
                </div>
              ))}

            </div>
          )}

        </section>

      </div>

      {/* Actions */}

      <div className="teacher-actions">

        <button
          className="teacher-action-btn"
          onClick={() =>
            navigate("/teacher/attendance", {
              state: {
                subjects: dashboard.subjects,
                classes: dashboard.classes,
              },
            })
          }
        >
          📋 Assign Attendance
        </button>

        <button
          className="teacher-action-btn"
          onClick={() =>
            navigate("/teacher/assignments")
          }
        >
          📝 Assignment
        </button>

      </div>

      {/* Students */}

      <section className="teacher-dashboard-card teacher-students-card">

        <div className="teacher-students-header">

          <div className="teacher-card-header">
            <h2>My Students</h2>
          </div>

          <div className="student-count">
            Total Students:{" "}
            <strong>{students.length}</strong>
          </div>

        </div>

        {studentsLoading ? (
          <p className="empty-message">
            Loading students...
          </p>
        ) : studentsError ? (
          <div className="teacher-error">
            {studentsError}
          </div>
        ) : students.length === 0 ? (
          <div className="no-students">

            <h3>No students found</h3>

            <p>
              There are currently no students in the
              Student group.
            </p>

          </div>
        ) : (
          <div className="students-table-container">

            <table className="students-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {students.map((student) => (
                  <tr key={student.id}>

                    <td>{student.id}</td>

                    <td>{student.username}</td>

                    <td>
                      {student.first_name}{" "}
                      {student.last_name}
                    </td>

                    <td>{student.email}</td>

                    <td>
                      <button
                        className="view-student-btn"
                        onClick={() =>
                          navigate(
                            `/teacher/students/${student.id}`
                          )
                        }
                      >
                        View
                      </button>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </section>

    </div>
  );
};

export default TeacherDashboard;