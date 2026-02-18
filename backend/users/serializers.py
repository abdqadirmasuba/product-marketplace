from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Business, Role


# ─── Business ────────────────────────────────────────────────────────────────

class BusinessSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Business
        fields = ["id", "name", "email", "created_at"]
        read_only_fields = ["id", "created_at"]


# ─── Auth ─────────────────────────────────────────────────────────────────────

class LoginSerializer(serializers.Serializer):
    email    = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data["email"], password=data["password"])
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        if not user.is_active:
            raise serializers.ValidationError("This account has been deactivated.")
        data["user"] = user
        return data


# ─── User (read) ──────────────────────────────────────────────────────────────

class UserSerializer(serializers.ModelSerializer):
    """Full user detail — used for /me and user list responses."""
    business = BusinessSerializer(read_only=True)

    class Meta:
        model  = User
        fields = [
            "id", "email", "first_name", "last_name",
            "role", "business", "is_active", "date_joined",
        ]
        read_only_fields = ["id", "date_joined"]


# ─── User (create) ────────────────────────────────────────────────────────────

class CreateUserSerializer(serializers.ModelSerializer):
    """
    Used by Admin to create a new user under their business.
    Password is write-only; role defaults to viewer if not supplied.
    """
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model  = User
        fields = ["id", "email", "first_name", "last_name", "role", "password"]
        read_only_fields = ["id"]

    def validate_role(self, value):
        requesting_user = self.context["request"].user
        # Only admin can create another admin
        if value == Role.ADMIN and not requesting_user.is_admin:
            raise serializers.ValidationError("Only an Admin can assign the Admin role.")
        return value

    def create(self, validated_data):
        # Attach the new user to the same business as the requesting admin
        business = self.context["request"].user.business
        return User.objects.create_user(business=business, **validated_data)


# ─── User (update) ────────────────────────────────────────────────────────────

class UpdateUserSerializer(serializers.ModelSerializer):
    """Admin can update role and active status of users in their business."""

    class Meta:
        model  = User
        fields = ["first_name", "last_name", "role", "is_active"]

    def validate_role(self, value):
        requesting_user = self.context["request"].user
        if value == Role.ADMIN and not requesting_user.is_admin:
            raise serializers.ValidationError("Only an Admin can assign the Admin role.")
        return value


# ─── Password change ──────────────────────────────────────────────────────────

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value