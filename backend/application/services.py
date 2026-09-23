import json
import requests

from .models import PredictionHistory, Attendance


import os

from .models import (
    PredictionHistory,
    Attendance,
    StudyHabit,
    StudentSubject,
    Subject
)

import os

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# Append the key parameter to the URL endpoint
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"

def generate_study_suggestions(study_habit):
    """
    Generate personalized study suggestions using:
    StudyHabit + PredictionHistory + Attendance
    """

    student = study_habit.student
    subject = study_habit.subject

    # --------------------------------------------------
    # 1. Get latest prediction history for this subject
    # --------------------------------------------------

    prediction = (
        PredictionHistory.objects
        .filter(
            student=student,
            subject__iexact=subject.name
        )
        .order_by("-created_at")
        .first()
    )

    # --------------------------------------------------
    # 2. Get attendance records for this subject
    # --------------------------------------------------

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

    # --------------------------------------------------
    # 3. Prediction data
    # --------------------------------------------------

    if prediction:
        predicted_marks = prediction.predicted_final_marks
        performance_category = prediction.performance_category
        assignment_completion = (
            prediction.assignment_completion_percentage
        )
        internal_marks = prediction.internal_marks
        midterm_marks = prediction.midterm_marks
        previous_sgpa = prediction.previous_semester_sgpa
    else:
        predicted_marks = None
        performance_category = None
        assignment_completion = None
        internal_marks = None
        midterm_marks = None
        previous_sgpa = None

    # --------------------------------------------------
    # 4. Build prompt
    # --------------------------------------------------

    prompt = f"""
You are an AI study advisor for a college student.

Analyze the student's study habits, attendance,
academic performance, and prediction data.

Create personalized and practical study recommendations.

STUDENT INFORMATION
-------------------

Subject: {subject.name}

STUDY HABITS
Study hours per day: {study_habit.study_hours_per_day}
Preferred study time: {study_habit.preferred_study_time}
Study method: {study_habit.study_method}
Distractions: {study_habit.distractions}
Sleep hours: {study_habit.sleep_hours}
Notes: {study_habit.notes}

ATTENDANCE
Total classes: {total_classes}
Present: {present}
Absent: {absent}
Late: {late}
Attendance percentage: {attendance_percentage}

ACADEMIC PERFORMANCE
Predicted final marks: {predicted_marks}
Performance category: {performance_category}
Assignment completion: {assignment_completion}
Internal marks: {internal_marks}
Midterm marks: {midterm_marks}
Previous semester SGPA: {previous_sgpa}

Based on all this information, identify the student's
strengths, weaknesses, and areas that need improvement.

Return ONLY valid JSON.

Use exactly this structure:

{{
    "overall_analysis": "Short analysis of the student's current situation",

    "strengths": [
        "strength 1",
        "strength 2"
    ],

    "weaknesses": [
        "weakness 1",
        "weakness 2"
    ],

    "daily_plan": [
        {{
            "time": "6:00 PM - 7:00 PM",
            "activity": "Python practice"
        }},
        {{
            "time": "7:15 PM - 8:00 PM",
            "activity": "Revision"
        }}
    ],

    "subject_suggestions": [
        "subject specific suggestion 1",
        "subject specific suggestion 2"
    ],

    "concentration_tips": [
        "tip 1",
        "tip 2"
    ],

    "focus_level": "High"
}}

Rules:
- Keep suggestions practical.
- Consider attendance and academic performance.
- Consider the student's study habits.
- Give subject-specific recommendations.
- Do not give medical advice.
- Do not include Markdown.
- Return JSON only.
"""
    
    # --------------------------------------------------
    # 5. Send request to Gemini
    # --------------------------------------------------

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
    }

    try:
        response = requests.post(
            GEMINI_URL,
            headers=headers,
            json=payload,
            timeout=120
        )

        response.raise_for_status()

        data = response.json()

        ai_response = (
            data["candidates"][0]["content"]["parts"][0]["text"]
            .strip()
        )

        # --------------------------------------------------
        # 6. Convert JSON string to Python dictionary
        # --------------------------------------------------

        return json.loads(ai_response)

    except requests.exceptions.ConnectionError:
        return {
            "error": "Unable to connect to Gemini API."
        }

    except requests.exceptions.Timeout:
        return {
            "error": "The AI model took too long to respond."
        }

    except json.JSONDecodeError:
        return {
            "error": "The AI returned an invalid JSON response.",
            "raw_response": ai_response
        }

    except requests.exceptions.RequestException as e:
        return {
            "error": f"Unable to generate study suggestions: {str(e)}"
        }
def generate_initial_study_habits(student):
    """
    Use Gemini to automatically create personalized
    study habits based on the student's prediction history.
    """

    # Get student's prediction history
    predictions = (
        PredictionHistory.objects
        .filter(student=student)
        .order_by("-created_at")
    )

    if not predictions.exists():
        raise ValueError(
            "No prediction data found. Please make a prediction first."
        )

    # Get subjects directly from prediction history
    subject_names = []

    for prediction in predictions:
        subject = prediction.subject

        # Support both a Subject object and a string subject field
        if hasattr(subject, "name"):
            subject_name = subject.name
        else:
            subject_name = str(subject)

        if subject_name and subject_name not in subject_names:
            subject_names.append(subject_name)

    if not subject_names:
        raise ValueError(
            "No subjects found in prediction history."
        )

    # Prepare academic information
    academic_data = []

    for prediction in predictions:
        subject = prediction.subject

        if hasattr(subject, "name"):
            subject_name = subject.name
        else:
            subject_name = str(subject)

        academic_data.append({
            "subject": subject_name,
            "predicted_final_marks": prediction.predicted_final_marks,
            "performance_category": prediction.performance_category,
            "attendance_percentage": prediction.attendance_percentage,
            "study_hours_per_day": prediction.study_hours_per_day,
            "assignment_completion_percentage": (
                prediction.assignment_completion_percentage
            ),
            "internal_marks": prediction.internal_marks,
            "midterm_marks": prediction.midterm_marks,
            "previous_semester_sgpa": (
                prediction.previous_semester_sgpa
            ),
        })

    prompt = f"""
You are an AI study planner for a college student.

Create personalized study habits for this student.

STUDENT:
{student.username}

SUBJECTS:
{json.dumps(subject_names)}

ACADEMIC PERFORMANCE:
{json.dumps(academic_data, default=str)}

For every subject, create a practical study habit.

The study habit must contain:

- subject
- study_hours_per_day
- preferred_study_time
- study_method
- distractions
- sleep_hours
- notes

Consider:
- predicted marks
- performance category
- attendance
- current study hours
- assignment completion
- internal marks
- midterm marks
- previous semester SGPA

Give more study time to subjects where the student
needs more improvement.

Do not give medical advice.

Return ONLY valid JSON.

Use exactly this format:

{{
    "study_habits": [
        {{
            "subject": "Python Programming",
            "study_hours_per_day": 2.0,
            "preferred_study_time": "6:00 PM - 8:00 PM",
            "study_method": "Practice coding and solve problems",
            "distractions": "Mobile phone and social media",
            "sleep_hours": 7.0,
            "notes": "Focus on Python fundamentals and practical coding."
        }}
    ]
}}
"""

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }

    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
    }

    try:
        response = requests.post(
            GEMINI_URL,
            headers=headers,
            json=payload,
            timeout=120
        )

        response.raise_for_status()

        data = response.json()

        ai_response = (
            data["candidates"][0]["content"]["parts"][0]["text"]
            .strip()
        )

        result = json.loads(ai_response)

    except requests.exceptions.Timeout:
        raise ValueError(
            "Gemini request timed out."
        )

    except requests.exceptions.RequestException as e:
        raise ValueError(
            f"Gemini request failed: {str(e)}"
        )

    except (KeyError, IndexError, json.JSONDecodeError):
        raise ValueError(
            "Gemini returned an invalid response."
        )

    # Save generated habits
    created_habits = []

    for habit_data in result.get("study_habits", []):

        subject_name = habit_data.get("subject")

        if not subject_name:
            continue

        # Find the Django Subject using the name
        subject = Subject.objects.filter(
            name__iexact=subject_name
        ).first()

        if not subject:
            continue

        habit, created = StudyHabit.objects.update_or_create(
            student=student,
            subject=subject,
            defaults={
                "study_hours_per_day": habit_data.get(
                    "study_hours_per_day",
                    1.0
                ),
                "preferred_study_time": habit_data.get(
                    "preferred_study_time"
                ),
                "study_method": habit_data.get(
                    "study_method"
                ),
                "distractions": habit_data.get(
                    "distractions"
                ),
                "sleep_hours": habit_data.get(
                    "sleep_hours"
                ),
                "notes": habit_data.get(
                    "notes"
                ),
            }
        )

        created_habits.append(habit)

    return created_habits