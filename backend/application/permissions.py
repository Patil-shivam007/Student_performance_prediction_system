from rest_framework.permissions import BasePermission


class IsTeacher(BasePermission):
    """
    Allows access only to users in the Teacher group.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.groups.filter(name="Teacher").exists()
        )