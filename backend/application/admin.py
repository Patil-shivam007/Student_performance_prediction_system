from django.contrib import admin

from .models import PredictionHistory


@admin.register(PredictionHistory)
class PredictionHistoryAdmin(admin.ModelAdmin):

    list_display = (
        "student",
        "subject",
        "predicted_final_marks",
        "performance_category",
        "created_at",
    )

    list_filter = (
        "performance_category",
        "subject",
        "created_at",
    )

    search_fields = (
        "student__username",
        "subject",
    )

    ordering = (
        "-created_at",
    )

    