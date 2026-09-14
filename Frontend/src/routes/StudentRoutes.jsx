import { Routes, Route } from "react-router-dom";

import StudentLayout from "../components/StudentLayout";

import StudentDashboard from "../pages/student/StudentDashboard";
import Profile from "../pages/student/Profile";
import Performance from "../pages/student/Performance";
import AcademicData from "../pages/student/AcademicData";
import AIPrediction from "../pages/student/AIPrediction";
import PredictionHistory from "../pages/student/PredictionHistory";
import Analytics from "../pages/student/Analytics";
import Reports from "../pages/student/Reports";
import Settings from "../pages/student/Settings";
import Attendance from "../pages/student/Attendance";
import StudentAssignments from "../pages/student/StudentAssignments";
import StudyHabits from "../pages/student/StudyHabits";

function StudentRoutes() {
  return (
    <Routes>

      <Route element={<StudentLayout />}>

        <Route
          path="dashboard"
          element={<StudentDashboard />}
        />

        <Route
          path="profile"
          element={<Profile />}
        />

        <Route
          path="performance"
          element={<Performance />}
        />

        <Route
          path="academic-data"
          element={<AcademicData />}
        />
        <Route
          path="study-habits"
          element={<StudyHabits />}
        />

        <Route
          path="prediction"
          element={<AIPrediction />}
        />

        <Route
          path="prediction-history"
          element={<PredictionHistory />}
        />

        <Route
          path="analytics"
          element={<Analytics />}
        />
        <Route
          path="assignments"
          element={<StudentAssignments />}
        />
        <Route
          path="reports"
          element={<Reports />}
        />

        <Route
          path="settings"
          element={<Settings />}
        />
        <Route path="attendance" element={<Attendance />} />
      </Route>

    </Routes>
  );
}

export default StudentRoutes;