import { useEffect, useState } from "react";
import axios from "axios";

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // rest of your code...

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await axios.get(
        "http://127.0.0.1:8000/api/student/assignments/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAssignments(response.data);
    } catch (error) {
      console.error(error);
      setError("Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h3>Loading assignments...</h3>;
  }

  if (error) {
    return <h3>{error}</h3>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">My Assignments</h2>

      <div className="row">
        {assignments.length > 0 ? (
          assignments.map((assignment) => (
            <div className="col-md-6 col-lg-4 mb-4" key={assignment.id}>
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">
                    {assignment.title}
                  </h5>

                  <h6 className="card-subtitle mb-3 text-muted">
                    {assignment.subject}
                  </h6>

                  <p className="card-text">
                    {assignment.description}
                  </p>

                  <p>
                    <strong>Due Date:</strong>{" "}
                    {assignment.due_date}
                  </p>

                  <p>
                    <strong>Teacher:</strong>{" "}
                    {assignment.teacher}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12">
            <p>No assignments available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAssignments;