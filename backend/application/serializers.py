from django.contrib.auth.models import User
from rest_framework import serializers
from .models import StudentProfile
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework import serializers

from .models import (
    StudentProfile,
    ClassRoom,
    Subject,
    TeacherAllocation,
    StudentSubject,
    MonthlyAttendance,
    Assignment
)

User = get_user_model()

class StudentRegistrationSerializer(serializers.ModelSerializer):

    username = serializers.CharField(write_only=True)

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    email = serializers.EmailField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()

    # New fields
    classroom_id = serializers.IntegerField(
        write_only=True
    )

    subject_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True
    )

    class Meta:
        model = StudentProfile

        fields = [
            'username',
            'password',
            'email',
            'first_name',
            'last_name',
            'phone',
            'date_of_birth',
            'gender',
            'student_class',
            'division',
            'roll_number',

            # New
            'classroom_id',
            'subject_ids',
        ]

    def create(self, validated_data):

        # Remove registration data
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        email = validated_data.pop('email')
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')

        # Remove new fields
        classroom_id = validated_data.pop('classroom_id')
        subject_ids = validated_data.pop('subject_ids')

        # Get classroom
        try:
            classroom = ClassRoom.objects.get(
                id=classroom_id
            )
        except ClassRoom.DoesNotExist:
            raise serializers.ValidationError({
                "classroom_id": "Invalid classroom."
            })

        # Create user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        # Add Student group
        student_group = Group.objects.get(
            name="Student"
        )

        user.groups.add(student_group)

        # Create student profile
        student = StudentProfile.objects.create(
            user=user,
            **validated_data
        )

        # Create StudentSubject records
        for subject_id in subject_ids:

            try:
                subject = Subject.objects.get(
                    id=subject_id
                )
            except Subject.DoesNotExist:
                raise serializers.ValidationError({
                    "subject_ids":
                    f"Subject with id {subject_id} does not exist."
                })

            # Find teacher allocated to this
            # class + subject
            allocation = TeacherAllocation.objects.filter(
                classroom=classroom,
                subject=subject
            ).first()

            if not allocation:
                raise serializers.ValidationError({
                    "subject_ids":
                    f"No teacher is allocated for {subject.name} "
                    f"in this class."
                })

            StudentSubject.objects.create(
                student=user,
                classroom=classroom,
                subject=subject,
                teacher=allocation.teacher
            )

        return student
from rest_framework import serializers
from .models import StudentProfile


class StudentProfileSerializer(serializers.ModelSerializer):

    # User fields
    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    first_name = serializers.CharField(
        source="user.first_name",
        read_only=True
    )

    last_name = serializers.CharField(
        source="user.last_name",
        read_only=True
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True
    )

    class Meta:
        model = StudentProfile

        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
            "phone",
            "date_of_birth",
            "gender",
            "student_class",
            "division",
            "roll_number",
        ]

from rest_framework import serializers


class AssignmentSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(
        source="teacher.username",
        read_only=True
    )

    subject_name = serializers.CharField(
        source="subject.name",
        read_only=True
    )

    classroom_name = serializers.CharField(
        source="classroom.name",
        read_only=True
    )

    class Meta:
        model = Assignment
        fields = [
            "id",
            "teacher",
            "teacher_name",
            "subject",
            "subject_name",
            "classroom",
            "classroom_name",
            "title",
            "description",
            "due_date",
            "created_at",
        ]

        read_only_fields = [
            "teacher",
            "created_at",
        ]        

from rest_framework import serializers
from .models import Assignment


class StudentAssignmentSerializer(serializers.ModelSerializer):
    subject = serializers.CharField(
        source="subject.name",
        read_only=True
    )

    teacher = serializers.CharField(
        source="teacher.username",
        read_only=True
    )

    class Meta:
        model = Assignment
        fields = [
            "id",
            "title",
            "description",
            "subject",
            "due_date",
            "teacher",
        ]        



class MonthlyAttendanceSerializer(serializers.ModelSerializer):

    student_name = serializers.CharField(
        source="student.username",
        read_only=True
    )

    subject_name = serializers.CharField(
        source="subject.name",
        read_only=True
    )

    classroom_name = serializers.CharField(
        source="classroom.name",
        read_only=True
    )

    attendance_percentage = serializers.SerializerMethodField()

    class Meta:
        model = MonthlyAttendance

        fields = [
            "id",
            "student",
            "student_name",
            "subject",
            "subject_name",
            "classroom",
            "classroom_name",
            "month",
            "year",
            "total_classes",
            "present",
            "absent",
            "late",
            "attendance_percentage",
            "created_at",
        ]

        read_only_fields = [
            "created_at",
            "attendance_percentage",
        ]

    def get_attendance_percentage(self, obj):
        if obj.total_classes == 0:
            return 0

        return round(
            ((obj.present + obj.late) / obj.total_classes) * 100,
            2
        )
from rest_framework import serializers
from .models import StudyHabit


class StudyHabitSerializer(serializers.ModelSerializer):

    subject_name = serializers.CharField(
        source="subject.name",
        read_only=True
    )

    class Meta:
        model = StudyHabit
        fields = [
            "id",
            "subject",
            "subject_name",
            "study_hours_per_day",
            "preferred_study_time",
            "study_method",
            "distractions",
            "sleep_hours",
            "notes",
            "updated_at"
        ]
        read_only_fields = [
            "id",
            "updated_at"
        ] 
from rest_framework import serializers
from .models import PredictionHistory, Attendance
           
class AcademicPerformanceSerializer(serializers.ModelSerializer):
    average_marks = serializers.SerializerMethodField()
    attendance_percentage = serializers.SerializerMethodField()

    class Meta:
        model = PredictionHistory
        fields = [
            "id",
            "subject",
            "internal_marks",
            "midterm_marks",
            "predicted_final_marks",
            "performance_category",
            "assignment_completion_percentage",
            "previous_semester_sgpa",
            "attendance_percentage",
            "average_marks",
            "created_at",
        ]

    def get_average_marks(self, obj):
        marks = []

        if obj.internal_marks is not None:
            marks.append(obj.internal_marks)

        if obj.midterm_marks is not None:
            marks.append(obj.midterm_marks)

        if obj.predicted_final_marks is not None:
            marks.append(obj.predicted_final_marks)

        if not marks:
            return 0

        return round(sum(marks) / len(marks), 2)

    def get_attendance_percentage(self, obj):
        request = self.context.get("request")

        if not request:
            return obj.attendance_percentage

        records = Attendance.objects.filter(
            student=request.user,
            subject__name__iexact=obj.subject
        )

        total = records.count()

        if total == 0:
            return obj.attendance_percentage

        present = records.filter(
            status="Present"
        ).count()

        return round((present / total) * 100, 2)        