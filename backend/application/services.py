import json
from pathlib import Path

from .models import (
    PredictionHistory,
    Attendance,
    StudyHabit,
    Subject,
)


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def get_prediction_subject_name(prediction):
    """
    Safely get the subject name from PredictionHistory.

    Supports both:
    - Subject object
    - String subject
    """

    subject = prediction.subject

    if hasattr(subject, "name"):
        return subject.name

    return str(subject)


def get_latest_prediction(student, subject_name):
    """
    Get the latest prediction for a student and subject.
    """

    predictions = PredictionHistory.objects.filter(
        student=student
    ).order_by("-created_at")

    for prediction in predictions:
        prediction_subject = get_prediction_subject_name(prediction)

        if prediction_subject.lower() == subject_name.lower():
            return prediction

    return None


def get_attendance_data(student, subject):
    """
    Calculate attendance information for a subject.
    """

    attendance_records = Attendance.objects.filter(
        student=student,
        subject=subject
    )

    total_classes = attendance_records.count()

    present = attendance_records.filter(
        status="Present"
    ).count()

    absent = attendance_records.filter(
        status="Absent"
    ).count()

    late = attendance_records.filter(
        status="Late"
    ).count()

    if total_classes > 0:
        attendance_percentage = round(
            (present / total_classes) * 100,
            2
        )
    else:
        attendance_percentage = None

    return {
        "total_classes": total_classes,
        "present": present,
        "absent": absent,
        "late": late,
        "attendance_percentage": attendance_percentage,
    }


# ============================================================
# STUDY SUGGESTION GENERATOR
# ============================================================

def generate_study_suggestions(study_habit):
    """
    Generate personalized study suggestions without Gemini.

    Uses:
    - StudyHabit
    - PredictionHistory
    - Attendance
    """

    student = study_habit.student
    subject = study_habit.subject

    # --------------------------------------------------------
    # 1. Get latest prediction
    # --------------------------------------------------------

    prediction = get_latest_prediction(
        student,
        subject.name
    )

    # --------------------------------------------------------
    # 2. Get attendance
    # --------------------------------------------------------

    attendance = get_attendance_data(
        student,
        subject
    )

    total_classes = attendance["total_classes"]
    present = attendance["present"]
    absent = attendance["absent"]
    late = attendance["late"]
    attendance_percentage = attendance["attendance_percentage"]

    # --------------------------------------------------------
    # 3. Default academic values
    # --------------------------------------------------------

    predicted_marks = None
    performance_category = None
    assignment_completion = None
    internal_marks = None
    midterm_marks = None
    previous_sgpa = None

    if prediction:

        predicted_marks = prediction.predicted_final_marks
        performance_category = prediction.performance_category

        assignment_completion = (
            prediction.assignment_completion_percentage
        )

        internal_marks = prediction.internal_marks
        midterm_marks = prediction.midterm_marks
        previous_sgpa = prediction.previous_semester_sgpa

    # --------------------------------------------------------
    # 4. Create analysis
    # --------------------------------------------------------

    strengths = []
    weaknesses = []
    subject_suggestions = []
    concentration_tips = []

    # ========================================================
    # ATTENDANCE ANALYSIS
    # ========================================================

    if attendance_percentage is not None:

        if attendance_percentage >= 85:
            strengths.append(
                f"Good attendance with {attendance_percentage}% attendance."
            )

        elif attendance_percentage >= 75:
            strengths.append(
                f"Attendance is acceptable at {attendance_percentage}%."
            )

        else:
            weaknesses.append(
                f"Attendance is low at {attendance_percentage}%."
            )

            subject_suggestions.append(
                "Attend classes regularly to avoid missing important concepts."
            )

            if attendance_percentage < 60:
                subject_suggestions.append(
                    "Give immediate priority to improving class attendance."
                )

    # ========================================================
    # STUDY HOURS ANALYSIS
    # ========================================================

    study_hours = study_habit.study_hours_per_day

    if study_hours is not None:

        if study_hours >= 3:
            strengths.append(
                f"Good study commitment of {study_hours} hours per day."
            )

        elif study_hours >= 2:
            strengths.append(
                f"Maintaining around {study_hours} hours of daily study."
            )

        else:
            weaknesses.append(
                "Daily study time is relatively low."
            )

            subject_suggestions.append(
                "Try to gradually increase focused study time."
            )

    # ========================================================
    # PREDICTED MARKS ANALYSIS
    # ========================================================

    if predicted_marks is not None:

        try:
            marks = float(predicted_marks)
        except (TypeError, ValueError):
            marks = None

        if marks is not None:

            if marks >= 80:
                strengths.append(
                    f"Predicted performance is strong at {marks} marks."
                )

                subject_suggestions.append(
                    "Continue regular practice and focus on advanced problems."
                )

            elif marks >= 60:
                strengths.append(
                    f"Predicted performance is moderate at {marks} marks."
                )

                subject_suggestions.append(
                    "Focus on revision and solving more practice questions."
                )

            else:
                weaknesses.append(
                    f"Predicted marks are relatively low at {marks}."
                )

                subject_suggestions.append(
                    "Increase subject practice and revise important concepts regularly."
                )

    # ========================================================
    # PERFORMANCE CATEGORY
    # ========================================================

    if performance_category:

        category = str(performance_category).lower()

        if any(
            word in category
            for word in ["excellent", "high", "good"]
        ):
            strengths.append(
                f"Performance category: {performance_category}."
            )

        elif any(
            word in category
            for word in ["poor", "low", "weak", "at risk"]
        ):
            weaknesses.append(
                f"Performance category indicates improvement is needed: "
                f"{performance_category}."
            )

    # ========================================================
    # ASSIGNMENT ANALYSIS
    # ========================================================

    if assignment_completion is not None:

        try:
            completion = float(assignment_completion)
        except (TypeError, ValueError):
            completion = None

        if completion is not None:

            if completion >= 90:
                strengths.append(
                    f"Strong assignment completion at {completion}%."
                )

            elif completion >= 70:
                subject_suggestions.append(
                    "Keep assignment completion consistent."
                )

            else:
                weaknesses.append(
                    f"Assignment completion is low at {completion}%."
                )

                subject_suggestions.append(
                    "Complete pending assignments before starting new topics."
                )

    # ========================================================
    # INTERNAL MARKS
    # ========================================================

    if internal_marks is not None:

        try:
            internal = float(internal_marks)
        except (TypeError, ValueError):
            internal = None

        if internal is not None:

            if internal >= 75:
                strengths.append(
                    "Internal assessment performance is strong."
                )

            elif internal < 50:
                weaknesses.append(
                    "Internal assessment marks need improvement."
                )

                subject_suggestions.append(
                    "Revise internal assessment topics and practice previous questions."
                )

    # ========================================================
    # MIDTERM MARKS
    # ========================================================

    if midterm_marks is not None:

        try:
            midterm = float(midterm_marks)
        except (TypeError, ValueError):
            midterm = None

        if midterm is not None:

            if midterm >= 75:
                strengths.append(
                    "Midterm performance is strong."
                )

            elif midterm < 50:
                weaknesses.append(
                    "Midterm performance needs improvement."
                )

                subject_suggestions.append(
                    "Review mistakes from the midterm and practice weak topics."
                )

    # ========================================================
    # STUDY METHOD
    # ========================================================

    if study_habit.study_method:

        subject_suggestions.append(
            f"Continue using your study method: "
            f"{study_habit.study_method}."
        )

    # ========================================================
    # DISTRACTIONS
    # ========================================================

    if study_habit.distractions:

        concentration_tips.append(
            f"Reduce distractions such as {study_habit.distractions}."
        )

    concentration_tips.extend([
        "Keep your phone away during focused study sessions.",
        "Study in focused sessions with short breaks.",
        "Review important concepts before starting new topics.",
    ])

    # ========================================================
    # SLEEP
    # ========================================================

    sleep_hours = study_habit.sleep_hours

    if sleep_hours is not None:

        try:
            sleep = float(sleep_hours)
        except (TypeError, ValueError):
            sleep = None

        if sleep is not None and sleep < 6:
            concentration_tips.append(
                "Maintain a consistent study schedule and avoid studying very late at night."
            )

    # ========================================================
    # DAILY PLAN
    # ========================================================

    try:
        daily_hours = float(study_hours or 1)
    except (TypeError, ValueError):
        daily_hours = 1

    if daily_hours < 1:
        daily_hours = 1

    if daily_hours >= 3:
        first_session = "1 hour"
        second_session = "1 hour"
        third_session = "1 hour"
    elif daily_hours >= 2:
        first_session = "1 hour"
        second_session = "1 hour"
        third_session = None
    else:
        first_session = "45 minutes"
        second_session = "30 minutes"
        third_session = None

    daily_plan = [
        {
            "time": "First Study Session",
            "activity": (
                f"{first_session} focused study of {subject.name}"
            ),
        },
        {
            "time": "Second Study Session",
            "activity": (
                f"{second_session} revision and practice"
            ),
        },
    ]

    if third_session:
        daily_plan.append({
            "time": "Third Study Session",
            "activity": (
                f"{third_session} problem solving or assignment work"
            ),
        })

    # ========================================================
    # FOCUS LEVEL
    # ========================================================

    focus_level = "Medium"

    if (
        attendance_percentage is not None
        and attendance_percentage < 60
    ):
        focus_level = "High"

    if (
        predicted_marks is not None
        and assignment_completion is not None
    ):
        try:
            marks_value = float(predicted_marks)
            assignment_value = float(assignment_completion)

            if marks_value < 50 or assignment_value < 50:
                focus_level = "High"

        except (TypeError, ValueError):
            pass

    # ========================================================
    # OVERALL ANALYSIS
    # ========================================================

    if not strengths:
        strengths.append(
            "The student has started tracking study habits."
        )

    if not weaknesses:
        weaknesses.append(
            "Continue monitoring academic performance for areas that need improvement."
        )

    if not subject_suggestions:
        subject_suggestions.append(
            f"Continue regular study and practice for {subject.name}."
        )

    overall_analysis = (
        f"For {subject.name}, the current focus level is {focus_level}. "
        f"The recommendation is based on the student's study habits, "
        f"attendance, and available academic performance data."
    )

    # ========================================================
    # RETURN SAME JSON STRUCTURE
    # ========================================================

    return {
        "overall_analysis": overall_analysis,

        "strengths": strengths[:5],

        "weaknesses": weaknesses[:5],

        "daily_plan": daily_plan,

        "subject_suggestions": subject_suggestions[:6],

        "concentration_tips": concentration_tips[:5],

        "focus_level": focus_level,
    }


# ============================================================
# INITIAL STUDY HABITS
# ============================================================

def generate_initial_study_habits(student):
    """
    Automatically create initial study habits using
    the student's prediction history.

    No external AI API is required.
    """

    predictions = (
        PredictionHistory.objects
        .filter(student=student)
        .order_by("-created_at")
    )

    if not predictions.exists():
        raise ValueError(
            "No prediction data found. Please make a prediction first."
        )

    # --------------------------------------------------------
    # Get unique subjects
    # --------------------------------------------------------

    subject_names = []

    for prediction in predictions:

        subject_name = get_prediction_subject_name(
            prediction
        )

        if (
            subject_name
            and subject_name not in subject_names
        ):
            subject_names.append(subject_name)

    if not subject_names:
        raise ValueError(
            "No subjects found in prediction history."
        )

    created_habits = []

    # --------------------------------------------------------
    # Create habit for every subject
    # --------------------------------------------------------

    for subject_name in subject_names:

        subject = Subject.objects.filter(
            name__iexact=subject_name
        ).first()

        if not subject:
            continue

        # ----------------------------------------------------
        # Latest prediction for subject
        # ----------------------------------------------------

        prediction = get_latest_prediction(
            student,
            subject_name
        )

        # ----------------------------------------------------
        # Default values
        # ----------------------------------------------------

        study_hours = 1.5

        preferred_time = "6:00 PM - 7:30 PM"

        study_method = (
            "Review concepts, practice questions, "
            "and solve subject-related problems."
        )

        distractions = (
            "Mobile phone and social media"
        )

        sleep_hours = 7.0

        notes = (
            f"Maintain regular study practice for {subject_name}."
        )

        # ----------------------------------------------------
        # Adjust based on prediction
        # ----------------------------------------------------

        if prediction:

            predicted_marks = prediction.predicted_final_marks
            performance_category = (
                prediction.performance_category
            )

            assignment_completion = (
                prediction.assignment_completion_percentage
            )

            try:
                marks = float(predicted_marks)
            except (TypeError, ValueError):
                marks = None

            try:
                assignments = float(
                    assignment_completion
                )
            except (TypeError, ValueError):
                assignments = None

            category = str(
                performance_category or ""
            ).lower()

            # -----------------------------------------------
            # High improvement requirement
            # -----------------------------------------------

            needs_improvement = False

            if marks is not None and marks < 60:
                needs_improvement = True

            if assignments is not None and assignments < 70:
                needs_improvement = True

            if any(
                word in category
                for word in [
                    "poor",
                    "low",
                    "weak",
                    "at risk"
                ]
            ):
                needs_improvement = True

            if needs_improvement:

                study_hours = 2.5

                preferred_time = "6:00 PM - 8:30 PM"

                study_method = (
                    "Focus on weak concepts, revise theory, "
                    "solve practice questions, and review mistakes."
                )

                notes = (
                    f"Give additional study time to {subject_name} "
                    "because the available academic data indicates "
                    "that improvement may be needed."
                )

            # -----------------------------------------------
            # Good performance
            # -----------------------------------------------

            elif marks is not None and marks >= 80:

                study_hours = 1.5

                study_method = (
                    "Practice advanced questions, revise concepts, "
                    "and maintain consistent performance."
                )

                notes = (
                    f"Maintain your current performance in "
                    f"{subject_name} and continue regular practice."
                )

            # -----------------------------------------------
            # Average performance
            # -----------------------------------------------

            else:

                study_hours = 2.0

                study_method = (
                    "Revise important concepts and solve "
                    "regular practice questions."
                )

                notes = (
                    f"Focus on consistent improvement in "
                    f"{subject_name}."
                )

        # ----------------------------------------------------
        # Save habit
        # ----------------------------------------------------

        habit, created = StudyHabit.objects.update_or_create(
            student=student,
            subject=subject,

            defaults={
                "study_hours_per_day": study_hours,

                "preferred_study_time": preferred_time,

                "study_method": study_method,

                "distractions": distractions,

                "sleep_hours": sleep_hours,

                "notes": notes,
            }
        )

        created_habits.append(habit)

    return created_habits


# ============================================================
# JSON STUDY HABITS
# ============================================================

def get_json_study_habits(student):
    """
    Get study habits from the temporary JSON file.
    """

    json_file = (
        Path(__file__).resolve().parent
        / "data"
        / "study_habits.json"
    )

    if not json_file.exists():
        raise ValueError(
            "Study habits JSON file not found."
        )

    try:

        with open(
            json_file,
            "r",
            encoding="utf-8"
        ) as file:

            data = json.load(file)

    except json.JSONDecodeError:

        raise ValueError(
            "Study habits JSON file contains invalid JSON."
        )

    username = student.username

    student_data = (
        data.get("students", {})
        .get(username)
    )

    if not student_data:

        raise ValueError(
            f"No study habits found for student '{username}'."
        )

    return student_data.get(
        "study_habits",
        []
    )