import os
import joblib
import pandas as pd


BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "student_performance_model.pkl"
)


model = joblib.load(MODEL_PATH)


def predict_student_performance(data):

    required_features = [

        "age",
        "gender",
        "category",
        "semester",
        "subject",

        "attendance_percentage",
        "study_hours_per_day",
        "assignment_completion_percentage",

        "internal_marks",
        "midterm_marks",

        "previous_semester_sgpa"
    ]

    # Check missing fields
    missing_features = [
        feature
        for feature in required_features
        if feature not in data
    ]

    if missing_features:

        raise ValueError(
            f"Missing required features: "
            f"{missing_features}"
        )

    # Create DataFrame
    input_data = pd.DataFrame([
        {
            feature: data[feature]
            for feature in required_features
        }
    ])

    # Prediction
    prediction = model.predict(input_data)[0]

    # Keep prediction between 0 and 100
    prediction = max(
        0,
        min(
            100,
            float(prediction)
        )
    )

    # Performance category
    if prediction >= 80:

        performance_category = "Excellent"

    elif prediction >= 60:

        performance_category = "Good"

    elif prediction >= 40:

        performance_category = "Average"

    else:

        performance_category = "Needs Improvement"

    return {

        "predicted_final_marks": round(
            prediction,
            2
        ),

        "performance_category":
            performance_category
    }