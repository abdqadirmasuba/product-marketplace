from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from ..models import Product, ProductStatus
from ..serializers import PublicProductSerializer


class PublicProductListView(APIView):
    """
    GET /api/products/public/products/
    No authentication required.
    Returns only approved products across all businesses.
    Supports ?search=name and ?max_price=50 filtering.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        products = Product.objects.filter(status=ProductStatus.APPROVED)

        search = request.query_params.get("search")
        if search:
            products = products.filter(name__icontains=search)

        max_price = request.query_params.get("max_price")
        if max_price:
            try:
                products = products.filter(price__lte=float(max_price))
            except ValueError:
                pass

        min_price = request.query_params.get("min_price")
        if min_price:
            try:
                products = products.filter(price__gte=float(min_price))
            except ValueError:
                pass

        serializer = PublicProductSerializer(products, many=True)
        return Response(serializer.data)


class PublicProductDetailView(APIView):
    """
    GET /api/products/public/products/:id/
    Returns a single approved product. 404 if not approved.
    """
    permission_classes = [AllowAny]

    def get(self, request, pk):
        from django.shortcuts import get_object_or_404
        product = get_object_or_404(Product, pk=pk, status=ProductStatus.APPROVED)
        return Response(PublicProductSerializer(product).data)