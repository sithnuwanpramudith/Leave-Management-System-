from django.urls import path
from . import views

urlpatterns = [
    # Leave Types
    path('api/types/', views.LeaveTypeListView.as_view(), name='api_leave_types'),
    path('api/types/<int:pk>/', views.LeaveTypeDetailView.as_view(), name='api_leave_type_detail'),

    # Leave Requests
    path('api/requests/', views.LeaveRequestListCreateView.as_view(), name='api_leave_requests'),
    path('api/requests/<int:pk>/', views.LeaveRequestDetailView.as_view(), name='api_leave_request_detail'),
    path('api/requests/<int:pk>/manager-action/', views.ManagerApproveView.as_view(), name='api_manager_action'),
    path('api/requests/<int:pk>/hr-action/', views.HRApproveView.as_view(), name='api_hr_action'),

    # Leave Balance
    path('api/balance/', views.LeaveBalanceView.as_view(), name='api_leave_balance'),

    # Admin all-leaves view
    path('api/all/', views.AllLeavesAdminView.as_view(), name='api_all_leaves'),
]
