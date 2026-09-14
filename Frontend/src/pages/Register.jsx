import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Register.css";
import registerInfoImage from "../assets/register-info.png.png";
const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    student_class: "",
    division: "",
    roll_number: "",
  });

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classroomId, setClassroomId] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      setError("");
      const response = await api.get("classes/");

      if (response.data.success) {
        setClasses(response.data.classes);
      } else {
        setClasses(response.data);
      }
    } catch (err) {
      console.error("Class loading error:", err);
      setError("Unable to load classes.");
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClassChange = async (e) => {
    const selectedClassId = e.target.value;

    setClassroomId(selectedClassId);
    setSubjects([]);
    setSelectedSubjects([]);
    setError("");

    if (!selectedClassId) {
      setFormData((prev) => ({
        ...prev,
        student_class: "",
        division: "",
      }));
      return;
    }

    const selectedClass = classes.find(
      (item) => String(item.id) === String(selectedClassId)
    );

    if (selectedClass) {
      setFormData((prev) => ({
        ...prev,
        student_class: selectedClass.name,
        division: selectedClass.division,
      }));
    }

    try {
      setLoadingSubjects(true);

      const response = await api.get(
        `classes/${selectedClassId}/subjects/`
      );

      if (response.data.success) {
        setSubjects(response.data.subjects);
      } else {
        setSubjects(response.data);
      }
    } catch (err) {
      console.error("Subject loading error:", err);
      setError("Unable to load subjects for this class.");
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleSubjectChange = (subjectId) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!classroomId) {
      setError("Please select your class.");
      return;
    }

    if (selectedSubjects.length === 0) {
      setError("Please select at least one subject.");
      return;
    }

    try {
      const registrationData = {
        ...formData,
        classroom_id: Number(classroomId),
        subject_ids: selectedSubjects.map((id) => Number(id)),
      };

      const response = await api.post("register/", registrationData);

      if (response.status === 201) {
        setSuccess("Student registered successfully!");

        setFormData({
          username: "",
          password: "",
          email: "",
          first_name: "",
          last_name: "",
          phone: "",
          date_of_birth: "",
          gender: "",
          student_class: "",
          division: "",
          roll_number: "",
        });

        setClassroomId("");
        setSelectedSubjects([]);
        setSubjects([]);

        setTimeout(() => navigate("/"), 1500);
      }
    } catch (err) {
      console.error("Registration error:", err);

      if (err.response?.data) {
        const backendError = err.response.data;

        if (typeof backendError === "string") {
          setError(backendError);
        } else if (backendError.detail) {
          setError(backendError.detail);
        } else {
          const messages = Object.entries(backendError)
            .map(([field, message]) => {
              if (Array.isArray(message)) {
                return `${field}: ${message.join(", ")}`;
              }
              return `${field}: ${message}`;
            })
            .join(" | ");

          setError(messages || "Registration failed.");
        }
      } else {
        setError("Registration failed. Please try again.");
      }
    }
  };

  const selectedClass = classes.find(
    (item) => String(item.id) === String(classroomId)
  );

  return (
    <div className="register-page">

      {/* LEFT IMAGE SECTION */}
      <div className="register-left">
        <img
          src={registerInfoImage}
          alt="Student Performance System"
          className="register-info-image"
        />
      </div>

      {/* RIGHT REGISTRATION FORM */}
      <div className="register-right">
        <div className="register-form-container">

          <div className="register-header">
            <h2>Create Account</h2>
            <p>Register as a student</p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit}>

            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                minLength={8}
                required
              />
              <small>Password must contain at least 8 characters.</small>
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Class</label>
              <select
                value={classroomId}
                onChange={handleClassChange}
                required
                disabled={loadingClasses}
              >
                <option value="">
                  {loadingClasses ? "Loading classes..." : "Select Class"}
                </option>

                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} - Semester {item.semester} - Division{" "}
                    {item.division}
                  </option>
                ))}
              </select>
            </div>

            {classroomId && selectedClass && (
              <div className="form-row">
                <div className="form-group">
                  <label>Semester</label>
                  <input type="text" value={selectedClass.semester} readOnly />
                </div>

                <div className="form-group">
                  <label>Division</label>
                  <input type="text" value={selectedClass.division} readOnly />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Roll Number</label>
              <input
                type="number"
                name="roll_number"
                value={formData.roll_number}
                onChange={handleChange}
                placeholder="Enter roll number"
                required
              />
            </div>

            {classroomId && (
              <div className="form-group">
                <label>Select Subjects</label>

                {loadingSubjects ? (
                  <div className="subjects-loading">Loading subjects...</div>
                ) : subjects.length === 0 ? (
                  <div className="subjects-empty">
                    No subjects available for this class.
                  </div>
                ) : (
                  <div className="subject-selection">
                    {subjects.map((item) => {
                      const isSelected = selectedSubjects.includes(item.id);

                      return (
                        <label
                          key={item.id}
                          className={`subject-option ${
                            isSelected ? "selected" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSubjectChange(item.id)}
                          />

                          <div className="subject-info">
                            <strong>{item.name}</strong>

                            {item.code && (
                              <span>Code: {item.code}</span>
                            )}

                            <span>
                              Teacher:{" "}
                              {item.teacher_name ||
                                item.teacher_username ||
                                "Assigned Teacher"}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {selectedSubjects.length > 0 && (
              <div className="selected-subject-count">
                {selectedSubjects.length} subject
                {selectedSubjects.length > 1 ? "s" : ""} selected
              </div>
            )}

            <button type="submit" className="register-btn">
              Create Account
            </button>
          </form>

          <div className="login-link">
            <span>Already have an account?</span>
            <button type="button" onClick={() => navigate("/")}>
              Login
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
