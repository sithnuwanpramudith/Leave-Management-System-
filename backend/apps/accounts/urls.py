from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('dashboard/', views.dashboard_redirect, name='dashboard_redirect'),
    path('', views.login_view, name='home'),

    # API endpoints
    path('api/login/', views.LoginAPIView.as_view(), name='api_login'),
    path('api/logout/', views.LogoutAPIView.as_view(), name='api_logout'),
    path('api/me/', views.CurrentUserAPIView.as_view(), name='api_me'),
    path('api/change-password/', views.ChangePasswordAPIView.as_view(), name='api_change_password'),
    path('api/users/', views.UserListCreateAPIView.as_view(), name='api_users'),
    path('api/users/bulk-delete/', views.BulkUserDeleteAPIView.as_view(), name='api_bulk_delete_users'),
    path('api/users/<int:pk>/', views.UserDetailAPIView.as_view(), name='api_user_detail'),
]
