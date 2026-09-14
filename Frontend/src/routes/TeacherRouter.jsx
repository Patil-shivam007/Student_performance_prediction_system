import { Routes, Route, Navigate } from "react-router-dom";
import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import TeacherAssignments from "../pages/teacher/TeacherAssignments";
import TeacherAttendance from "../pages/teacher/TeacherAttendance";
const TeacherRouter = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<TeacherDashboard />} />

      <Route
        path="/assignments"
        element={<TeacherAssignments />}
      />
      <Route
          path="/attendance"
          element={<TeacherAttendance />}
      />

      <Route
        path="*"
        element={<Navigate to="/teacher/dashboard" replace />}
      />
    </Routes>
  );
};

export default TeacherRouter;