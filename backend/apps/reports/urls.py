from django.urls import path
from . import views

urlpatterns = [
    path('api/stats/', views.DashboardStatsAPIView.as_view(), name='api_stats'),
    path('api/leave-report/', views.LeaveReportAPIView.as_view(), name='api_leave_report'),
    path('api/team-report/', views.TeamLeaveReportAPIView.as_view(), name='api_team_report'),
]
