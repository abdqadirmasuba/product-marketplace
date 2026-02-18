from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Business


@admin.register(Business)
class BusinessAdmin(admin.ModelAdmin):
    list_display  = ["name", "email", "created_at"]
    search_fields = ["name", "email"]


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display   = ["email", "first_name", "last_name", "role", "business", "is_active"]
    list_filter    = ["role", "is_active", "business"]
    search_fields  = ["email", "first_name", "last_name"]
    ordering       = ["email"]

    fieldsets = (
        (None,            {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name")}),
        ("Business",      {"fields": ("business", "role")}),
        ("Permissions",   {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Dates",         {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields":  ("email", "first_name", "last_name", "business", "role", "password1", "password2"),
        }),
    )

    readonly_fields = ["date_joined", "last_login"]