from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard, name='employee_dashboard'),
    path('apply/', views.apply_leave, name='apply_leave'),
    path('history/', views.leave_history, name='leave_history'),
    path('status/', views.leave_history, name='leave_status'),
    path('profile/', views.profile, name='employee_profile'),
]
