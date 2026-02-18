from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class Business(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "businesses"

    def __str__(self):
        return self.name


class Role(models.TextChoices):
    """
    Hierarchy (highest → lowest):
        ADMIN    – can do everything
        APPROVER – can do everything EDITOR can + approve products
        EDITOR   – can create & edit products, submit for approval
        VIEWER   – read-only access to internal product list
    """
    ADMIN    = "admin",    "Admin"
    APPROVER = "approver", "Approver"
    EDITOR   = "editor",   "Editor"
    VIEWER   = "viewer",   "Viewer"


# Numeric weight so we can do hierarchy comparisons easily
ROLE_HIERARCHY = {
    Role.ADMIN:    4,
    Role.APPROVER: 3,
    Role.EDITOR:   2,
    Role.VIEWER:   1,
}


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", Role.ADMIN)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email       = models.EmailField(unique=True)
    first_name  = models.CharField(max_length=150)
    last_name   = models.CharField(max_length=150)
    role        = models.CharField(max_length=20, choices=Role.choices, default=Role.VIEWER)
    business    = models.ForeignKey(
        Business,
        on_delete=models.CASCADE,
        related_name="users",
        null=True,
        blank=True,
    )
    is_active   = models.BooleanField(default=True)
    is_staff    = models.BooleanField(default=False)   # Django admin access
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD  = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    def __str__(self):
        return f"{self.email} ({self.role})"

    # ── Convenience permission helpers ────────────────────────────────────────

    def _has_min_role(self, min_role: str) -> bool:
        """Return True if this user's role is >= min_role in the hierarchy."""
        return ROLE_HIERARCHY.get(self.role, 0) >= ROLE_HIERARCHY.get(min_role, 0)

    @property
    def is_admin(self) -> bool:
        return self.role == Role.ADMIN

    @property
    def can_approve(self) -> bool:
        """Admin and Approver can approve products."""
        return self._has_min_role(Role.APPROVER)

    @property
    def can_edit(self) -> bool:
        """Admin, Approver, and Editor can create/edit products."""
        return self._has_min_role(Role.EDITOR)

    @property
    def can_manage_users(self) -> bool:
        """Only Admin can manage users."""
        return self.is_admin