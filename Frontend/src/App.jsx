import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Register from "./pages/Register";
import StudentRoutes from "./routes/StudentRoutes";
import TeacherRouter from "./routes/TeacherRouter";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />

        {/* Student pages */}
        <Route
          path="/student/*"
          element={<StudentRoutes />}
        />

        {/* Teacher pages */}
        <Route
          path="/teacher/*"
          element={<TeacherRouter />}
        />

        {/* Unknown URL */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;