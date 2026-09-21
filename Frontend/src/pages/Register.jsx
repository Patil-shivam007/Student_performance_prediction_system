import { useState } from "react";
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

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [division, setDivision] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleYearChange = (e) => {
    const value = e.target.value;

    setYear(value);
    setSemester("");
    setDivision("");

    setFormData((prev) => ({
      ...prev,
      student_class: "",
      division: "",
    }));
  };

  const handleSemesterChange = (e) => {
    const value = e.target.value;

    setSemester(value);
    setDivision("");

    setFormData((prev) => ({
      ...prev,
      student_class: "",
      division: "",
    }));
  };

  const handleDivisionChange = (e) => {
    const value = e.target.value;

    setDivision(value);

    setFormData((prev) => ({
      ...prev,
      division: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      const registrationData = {
        ...formData,
        student_class: semester,
        division: division,
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

        setYear("");
        setSemester("");
        setDivision("");

        setTimeout(() => {
          navigate("/");
        }, 1500);
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

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* FIRST NAME + LAST NAME */}
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

            {/* USERNAME */}
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

            {/* EMAIL */}
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

            {/* PASSWORD */}
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

              <small>
                Password must contain at least 8 characters.
              </small>
            </div>

            {/* PHONE */}
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

            {/* DOB + GENDER */}
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

            {/* YEAR */}
            <div className="form-group">
              <label>Year</label>

              <select
                value={year}
                onChange={handleYearChange}
                required
              >
                <option value="">Select Year</option>
                <option value="1">First Year</option>
                <option value="2">Second Year</option>
                <option value="3">Third Year</option>
              </select>
            </div>

            {/* SEMESTER */}
            <div className="form-group">
              <label>Semester</label>

              <select
                value={semester}
                onChange={handleSemesterChange}
                required
                disabled={!year}
              >
                <option value="">
                  Select Semester
                </option>

                {year === "1" && (
                  <>
                    <option value="1">
                      Semester 1
                    </option>

                    <option value="2">
                      Semester 2
                    </option>
                  </>
                )}

                {year === "2" && (
                  <>
                    <option value="3">
                      Semester 3
                    </option>

                    <option value="4">
                      Semester 4
                    </option>
                  </>
                )}

                {year === "3" && (
                  <>
                    <option value="5">
                      Semester 5
                    </option>

                    <option value="6">
                      Semester 6
                    </option>
                  </>
                )}
              </select>
            </div>

            {/* DIVISION */}
            <div className="form-group">
              <label>Division</label>

              <select
                value={division}
                onChange={handleDivisionChange}
                required
                disabled={!semester}
              >
                <option value="">
                  Select Division
                </option>

                <option value="A">
                  Division A
                </option>

                <option value="B">
                  Division B
                </option>

                <option value="C">
                  Division C
                </option>
              </select>
            </div>

            {/* ROLL NUMBER */}
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

            {/* REGISTER BUTTON */}
            <button
              type="submit"
              className="register-btn"
            >
              Create Account
            </button>

          </form>

          {/* LOGIN LINK */}
          <div className="login-link">
            <span>
              Already have an account?
            </span>

            <button
              type="button"
              onClick={() => navigate("/")}
            >
              Login
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Register;