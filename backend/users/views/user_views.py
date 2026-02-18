from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from users.models import User
from users.permissions import IsAdmin
from users.serializers import (
    UserSerializer,
    CreateUserSerializer,
    UpdateUserSerializer,
    ChangePasswordSerializer,
)


class UserListCreateView(APIView):
    """
    GET  /api/users/   → list all users in the requesting admin's business
    POST /api/users/   → create a new user under the same business
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        users = User.objects.filter(business=request.user.business).order_by("date_joined")
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CreateUserSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class UserDetailView(APIView):
    """
    GET    /api/users/:id/   → retrieve a single user (must belong to same business)
    PATCH  /api/users/:id/   → update role / active status
    DELETE /api/users/:id/   → remove user from business
    """
    permission_classes = [IsAdmin]

    def _get_user(self, request, pk):
        """Ensure the target user belongs to the requesting admin's business."""
        return get_object_or_404(User, pk=pk, business=request.user.business)

    def get(self, request, pk):
        user = self._get_user(request, pk)
        return Response(UserSerializer(user).data)

    def patch(self, request, pk):
        user = self._get_user(request, pk)

        # Prevent admin from editing themselves via this endpoint
        if user == request.user:
            return Response(
                {"detail": "Use /api/auth/me/ to update your own profile."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = UpdateUserSerializer(
            user, data=request.data, partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(user).data)

    def delete(self, request, pk):
        user = self._get_user(request, pk)

        if user == request.user:
            return Response(
                {"detail": "You cannot delete your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChangePasswordView(APIView):
    """
    POST /api/users/change-password/
    Any authenticated user can change their own password.
    """

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()
        return Response({"detail": "Password updated successfully."})