from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard, name='admin_dashboard'),
    path('users/', views.users, name='user_list'),
    path('users/add/', views.add_user, name='add_user'),
    path('users/edit/<int:user_id>/', views.edit_user, name='edit_user'),
    path('leave-requests/', views.leave_requests, name='admin_leave_requests'),
    path('reports/', views.reports, name='admin_reports'),
    path('settings/', views.settings, name='admin_settings'),
]
