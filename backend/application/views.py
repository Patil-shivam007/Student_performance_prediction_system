from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from  django.contrib.auth import authenticate
from .serializers import *
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from application.models import StudentProfile
from ml.predict import predict_student_performance
from application.models import PredictionHistory
from .models import Attendance,StudentSubject,TeacherAllocation
from .permissions import IsTeacher
from django.contrib.auth import get_user_model

class StudentRegistrationView(APIView):

    def post(self, request):

        serializer = StudentRegistrationSerializer(
            data=request.data
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    "message": "Student registered successfully"
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class LoginViwe(APIView):
    def post(self, request):

        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {
                    "error": "Username and password are required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(
            username=username,
            password=password
        )

        if user is None:
            return Response(
                {
                    "error": "Invalid username or password"
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)

        # Determine user role
        if user.groups.filter(name="Admin").exists() or user.is_superuser:
            role = "Admin"

        elif user.groups.filter(name="Teacher").exists():
            role = "Teacher"

        elif user.groups.filter(name="Student").exists():
            role = "Student"

        else:
            role = "Student"

        return Response(
            {
                "message": "Login Successful",

                "access": str(refresh.access_token),

                "refresh": str(refresh),

                "user": {
                    "id": user.id,
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "email": user.email,
                    "role": role,
                }
            },
            status=status.HTTP_200_OK
        )

    
class StudentProfileViwe(APIView):

    permission_classes = [IsAuthenticated]

    def get(self,request):
        try:
            student = StudentProfile.objects.get(
                user=request.user
            )

            serializer = StudentProfileSerializer(student)
            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )
        except StudentProfile.DoesNotExist:

            return Response(
                {
                    "error":"Student profile not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
class StudentPredictionView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        print("REQUEST DATA:")
        print(request.data)

        try:

            # Check request data
            if not request.data:
                return Response(
                    {
                        "success": False,
                        "error": "No student data provided."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Copy request data
            data = request.data.copy()

            # Run ML prediction
            result = predict_student_performance(data)

            # Save prediction history
            prediction_history = PredictionHistory.objects.create(

                student=request.user,

                subject=data["subject"],

                predicted_final_marks=result[
                    "predicted_final_marks"
                ],

                performance_category=result[
                    "performance_category"
                ],

                attendance_percentage=data[
                    "attendance_percentage"
                ],

                study_hours_per_day=data[
                    "study_hours_per_day"
                ],

                assignment_completion_percentage=data[
                    "assignment_completion_percentage"
                ],

                internal_marks=data[
                    "internal_marks"
                ],

                midterm_marks=data[
                    "midterm_marks"
                ],

                previous_semester_sgpa=data[
                    "previous_semester_sgpa"
                ],
            )

            print(
                "Prediction saved:",
                prediction_history.id
            )

            # Return response
            return Response(
                {
                    "success": True,

                    "prediction": {
                        "id": prediction_history.id,
                        "predicted_final_marks": result[
                            "predicted_final_marks"
                        ],
                        "performance_category": result[
                            "performance_category"
                        ]
                    }
                },
                status=status.HTTP_200_OK
            )

        except ValueError as e:

            return Response(
                {
                    "success": False,
                    "error": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        except KeyError as e:

            return Response(
                {
                    "success": False,
                    "error": f"Missing field: {str(e)}"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:

            import traceback
            traceback.print_exc()

            return Response(
                {
                    "success": False,
                    "error": "Prediction failed.",
                    "details": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PredictionHistoryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        try:
            history = PredictionHistory.objects.filter(
                student=request.user
            ).order_by("-created_at")

            data = []

            for prediction in history:

                data.append({
                    "id": prediction.id,
                    "subject": prediction.subject,
                    "predicted_final_marks": prediction.predicted_final_marks,
                    "performance_category": prediction.performance_category,
                    "attendance_percentage": prediction.attendance_percentage,
                    "study_hours_per_day": prediction.study_hours_per_day,
                    "assignment_completion_percentage":prediction.assignment_completion_percentage,
                    "internal_marks": prediction.internal_marks,
                    "midterm_marks": prediction.midterm_marks,
                    "previous_semester_sgpa":prediction.previous_semester_sgpa,
                    "created_at": prediction.created_at,
                })

            return Response(
                {
                    "success": True,
                    "count": len(data),
                    "history": data
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:

            import traceback
            traceback.print_exc()

            return Response(
                {
                    "success": False,
                    "error": "Unable to fetch prediction history.",
                    "details": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )   

class AttendanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        month = request.query_params.get("month")
        year = request.query_params.get("year")

        attendance = MonthlyAttendance.objects.filter(
            student=request.user
        ).select_related(
            "subject",
            "classroom"
        )

        # Filter by month
        if month:
            attendance = attendance.filter(month=month)

        # Filter by year
        if year:
            attendance = attendance.filter(year=year)

        attendance = attendance.order_by("-year", "-month")

        # -----------------------------
        # Overall Summary
        # -----------------------------

        total_classes = sum(
            record.total_classes
            for record in attendance
        )

        classes_attended = sum(
            record.present + record.late
            for record in attendance
        )

        classes_absent = sum(
            record.absent
            for record in attendance
        )

        overall_attendance = (
            round(
                (classes_attended / total_classes) * 100,
                2
            )
            if total_classes > 0
            else 0
        )

        # -----------------------------
        # Subject Attendance
        # -----------------------------

        subject_data = {}

        for record in attendance:

            subject_id = record.subject.id
            subject_name = record.subject.name

            if subject_id not in subject_data:
                subject_data[subject_id] = {
                    "subject_id": subject_id,
                    "subject": subject_name,
                    "total_classes": 0,
                    "classes_attended": 0,
                    "classes_absent": 0,
                    "late": 0,
                }

            subject_data[subject_id]["total_classes"] += (
                record.total_classes
            )

            subject_data[subject_id]["classes_attended"] += (
                record.present + record.late
            )

            subject_data[subject_id]["classes_absent"] += (
                record.absent
            )

            subject_data[subject_id]["late"] += (
                record.late
            )

        subjects = []

        for subject in subject_data.values():

            if subject["total_classes"] > 0:
                percentage = round(
                    (
                        subject["classes_attended"]
                        / subject["total_classes"]
                    ) * 100,
                    2
                )
            else:
                percentage = 0

            subject["attendance_percentage"] = percentage

            subjects.append(subject)

        # -----------------------------
        # Monthly History
        # -----------------------------

        history = []

        for record in attendance:

            if record.total_classes > 0:
                percentage = round(
                    (
                        (record.present + record.late)
                        / record.total_classes
                    ) * 100,
                    2
                )
            else:
                percentage = 0

            history.append({
                "id": record.id,
                "month": record.month,
                "year": record.year,
                "subject": record.subject.name,
                "subject_id": record.subject.id,
                "classroom": record.classroom.name,
                "classroom_id": record.classroom.id,
                "total_classes": record.total_classes,
                "present": record.present,
                "absent": record.absent,
                "late": record.late,
                "attendance_percentage": percentage,
            })

        return Response({
            "success": True,

            "month": month,
            "year": year,

            "summary": {
                "overall_attendance": overall_attendance,
                "total_classes": total_classes,
                "classes_attended": classes_attended,
                "classes_absent": classes_absent,
            },

            "subjects": subjects,

            "count": len(history),

            "attendance": history,
        })
      
class TeacherStudentListView(APIView):
    permission_classes = [IsTeacher]

    def get(self, request):
        User = get_user_model()

        students = User.objects.filter(
            groups__name="Student"
        ).distinct()

        data = []

        for student in students:
            data.append({
                "id": student.id,
                "username": student.username,
                "first_name": student.first_name,
                "last_name": student.last_name,
                "email": student.email,
            })

        return Response({
            "success": True,
            "count": len(data),
            "students": data
        })

    def put(self, request, student_id):
        User = get_user_model()

        try:
            student = User.objects.get(
                id=student_id,
                groups__name="Student"
            )
        except User.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "error": "Student not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        student.first_name = request.data.get(
            "first_name",
            student.first_name
        )

        student.last_name = request.data.get(
            "last_name",
            student.last_name
        )

        student.email = request.data.get(
            "email",
            student.email
        )

        student.save()

        return Response({
            "success": True,
            "message": "Student updated successfully.",
            "student": {
                "id": student.id,
                "username": student.username,
                "first_name": student.first_name,
                "last_name": student.last_name,
                "email": student.email,
            }
        })

class TeacherStudentDetailView(APIView):
    permission_classes = [IsTeacher]

    def get_student(self, student_id):
        User = get_user_model()

        try:
            return User.objects.get(
                id=student_id,
                groups__name="Student"
            )
        except User.DoesNotExist:
            return None

    def get(self, request, student_id):
        student = self.get_student(student_id)

        if not student:
            return Response(
                {
                    "success": False,
                    "error": "Student not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        return Response({
            "success": True,
            "student": {
                "id": student.id,
                "username": student.username,
                "first_name": student.first_name,
                "last_name": student.last_name,
                "email": student.email,
            }
        })

    def put(self, request, student_id):
        student = self.get_student(student_id)

        if not student:
            return Response(
                {
                    "success": False,
                    "error": "Student not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        student.first_name = request.data.get(
            "first_name",
            student.first_name
        )
        student.last_name = request.data.get(
            "last_name",
            student.last_name
        )
        student.email = request.data.get(
            "email",
            student.email
        )

        student.save()

        return Response({
            "success": True,
            "message": "Student updated successfully.",
            "student": {
                "id": student.id,
                "username": student.username,
                "first_name": student.first_name,
                "last_name": student.last_name,
                "email": student.email,
            }
        })   

class TeacherDashboardView(APIView):
    permission_classes = [IsTeacher]

    def get(self, request):
        teacher = request.user

        allocations = TeacherAllocation.objects.filter(
            teacher=teacher
        ).select_related("classroom", "subject")

        subjects = []
        classes = []

        for allocation in allocations:
            subjects.append({
                "id": allocation.subject.id,
                "name": allocation.subject.name,
                "code": allocation.subject.code,
            })

            classes.append({
                "id": allocation.classroom.id,
                "name": allocation.classroom.name,
                "semester": allocation.classroom.semester,
                "division": allocation.classroom.division,
            })

        students = StudentSubject.objects.filter(
            teacher=teacher
        ).values(
            "student_id",
            "student__username",
            "student__first_name",
            "student__last_name",
            "student__email",
        ).distinct()

        student_data = [
            {
                "id": student["student_id"],
                "username": student["student__username"],
                "first_name": student["student__first_name"],
                "last_name": student["student__last_name"],
                "email": student["student__email"],
            }
            for student in students
        ]

        return Response({
            "success": True,
            "teacher": {
                "id": teacher.id,
                "username": teacher.username,
                "first_name": teacher.first_name,
                "last_name": teacher.last_name,
                "email": teacher.email,
            },
            "subjects": subjects,
            "classes": classes,
            "students": student_data,
            "summary": {
                "total_subjects": len(subjects),
                "total_classes": len(classes),
                "total_students": len(student_data),
            }
        })             

class TeacherAttendanceView(APIView):
    permission_classes = [IsTeacher]

    def post(self, request):
        teacher = request.user

        classroom_id = request.data.get("classroom_id")
        subject_id = request.data.get("subject_id")
        date = request.data.get("date")
        attendance_data = request.data.get("attendance")

        # Validate required fields
        if not classroom_id or not subject_id or not date or not attendance_data:
            return Response(
                {
                    "success": False,
                    "error": "classroom_id, subject_id, date and attendance are required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check teacher allocation
        allocation = TeacherAllocation.objects.filter(
            teacher=teacher,
            classroom_id=classroom_id,
            subject_id=subject_id
        ).first()

        if not allocation:
            return Response(
                {
                    "success": False,
                    "error": "You are not allocated to this classroom and subject."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        saved_records = []

        for item in attendance_data:

            student_id = item.get("student_id")
            attendance_status = item.get("status")

            if not student_id or attendance_status not in [
                "Present",
                "Absent",
                "Late"
            ]:
                return Response(
                    {
                        "success": False,
                        "error": "Invalid student_id or attendance status."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check student belongs to this teacher + classroom + subject
            student_subject = StudentSubject.objects.filter(
                student_id=student_id,
                teacher=teacher,
                classroom_id=classroom_id,
                subject_id=subject_id
            ).first()

            if not student_subject:
                return Response(
                    {
                        "success": False,
                        "error": f"Student {student_id} is not assigned to you for this subject."
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

            # Create attendance
            record = Attendance.objects.create(
                student_id=student_id,
                subject_id=subject_id,
                classroom_id=classroom_id,
                date=date,
                status=attendance_status
            )

            saved_records.append({
                "id": record.id,
                "student_id": student_id,
                "status": attendance_status,
                "date": date
            })

        return Response(
            {
                "success": True,
                "message": "Attendance saved successfully.",
                "attendance": saved_records
            },
            status=status.HTTP_201_CREATED
        )        

class TeacherMonthlyAttendanceView(APIView):
    permission_classes = [IsTeacher]

    def post(self, request):
        teacher = request.user

        month = request.data.get("month")
        year = request.data.get("year")
        classroom_id = request.data.get("classroom_id")
        subject_id = request.data.get("subject_id")
        attendance_data = request.data.get("attendance")

        # Validate required fields
        if not all([
            month,
            year,
            classroom_id,
            subject_id,
            attendance_data
        ]):
            return Response(
                {
                    "success": False,
                    "error": (
                        "month, year, classroom_id, "
                        "subject_id and attendance are required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify teacher allocation
        allocation = TeacherAllocation.objects.filter(
            teacher=teacher,
            classroom_id=classroom_id,
            subject_id=subject_id
        ).first()

        if not allocation:
            return Response(
                {
                    "success": False,
                    "error": (
                        "You are not allocated to this "
                        "classroom and subject."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        saved_records = []

        for item in attendance_data:

            student_id = item.get("student_id")
            total_classes = item.get("total_classes")
            present = item.get("present")
            absent = item.get("absent")
            late = item.get("late", 0)

            # Validate student attendance data
            if (
                not student_id
                or total_classes is None
                or present is None
                or absent is None
            ):
                return Response(
                    {
                        "success": False,
                        "error": (
                            "student_id, total_classes, "
                            "present and absent are required."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate attendance numbers
            if (
                total_classes < 0
                or present < 0
                or absent < 0
                or late < 0
            ):
                return Response(
                    {
                        "success": False,
                        "error": "Attendance values cannot be negative."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check totals
            if present + absent + late != total_classes:
                return Response(
                    {
                        "success": False,
                        "error": (
                            f"Attendance total mismatch for "
                            f"student {student_id}. "
                            f"Present + Absent + Late must equal "
                            f"Total Classes."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Verify student assignment
            student_subject = StudentSubject.objects.filter(
                student_id=student_id,
                teacher=teacher,
                classroom_id=classroom_id,
                subject_id=subject_id
            ).first()

            if not student_subject:
                return Response(
                    {
                        "success": False,
                        "error": (
                            f"Student {student_id} is not assigned "
                            f"to you for this subject."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

            # Create or update monthly attendance
            record, created = MonthlyAttendance.objects.update_or_create(
                student_id=student_id,
                subject_id=subject_id,
                classroom_id=classroom_id,
                month=month,
                year=year,
                defaults={
                    "total_classes": total_classes,
                    "present": present,
                    "absent": absent,
                    "late": late,
                }
            )

            serializer = MonthlyAttendanceSerializer(record)

            saved_records.append(serializer.data)

        return Response(
            {
                "success": True,
                "message": "Monthly attendance saved successfully.",
                "attendance": saved_records
            },
            status=status.HTTP_200_OK
        )    
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import StudyHabit
from .serializers import StudyHabitSerializer


class StudyHabitView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        habits = StudyHabit.objects.filter(
            student=request.user
        ).order_by("-updated_at")

        serializer = StudyHabitSerializer(
            habits,
            many=True
        )

        return Response(serializer.data)


    def post(self, request):

        serializer = StudyHabitSerializer(
            data=request.data
        )

        if serializer.is_valid():

            subject = serializer.validated_data["subject"]

            habit, created = StudyHabit.objects.update_or_create(
                student=request.user,
                subject=subject,
                defaults=serializer.validated_data
            )

            return Response(
                StudyHabitSerializer(habit).data,
                status=(
                    status.HTTP_201_CREATED
                    if created
                    else status.HTTP_200_OK
                )
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import StudyHabit
from .services import generate_study_suggestions


class StudyHabitSuggestionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        GET only returns saved AI suggestions.
        It does NOT call Ollama.
        """

        habits = (
            StudyHabit.objects
            .filter(student=request.user)
            .select_related("subject")
            .order_by("-updated_at")
        )

        if not habits.exists():
            return Response(
                {
                    "error": "No study habits found. Please add your study habits first."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        suggestions = []

        for habit in habits:

            suggestion = habit.ai_suggestion

            if not suggestion:
                suggestion = {
                    "error": "AI suggestion has not been generated yet."
                }

            suggestions.append({
                "subject": habit.subject.name,
                "suggestion": suggestion
            })

        return Response({
            "student": request.user.username,
            "suggestions": suggestions
        })


class RefreshStudyHabitSuggestionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        POST generates fresh AI suggestions.
        This should be called after login.
        """

        habits = (
            StudyHabit.objects
            .filter(student=request.user)
            .select_related("subject")
        )

        if not habits.exists():
            return Response(
                {
                    "error": "No study habits found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        suggestions = []

        for habit in habits:

            ai_result = generate_study_suggestions(habit)

            habit.ai_suggestion = ai_result
            habit.save(
                update_fields=[
                    "ai_suggestion",
                    "ai_generated_at"
                ]
            )

            suggestions.append({
                "subject": habit.subject.name,
                "suggestion": ai_result
            })

        return Response({
            "student": request.user.username,
            "suggestions": suggestions,
            "message": "AI study suggestions regenerated successfully."
        })

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import PredictionHistory
from .serializers import AcademicPerformanceSerializer
from django.db.models import Avg


class AcademicPerformanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        predictions = (
            PredictionHistory.objects
            .filter(student=request.user)
            .order_by("subject", "-created_at")
        )

        serializer = AcademicPerformanceSerializer(
            predictions,
            many=True,
            context={"request": request}
        )

        return Response({
            "student": request.user.username,
            "records": serializer.data
        })

class PublicStatsView(APIView):

    permission_classes = []

    def get(self, request):

        User = get_user_model()

        total_students = User.objects.filter(
            groups__name="Student"
        ).distinct().count()

        predictions = PredictionHistory.objects.all()

        avg_performance = predictions.aggregate(
            avg=Avg("predicted_final_marks")
        )["avg"] or 0

        total_predictions = predictions.count()

        on_track_count = predictions.filter(
            performance_category__in=["Excellent", "Good"]
        ).count()

        at_risk_count = predictions.filter(
            performance_category__in=["Average", "Poor", "At Risk"]
        ).count()

        on_track_rate = (
            round((on_track_count / total_predictions) * 100, 1)
            if total_predictions > 0
            else 0
        )

        intervention_rate = (
            round((at_risk_count / total_predictions) * 100, 1)
            if total_predictions > 0
            else 0
        )

        attendance_qs = MonthlyAttendance.objects.all()

        total_classes = sum(r.total_classes for r in attendance_qs)
        classes_attended = sum(r.present + r.late for r in attendance_qs)

        attendance_rate = (
            round((classes_attended / total_classes) * 100, 1)
            if total_classes > 0
            else 0
        )

        return Response(
            {
                "accuracy": "94.8%",
                "factors": "8+",
                "students": f"{total_students}+",
                "interventionRate": f"{intervention_rate}%",
                "totalStudents": str(total_students),
                "avgPerformance": f"{round(avg_performance, 1)}%",
                "attendanceRate": f"{attendance_rate}%",
                "onTrackRate": f"{on_track_rate}%",
            },
            status=status.HTTP_200_OK
        )   

from rest_framework.permissions import AllowAny
class ClassRoomListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        classrooms = ClassRoom.objects.all()
        serializer = ClassRoomSerializer(classrooms, many=True)
        return Response(serializer.data)      