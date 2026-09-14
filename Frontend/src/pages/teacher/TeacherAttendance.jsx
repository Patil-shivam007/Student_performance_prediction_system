import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../../services/api";
import "./TeacherAttendance.css";

const TeacherAttendance = () => {
  const location = useLocation();

  const [classroom, setClassroom] = useState("");
  const [subject, setSubject] = useState("");

  const [month, setMonth] = useState(
    new Date().getMonth() + 1
  );

  const [year, setYear] = useState(
    new Date().getFullYear()
  );

  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] =
    useState(true);

  const [message, setMessage] = useState("");

  /*
    Data coming from Teacher Dashboard
  */

  const subjects = location.state?.subjects || [];
  const classes = location.state?.classes || [];

  /*
    Fetch Students
  */

  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      setMessage("");

      const response = await api.get(
        "teacher/students/"
      );

      if (response.data.success) {
        const studentData =
          response.data.students || [];

        const updatedStudents = studentData.map(
          (student) => ({
            ...student,

            total_classes: 0,
            present: 0,
            absent: 0,
            late: 0,
          })
        );

        setStudents(updatedStudents);
      }
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.error ||
          "Failed to load students."
      );
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  /*
    Handle Attendance Input
  */

  const handleAttendanceChange = (
    studentId,
    field,
    value
  ) => {
    const numberValue =
      value === "" ? "" : Number(value);

    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.id === studentId
          ? {
              ...student,
              [field]: numberValue,
            }
          : student
      )
    );
  };

  /*
    Save Monthly Attendance
  */

  const saveMonthlyAttendance = async () => {
    setMessage("");

    if (!month) {
      setMessage("Please select a month.");
      return;
    }

    if (!year) {
      setMessage("Please select a year.");
      return;
    }

    if (!classroom) {
      setMessage(
        "Please select a classroom."
      );
      return;
    }

    if (!subject) {
      setMessage(
        "Please select a subject."
      );
      return;
    }

    if (students.length === 0) {
      setMessage(
        "No students available."
      );
      return;
    }

    /*
      Frontend validation
    */

    for (const student of students) {
      const total =
        Number(student.total_classes) || 0;

      const present =
        Number(student.present) || 0;

      const absent =
        Number(student.absent) || 0;

      const late =
        Number(student.late) || 0;

      if (
        present + absent + late !== total
      ) {
        setMessage(
          `Attendance mismatch for ${
            student.first_name || student.username
          }. Present + Absent + Late must equal Total Classes.`
        );
        return;
      }
    }

    try {
      setLoading(true);

      /*
        Prepare monthly attendance data
      */

      const attendance = students.map(
        (student) => ({
          student_id: student.id,

          total_classes:
            Number(student.total_classes) || 0,

          present:
            Number(student.present) || 0,

          absent:
            Number(student.absent) || 0,

          late:
            Number(student.late) || 0,
        })
      );

      /*
        Send to Django
      */

      const response = await api.post(
        "teacher/monthly-attendance/",
        {
          month: Number(month),
          year: Number(year),

          classroom_id: Number(classroom),

          subject_id: Number(subject),

          attendance: attendance,
        }
      );

      if (response.data.success) {
        setMessage(
          response.data.message ||
            "Monthly attendance saved successfully."
        );
      }
    } catch (error) {
      console.error(error);

      setMessage(
        error.response?.data?.error ||
          "Failed to save monthly attendance."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teacher-attendance-page">

      {/* Header */}

      <div className="attendance-header">

        <div>
          <h2>
            Monthly Attendance
          </h2>

          <p>
            Enter monthly attendance for your students
          </p>
        </div>

      </div>


      {/* Selection Card */}

      <div className="attendance-selection-card">

        {/* Month */}

        <div className="selection-item">

          <label>
            Month
          </label>

          <select
            value={month}
            onChange={(e) =>
              setMonth(e.target.value)
            }
          >
            <option value="">
              Select Month
            </option>

            <option value="1">
              January
            </option>

            <option value="2">
              February
            </option>

            <option value="3">
              March
            </option>

            <option value="4">
              April
            </option>

            <option value="5">
              May
            </option>

            <option value="6">
              June
            </option>

            <option value="7">
              July
            </option>

            <option value="8">
              August
            </option>

            <option value="9">
              September
            </option>

            <option value="10">
              October
            </option>

            <option value="11">
              November
            </option>

            <option value="12">
              December
            </option>

          </select>

        </div>


        {/* Year */}

        <div className="selection-item">

          <label>
            Year
          </label>

          <select
            value={year}
            onChange={(e) =>
              setYear(e.target.value)
            }
          >
            <option value="2026">
              2026
            </option>

            <option value="2027">
              2027
            </option>

            <option value="2028">
              2028
            </option>

          </select>

        </div>


        {/* Classroom */}

        <div className="selection-item">

          <label>
            Classroom
          </label>

          <select
            value={classroom}
            onChange={(e) =>
              setClassroom(e.target.value)
            }
          >

            <option value="">
              Select Classroom
            </option>

            {classes.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.name}
                {" - "}
                Semester {item.semester}
                {" - "}
                Division {item.division}
              </option>
            ))}

          </select>

        </div>


        {/* Subject */}

        <div className="selection-item">

          <label>
            Subject
          </label>

          <select
            value={subject}
            onChange={(e) =>
              setSubject(e.target.value)
            }
          >

            <option value="">
              Select Subject
            </option>

            {subjects.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.name}
                {" ("}
                {item.code}
                {")"}
              </option>
            ))}

          </select>

        </div>

      </div>


      {/* Students Card */}

      <div className="students-card">

        <div className="students-card-header">

          <div>

            <h4>
              Monthly Attendance
            </h4>

            <span>
              {students.length} students
            </span>

          </div>

        </div>


        {studentsLoading ? (

          <div className="no-students">

            <p>
              Loading students...
            </p>

          </div>

        ) : students.length === 0 ? (

          <div className="no-students">

            <div className="empty-icon">
              👨‍🎓
            </div>

            <h5>
              No students found
            </h5>

            <p>
              There are no students assigned
              to you.
            </p>

          </div>

        ) : (

          <div className="table-wrapper">

            <table className="attendance-table">

              <thead>

                <tr>

                  <th>#</th>

                  <th>
                    Student
                  </th>

                  <th>
                    Username
                  </th>

                  <th>
                    Total Classes
                  </th>

                  <th>
                    Present
                  </th>

                  <th>
                    Absent
                  </th>

                  <th>
                    Late
                  </th>

                </tr>

              </thead>


              <tbody>

                {students.map(
                  (student, index) => (

                    <tr
                      key={student.id}
                    >

                      <td className="student-number">
                        {index + 1}
                      </td>


                      <td>

                        <div className="student-info">

                          <div className="student-avatar">

                            {student.first_name
                              ?.charAt(0)
                              .toUpperCase() ||
                              "S"}

                          </div>

                          <div>

                            <strong>
                              {student.first_name}{" "}
                              {student.last_name}
                            </strong>

                          </div>

                        </div>

                      </td>


                      <td className="username">

                        {student.username}

                      </td>


                      {/* Total Classes */}

                      <td>

                        <input
                          type="number"
                          min="0"
                          className="attendance-input"
                          value={
                            student.total_classes
                          }
                          onChange={(e) =>
                            handleAttendanceChange(
                              student.id,
                              "total_classes",
                              e.target.value
                            )
                          }
                        />

                      </td>


                      {/* Present */}

                      <td>

                        <input
                          type="number"
                          min="0"
                          className="attendance-input present-input"
                          value={
                            student.present
                          }
                          onChange={(e) =>
                            handleAttendanceChange(
                              student.id,
                              "present",
                              e.target.value
                            )
                          }
                        />

                      </td>


                      {/* Absent */}

                      <td>

                        <input
                          type="number"
                          min="0"
                          className="attendance-input absent-input"
                          value={
                            student.absent
                          }
                          onChange={(e) =>
                            handleAttendanceChange(
                              student.id,
                              "absent",
                              e.target.value
                            )
                          }
                        />

                      </td>


                      {/* Late */}

                      <td>

                        <input
                          type="number"
                          min="0"
                          className="attendance-input late-input"
                          value={
                            student.late
                          }
                          onChange={(e) =>
                            handleAttendanceChange(
                              student.id,
                              "late",
                              e.target.value
                            )
                          }
                        />

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}


        {/* Footer */}

        {students.length > 0 && (

          <div className="attendance-footer">

            <div className="attendance-info">

              <span className="info-dot"></span>

              Present + Absent + Late must equal Total Classes

            </div>


            <button
              className="save-attendance-btn"
              onClick={
                saveMonthlyAttendance
              }
              disabled={loading}
            >

              {loading
                ? "Saving..."
                : "Save Monthly Attendance"}

            </button>

          </div>

        )}


        {/* Message */}

        {message && (

          <div className="attendance-message">

            {message}

          </div>

        )}

      </div>

    </div>
  );
};

export default TeacherAttendance;