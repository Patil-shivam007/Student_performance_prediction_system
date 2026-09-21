from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    StudentRegistrationView,
    LoginViwe,
    StudentProfileViwe,
    StudentPredictionView,
    PredictionHistoryView,
    AttendanceView,
    TeacherStudentListView,
    TeacherStudentDetailView,
    TeacherDashboardView,
    TeacherAttendanceView,
    TeacherMonthlyAttendanceView,
    StudyHabitView,StudyHabitSuggestionView,
    RefreshStudyHabitSuggestionView,
    AcademicPerformanceView,
    PublicStatsView,
    ClassRoomListView
)


from .assigment import (
    AssignmentListCreateView,
    AssignmentDetailView,
    StudentAssignmentView,
)


urlpatterns = [

    # ==============================
    # PUBLIC LANDING STATS
    # ==============================
    path(
        "public/stats/",
        PublicStatsView.as_view(),
        name="public-stats",
    ),

    # ==============================
    # STUDENT REGISTRATION
    # ==============================
    path(
        "register/",
        StudentRegistrationView.as_view(),
        name="register",
    ),

    # ==============================
    # STUDENT LOGIN
    # ==============================
    path(
        "login/",
        LoginViwe.as_view(),
        name="login",
    ),

    # ==============================
    # JWT TOKEN REFRESH
    # ==============================
    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token-refresh",
    ),

    # ==============================
    # STUDENT PROFILE
    # ==============================
    path(
        "student/profile/",
        StudentProfileViwe.as_view(),
        name="student-profile",
    ),

    # ==============================
    # STUDENT PREDICTION
    # ==============================
    path(
        "student/prediction/",
        StudentPredictionView.as_view(),
        name="student-prediction",
    ),

    # ==============================
    # PREDICTION HISTORY
    # ==============================
    path(
        "student/prediction-history/",
        PredictionHistoryView.as_view(),
        name="prediction-history",
    ),

    # ==============================
    # STUDENT ATTENDANCE
    # ==============================
    path(
        "student/attendance/",
        AttendanceView.as_view(),
        name="student-attendance",
    ),

    # ==============================
    # TEACHER STUDENTS
    # ==============================
    path(
        "teacher/students/",
        TeacherStudentListView.as_view(),
        name="teacher-students",
    ),

    path(
        "teacher/students/<int:student_id>/",
        TeacherStudentDetailView.as_view(),
        name="teacher-student-detail",
    ),

# ==============================
# TEACHER DASHBOARD
# ==============================
path(
    "teacher/dashboard/",
    TeacherDashboardView.as_view(),
    name="teacher-dashboard",
),

# ==============================
# TEACHER ATTENDANCE
# ==============================
path(
    "teacher/attendance/",
    TeacherAttendanceView.as_view(),
    name="teacher-attendance",
),
    # ==============================
    # ASSIGNMENTS
    # ==============================
    path(
        "assignments/",
        AssignmentListCreateView.as_view(),
        name="assignment-list-create",
    ),

    path(
        "assignments/<int:pk>/",
        AssignmentDetailView.as_view(),
        name="assignment-detail",
    ),

    # ==============================
    # STUDENT ASSIGNMENTS
    # ==============================
    path(
        "student/assignments/",
        StudentAssignmentView.as_view(),
        name="student-assignments",
    ),
path(
    "teacher/monthly-attendance/",
    TeacherMonthlyAttendanceView.as_view(),
    name="teacher-monthly-attendance"
),
path(
    "student/study-habits/",
    StudyHabitView.as_view(),
    name="student-study-habits"
),
path(
    "student/study-habits/suggestions/",
    StudyHabitSuggestionView.as_view(),
    name="student-study-habit-suggestions"
),
path(
    "student/study-habits/suggestions/refresh/",
    RefreshStudyHabitSuggestionView.as_view(),
    name="refresh-study-habit-suggestions"
),
path(
    "student/academic-performance/",
    AcademicPerformanceView.as_view(),
    name="student-academic-performance"
),
path(
    "classes/",
    ClassRoomListView.as_view(),
    name="class-list",
),

]