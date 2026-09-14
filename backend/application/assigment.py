# application/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Assignment
from .serializers import AssignmentSerializer


class AssignmentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        assignments = Assignment.objects.all().order_by("-created_at")
        serializer = AssignmentSerializer(assignments, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AssignmentSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(teacher=request.user)
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class AssignmentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Assignment.objects.get(pk=pk)
        except Assignment.DoesNotExist:
            return None

    def get(self, request, pk):
        assignment = self.get_object(pk)

        if not assignment:
            return Response(
                {"error": "Assignment not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = AssignmentSerializer(assignment)
        return Response(serializer.data)

    def put(self, request, pk):
        assignment = self.get_object(pk)

        if not assignment:
            return Response(
                {"error": "Assignment not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Only the teacher who created it can update it
        if assignment.teacher != request.user:
            return Response(
                {"error": "You are not allowed to update this assignment"},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = AssignmentSerializer(
            assignment,
            data=request.data
        )

        if serializer.is_valid():
            serializer.save(teacher=request.user)
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):
        assignment = self.get_object(pk)

        if not assignment:
            return Response(
                {"error": "Assignment not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Only the teacher who created it can delete it
        if assignment.teacher != request.user:
            return Response(
                {"error": "You are not allowed to delete this assignment"},
                status=status.HTTP_403_FORBIDDEN
            )

        assignment.delete()

        return Response(
            {"message": "Assignment deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Assignment, StudentProfile
from .serializers import *


class StudentAssignmentView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            student = StudentProfile.objects.get(user=request.user)
        except StudentProfile.DoesNotExist:
            return Response(
                {"error": "Student profile not found"},
                status=404
            )
        clasrooms = StudentSubject.objects.filter(
            student = request.user
        ).values_list("classroom_id",flat=True)


        assignments = Assignment.objects.filter(
            classroom_id__in = clasrooms
        ).order_by("-created_at")

        serializer = AssignmentSerializer(
            assignments,
            many=True
        )

        return Response(serializer.data)    