from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard, name='manager_dashboard'),
    path('approve/<int:leave_id>/', views.approve_leave, name='approve_leave'),
    path('team-report/', views.team_report, name='team_report'),
    path('balance/', views.leave_balance, name='leave_balance'),
]
