from rest_framework import serializers
from .models import Product, ProductStatus
from users.serializers import UserSerializer


class ProductSerializer(serializers.ModelSerializer):
    """
    Full product serializer — used for internal users.
    Includes who created and approved the product.
    """
    created_by  = UserSerializer(read_only=True)
    approved_by = UserSerializer(read_only=True)
    business_name = serializers.CharField(source="business.name", read_only=True)

    class Meta:
        model  = Product
        fields = [
            "id", "name", "description", "price", "status",
            "business_name", "created_by", "approved_by",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "status", "created_by", "approved_by", "created_at", "updated_at"]


class ProductWriteSerializer(serializers.ModelSerializer):
    """
    Used for create and update operations.
    Status is managed via dedicated endpoints (submit, approve) — not here.
    """
    class Meta:
        model  = Product
        fields = ["id", "name", "description", "price"]
        read_only_fields = ["id"]

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value


class PublicProductSerializer(serializers.ModelSerializer):
    """
    Lean serializer for public (unauthenticated) product listing.
    Only exposes safe, approved-product fields.
    """
    business_name = serializers.CharField(source="business.name", read_only=True)

    class Meta:
        model  = Product
        fields = ["id", "name", "description", "price", "business_name", "created_at"]