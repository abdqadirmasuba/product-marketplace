from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Only Admin role."""
    message = "You must be an Admin to perform this action."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin)


class CanEdit(BasePermission):
    """Admin, Approver, Editor — anyone who can create/edit products."""
    message = "You need Editor role or above to perform this action."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.can_edit)


class CanApprove(BasePermission):
    """Admin and Approver only."""
    message = "You need Approver role or above to perform this action."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.can_approve)


class IsInternalUser(BasePermission):
    """Any authenticated user (all roles can view internally)."""
    message = "Authentication required."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)