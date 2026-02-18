from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from ..models import Product, ProductStatus
from ..serializers import ProductSerializer, ProductWriteSerializer
from users.permissions import IsInternalUser, CanEdit, CanApprove, IsAdmin


class ProductListCreateView(APIView):
    """
    GET  /api/products/   → all products for the user's business (all internal roles)
    POST /api/products/   → create a new draft product (Editor and above)
    """

    def get_permissions(self):
        if self.request.method == "POST":
            return [CanEdit()]
        return [IsInternalUser()]

    def get(self, request):
        products = Product.objects.filter(business=request.user.business)

        # Optional query param filters
        status_filter = request.query_params.get("status")
        if status_filter:
            products = products.filter(status=status_filter)

        search = request.query_params.get("search")
        if search:
            products = products.filter(name__icontains=search)

        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProductWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save(
            business=request.user.business,
            created_by=request.user,
            status=ProductStatus.DRAFT,
        )
        return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)


class ProductDetailView(APIView):
    """
    GET    /api/products/:id/   → retrieve single product (all internal roles)
    PATCH  /api/products/:id/   → edit product — only if draft or pending (Editor+)
    DELETE /api/products/:id/   → hard delete (Admin only)
    """

    def _get_product(self, request, pk):
        return get_object_or_404(Product, pk=pk, business=request.user.business)

    def get_permissions(self):
        if self.request.method == "DELETE":
            return [IsAdmin()]
        if self.request.method == "PATCH":
            return [CanEdit()]
        return [IsInternalUser()]

    def get(self, request, pk):
        product = self._get_product(request, pk)
        return Response(ProductSerializer(product).data)

    def patch(self, request, pk):
        product = self._get_product(request, pk)

        # Approved products cannot be edited — they must be re-drafted
        if product.status == ProductStatus.APPROVED:
            return Response(
                {"detail": "Approved products cannot be edited. Please contact an Admin."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ProductWriteSerializer(product, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(ProductSerializer(product).data)

    def delete(self, request, pk):
        product = self._get_product(request, pk)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProductSubmitView(APIView):
    """
    POST /api/products/:id/submit/
    Moves a draft product to pending_approval.
    Any Editor and above can submit their own product (or any in their business).
    """
    permission_classes = [CanEdit]

    def post(self, request, pk):
        product = get_object_or_404(Product, pk=pk, business=request.user.business)

        if product.status != ProductStatus.DRAFT:
            return Response(
                {"detail": f"Only draft products can be submitted. Current status: {product.status}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        product.status = ProductStatus.PENDING_APPROVAL
        product.save()
        return Response(ProductSerializer(product).data)


class ProductApproveView(APIView):
    """
    POST /api/products/:id/approve/
    Approves a pending product. Only Approver and Admin can do this.
    """
    permission_classes = [CanApprove]

    def post(self, request, pk):
        product = get_object_or_404(Product, pk=pk, business=request.user.business)

        if product.status != ProductStatus.PENDING_APPROVAL:
            return Response(
                {"detail": f"Only pending products can be approved. Current status: {product.status}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        product.status      = ProductStatus.APPROVED
        product.approved_by = request.user
        product.save()
        return Response(ProductSerializer(product).data)


class ProductRejectView(APIView):
    """
    POST /api/products/:id/reject/
    Sends a pending product back to draft. Approver and Admin.
    """
    permission_classes = [CanApprove]

    def post(self, request, pk):
        product = get_object_or_404(Product, pk=pk, business=request.user.business)

        if product.status != ProductStatus.PENDING_APPROVAL:
            return Response(
                {"detail": "Only pending products can be rejected."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        product.status      = ProductStatus.DRAFT
        product.approved_by = None
        product.save()
        return Response(ProductSerializer(product).data)