import json
import requests

from .models import PredictionHistory, Attendance


OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3.2:1b"


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
    # 5. Send request to Ollama
    # --------------------------------------------------

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "format": "json"
    }

    try:
        response = requests.post(
            OLLAMA_URL,
            json=payload,
            timeout=120
        )

        response.raise_for_status()

        data = response.json()

        ai_response = data.get("response", "").strip()

        # --------------------------------------------------
        # 6. Convert JSON string to Python dictionary
        # --------------------------------------------------

        return json.loads(ai_response)

    except requests.exceptions.ConnectionError:
        return {
            "error": "Ollama is not running. Please start Ollama."
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