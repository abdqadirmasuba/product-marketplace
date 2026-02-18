from django.urls import path
from users.views.user_views import UserListCreateView, UserDetailView, ChangePasswordView

urlpatterns = [
    path("",                  UserListCreateView.as_view(), name="user-list-create"),
    path("<int:pk>/",         UserDetailView.as_view(),     name="user-detail"),
    path("change-password/",  ChangePasswordView.as_view(), name="change-password"),
]