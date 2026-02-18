"""
Seed script — run once after migrations to create demo data.

    python seed.py

Creates:
    Business: Acme Corp
    Users:
        admin@acme.com      / password123  (Admin)
        approver@acme.com   / password123  (Approver)
        editor@acme.com     / password123  (Editor)
        viewer@acme.com     / password123  (Viewer)
    Products:
        3 products in various statuses
"""

import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from users.models import User, Business, Role
from products.models import Product, ProductStatus


def run():
    print("Seeding database...")

    # ── Business ──────────────────────────────────────────────────────────────
    business, _ = Business.objects.get_or_create(
        email="acme@example.com",
        defaults={"name": "Acme Corp"},
    )
    print(f"  Business: {business.name}")

    # ── Users ─────────────────────────────────────────────────────────────────
    users_data = [
        {"email": "admin@acme.com",    "first_name": "Alice", "last_name": "Admin",    "role": Role.ADMIN},
        {"email": "approver@acme.com", "first_name": "Bob",   "last_name": "Approver", "role": Role.APPROVER},
        {"email": "editor@acme.com",   "first_name": "Carol", "last_name": "Editor",   "role": Role.EDITOR},
        {"email": "viewer@acme.com",   "first_name": "Dave",  "last_name": "Viewer",   "role": Role.VIEWER},
    ]

    created_users = {}
    for u in users_data:
        user, created = User.objects.get_or_create(
            email=u["email"],
            defaults={**u, "business": business},
        )
        if created:
            user.set_password("password123")
            user.save()
        created_users[u["role"]] = user
        print(f"  User: {user.email} ({user.role})")

    # ── Products ──────────────────────────────────────────────────────────────
    products_data = [
        {
            "name": "Widget Pro",
            "description": "A professional-grade widget for all your widgeting needs.",
            "price": "29.99",
            "status": ProductStatus.APPROVED,
            "created_by": created_users[Role.EDITOR],
            "approved_by": created_users[Role.APPROVER],
        },
        {
            "name": "Gadget Lite",
            "description": "Lightweight gadget, perfect for everyday use.",
            "price": "9.99",
            "status": ProductStatus.PENDING_APPROVAL,
            "created_by": created_users[Role.EDITOR],
        },
        {
            "name": "Super Doohickey",
            "description": "A mysterious device of unknown purpose.",
            "price": "149.00",
            "status": ProductStatus.DRAFT,
            "created_by": created_users[Role.ADMIN],
        },
    ]

    for p in products_data:
        product, created = Product.objects.get_or_create(
            name=p["name"],
            business=business,
            defaults=p,
        )
        print(f"  Product: {product.name} [{product.status}]")

    print("\nDone! You can now log in with any of the seeded users.")
    print("Password for all: password123")


if __name__ == "__main__":
    run()