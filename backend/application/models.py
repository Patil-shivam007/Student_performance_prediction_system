from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class StudentProfile(models.Model):
    user = models.OneToOneField(User,on_delete=models.CASCADE,
    related_name='student_profile')
    phone = models.CharField(max_length=15)
    date_of_birth = models.DateField(null=True,blank=True)
    GENDER_CHOICES = [
        ('Male','Male'),
        ('Female','Female'),
        ('Other','Other'),
    ]

    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES,
        null=True,
        blank=True
    )
    student_class  = models.CharField(max_length=50)
    division = models.CharField(max_length=10)
    roll_number = models.PositiveBigIntegerField()

    def __str__(self):
        return self.user.username

from django.db import models
from django.conf import settings


class PredictionHistory(models.Model):

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="prediction_history"
    )

    subject = models.CharField(max_length=100)

    predicted_final_marks = models.FloatField()

    performance_category = models.CharField(max_length=50)

    attendance_percentage = models.FloatField()
    study_hours_per_day = models.FloatField()
    assignment_completion_percentage = models.FloatField()
    internal_marks = models.FloatField()
    midterm_marks = models.FloatField()
    previous_semester_sgpa = models.FloatField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student} - {self.subject} - {self.predicted_final_marks}" 
from django.db import models
from django.conf import settings


class ClassRoom(models.Model):
    name = models.CharField(max_length=100)
    semester = models.PositiveIntegerField()
    division = models.CharField(max_length=10)

    def __str__(self):
        return f"{self.name} - Semester {self.semester} - Division {self.division}"


class Subject(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return f"{self.name} ({self.code})"


class TeacherAllocation(models.Model):
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="teacher_allocations"
    )

    classroom = models.ForeignKey(
        ClassRoom,
        on_delete=models.CASCADE,
        related_name="teacher_allocations"
    )

    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name="teacher_allocations"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("teacher", "classroom", "subject")

    def __str__(self):
        return (
            f"{self.teacher.username} - "
            f"{self.classroom} - "
            f"{self.subject.name}"
        )

class StudentSubject(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_subjects"
    )

    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name="student_subjects"
    )

    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="assigned_student_subjects"
    )

    classroom = models.ForeignKey(
        ClassRoom,
        on_delete=models.CASCADE,
        related_name="student_subjects"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "subject")

    def __str__(self):
        return (
            f"{self.student.username} - "
            f"{self.subject.name} - "
            f"{self.teacher.username}"
        )   
         
class Attendance(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="attendance_records"
    )

    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name="attendance_records",
        null=True,
        blank=True
    )

    classroom = models.ForeignKey(
        ClassRoom,
        on_delete=models.CASCADE,
        related_name="attendance_records",
        null=True,
        blank=True
    )

    date = models.DateField(
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=10,
        choices=[
            ("Present", "Present"),
            ("Absent", "Absent"),
            ("Late", "Late"),
        ],
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (
            f"{self.student.username} - "
            f"{self.subject.name} - "
            f"{self.date} - "
            f"{self.status}"
        )

class Assignment(models.Model):
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="assignments_created"
    )

    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name="assignments"
    )

    classroom = models.ForeignKey(
        ClassRoom,
        on_delete=models.CASCADE,
        related_name="assignments"
    )

    title = models.CharField(max_length=200)

    description = models.TextField()

    due_date = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.subject.name}"    


class MonthlyAttendance(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="monthly_attendance"
    )
    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name="monthly_attendance"
    )
    classroom = models.ForeignKey(
        ClassRoom,
        on_delete=models.CASCADE,
        related_name="monthly_attendance"
    )

    month = models.PositiveIntegerField()
    year = models.PositiveIntegerField()

    total_classes = models.PositiveIntegerField()
    present = models.PositiveIntegerField()
    absent = models.PositiveIntegerField()
    late = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("student", "subject", "classroom", "month", "year")

    def __str__(self):
        return (
            f"{self.student.username} - "
            f"{self.subject.name} - "
            f"{self.month}/{self.year}"
        )
class StudyHabit(models.Model):

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="study_habits"
    )

    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name="study_habits"
    )

    study_hours_per_day = models.FloatField()

    preferred_study_time = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    study_method = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    distractions = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    sleep_hours = models.FloatField(
        null=True,
        blank=True
    )

    notes = models.TextField(
        blank=True,
        null=True
    )

    ai_suggestion = models.JSONField(
        default=dict,
        blank=True
    )

    ai_generated_at = models.DateTimeField(
        null=True,
        blank=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        unique_together = ("student", "subject")

    def __str__(self):
        return f"{self.student.username} - {self.subject.name}"    