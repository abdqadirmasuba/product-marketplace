from django.urls import path
from .views.private_views import (
    ProductListCreateView,
    ProductDetailView,
    ProductSubmitView,
    ProductApproveView,
    ProductRejectView,
)
from .views.public_views import PublicProductListView, PublicProductDetailView

urlpatterns = [
    path("",                        ProductListCreateView.as_view(), name="product-list-create"),
    path("<int:pk>/",               ProductDetailView.as_view(),     name="product-detail"),
    path("<int:pk>/submit/",        ProductSubmitView.as_view(),     name="product-submit"),
    path("<int:pk>/approve/",       ProductApproveView.as_view(),    name="product-approve"),
    path("<int:pk>/reject/",        ProductRejectView.as_view(),     name="product-reject"),


    path("public/products/",        PublicProductListView.as_view(),  name="public-product-list"),
    path("public/products/<int:pk>/", PublicProductDetailView.as_view(), name="public-product-detail"),
]