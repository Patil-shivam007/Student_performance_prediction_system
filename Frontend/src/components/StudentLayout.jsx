import { Outlet } from "react-router-dom";
import StudentSidebar from "./StudentSidebar";
import "./StudentLayout.css";

function StudentLayout() {
  return (
    <div className="student-layout">

      <StudentSidebar />

      <main className="main-content">
        <Outlet />
      </main>

    </div>
  );
}

export default StudentLayout;