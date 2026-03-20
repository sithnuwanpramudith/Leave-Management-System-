from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from apps.leave.models import LeaveRequest, LeaveType, LeaveBalance
from datetime import date

User = get_user_model()


class DashboardStatsAPIView(APIView):
    """Returns aggregate statistics for the dashboard based on user role."""

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        role = request.user.role
        today = date.today()

        if role == 'ADMIN':
            total_users = User.objects.count()
            total_employees = User.objects.filter(role='EMPLOYEE').count()
            pending_leaves = LeaveRequest.objects.filter(status='PENDING').count()
            approved_today = LeaveRequest.objects.filter(
                status__in=['MANAGER_APPROVED', 'HR_APPROVED'],
                updated_at__date=today
            ).count()
            total_leave_requests = LeaveRequest.objects.count()
            leave_types = LeaveType.objects.count()
            return Response({
                'total_users': total_users,
                'total_employees': total_employees,
                'pending_leaves': pending_leaves,
                'approved_today': approved_today,
                'total_leave_requests': total_leave_requests,
                'active_policies': leave_types,
            })

        elif role == 'MANAGER':
            dept = request.user.department
            team_count = User.objects.filter(department=dept, role='EMPLOYEE').count()
            pending = LeaveRequest.objects.filter(status='PENDING', user__department=dept).count()
            approved = LeaveRequest.objects.filter(
                status__in=['MANAGER_APPROVED', 'HR_APPROVED'], user__department=dept
            ).count()
            return Response({
                'team_count': team_count,
                'pending_leaves': pending,
                'approved_leaves': approved,
            })

        elif role == 'HR':
            manager_approved = LeaveRequest.objects.filter(status='MANAGER_APPROVED').count()
            hr_approved = LeaveRequest.objects.filter(status='HR_APPROVED').count()
            hr_rejected = LeaveRequest.objects.filter(status='HR_REJECTED').count()
            total_employees = User.objects.filter(role='EMPLOYEE').count()
            return Response({
                'awaiting_final_approval': manager_approved,
                'approved_by_hr': hr_approved,
                'rejected_by_hr': hr_rejected,
                'total_employees': total_employees,
            })

        elif role == 'EMPLOYEE':
            current_year = today.year
            my_leaves = LeaveRequest.objects.filter(user=request.user)
            return Response({
                'total_requests': my_leaves.count(),
                'pending': my_leaves.filter(status='PENDING').count(),
                'approved': my_leaves.filter(status='HR_APPROVED').count(),
                'rejected': my_leaves.filter(status__in=['MANAGER_REJECTED', 'HR_REJECTED']).count(),
            })

        return Response({})


class LeaveReportAPIView(APIView):
    """Detailed leave report for admin/HR - aggregated by department and type."""

    def get(self, request):
        if not request.user.is_authenticated or request.user.role not in ['ADMIN', 'HR']:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        # By department
        by_dept = (
            LeaveRequest.objects
            .values('user__department')
            .annotate(total=Count('id'), approved=Count('id', filter=Q(status='HR_APPROVED')))
            .order_by('-total')
        )

        # By leave type
        by_type = (
            LeaveRequest.objects
            .values('leave_type__name')
            .annotate(total=Count('id'))
            .order_by('-total')
        )

        # Monthly trend (current year)
        current_year = date.today().year
        monthly = []
        for m in range(1, 13):
            count = LeaveRequest.objects.filter(
                created_at__year=current_year,
                created_at__month=m
            ).count()
            monthly.append({'month': m, 'count': count})

        return Response({
            'by_department': list(by_dept),
            'by_type': list(by_type),
            'monthly_trend': monthly,
        })


class TeamLeaveReportAPIView(APIView):
    """Manager: get team leave summary."""

    def get(self, request):
        if not request.user.is_authenticated or request.user.role not in ['MANAGER', 'ADMIN']:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        dept = request.query_params.get('department', request.user.department)
        team = User.objects.filter(department=dept)
        result = []
        for member in team:
            leaves = LeaveRequest.objects.filter(user=member)
            result.append({
                'user_id': member.id,
                'username': member.username,
                'full_name': f"{member.first_name} {member.last_name}".strip() or member.username,
                'total': leaves.count(),
                'pending': leaves.filter(status='PENDING').count(),
                'approved': leaves.filter(status='HR_APPROVED').count(),
            })
        return Response(result)
