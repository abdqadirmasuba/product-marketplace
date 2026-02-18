from django.db import models
from django.conf import settings


class ProductStatus(models.TextChoices):
    DRAFT            = "draft",            "Draft"
    PENDING_APPROVAL = "pending_approval", "Pending Approval"
    APPROVED         = "approved",         "Approved"


class Product(models.Model):
    name        = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price       = models.DecimalField(max_digits=10, decimal_places=2)
    status      = models.CharField(
        max_length=20,
        choices=ProductStatus.choices,
        default=ProductStatus.DRAFT,
    )
    business    = models.ForeignKey(
        "users.Business",
        on_delete=models.CASCADE,
        related_name="products",
    )
    created_by  = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_products",
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_products",
    )
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} [{self.status}]"