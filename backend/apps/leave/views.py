from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from apps.leave.models import LeaveRequest, LeaveType, LeaveBalance
from apps.leave.serializers import LeaveRequestSerializer, LeaveTypeSerializer, LeaveBalanceSerializer
from datetime import date


class LeaveTypeListView(APIView):
    """List all leave types. Admin/HR can create new ones."""

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        leave_types = LeaveType.objects.all()
        return Response(LeaveTypeSerializer(leave_types, many=True).data)

    def post(self, request):
        if not request.user.is_authenticated or request.user.role not in ['ADMIN', 'HR']:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        serializer = LeaveTypeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LeaveTypeDetailView(APIView):
    def get(self, request, pk):
        lt = get_object_or_404(LeaveType, pk=pk)
        return Response(LeaveTypeSerializer(lt).data)

    def put(self, request, pk):
        if not request.user.is_authenticated or request.user.role not in ['ADMIN', 'HR']:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        lt = get_object_or_404(LeaveType, pk=pk)
        serializer = LeaveTypeSerializer(lt, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        if not request.user.is_authenticated or request.user.role not in ['ADMIN']:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        lt = get_object_or_404(LeaveType, pk=pk)
        lt.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class LeaveRequestListCreateView(APIView):
    """Employees create; role-filtered list returned based on user role."""

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        role = request.user.role
        if role == 'EMPLOYEE':
            qs = LeaveRequest.objects.filter(user=request.user).order_by('-created_at')
        elif role == 'MANAGER':
            # Manager sees their team's PENDING leaves
            qs = LeaveRequest.objects.filter(
                status='PENDING', user__department=request.user.department
            ).order_by('-created_at')
        elif role == 'HR':
            # HR sees manager-approved leaves
            qs = LeaveRequest.objects.filter(status='MANAGER_APPROVED').order_by('-created_at')
        elif role == 'ADMIN':
            qs = LeaveRequest.objects.all().order_by('-created_at')
        else:
            qs = LeaveRequest.objects.none()
        
        # Optional filters
        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        
        return Response(LeaveRequestSerializer(qs, many=True).data)

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        serializer = LeaveRequestSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            leave_request = serializer.save()
            return Response(LeaveRequestSerializer(leave_request).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LeaveRequestDetailView(APIView):
    def get(self, request, pk):
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        leave = get_object_or_404(LeaveRequest, pk=pk)
        return Response(LeaveRequestSerializer(leave).data)

    def delete(self, request, pk):
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        leave = get_object_or_404(LeaveRequest, pk=pk)
        if leave.user != request.user and request.user.role != 'ADMIN':
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        if leave.status != 'PENDING':
            return Response({'error': 'Cannot cancel a processed leave request'}, status=status.HTTP_400_BAD_REQUEST)
        leave.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ManagerApproveView(APIView):
    """Manager approves or rejects a pending leave request."""

    def post(self, request, pk):
        if not request.user.is_authenticated or request.user.role not in ['MANAGER', 'ADMIN']:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        leave = get_object_or_404(LeaveRequest, pk=pk)
        action = request.data.get('action')  # 'approve' or 'reject'
        comments = request.data.get('comments', '')

        if leave.status != 'PENDING':
            return Response({'error': 'Leave is not in PENDING state'}, status=status.HTTP_400_BAD_REQUEST)

        if action == 'approve':
            leave.status = 'MANAGER_APPROVED'
            leave.approved_by_manager = request.user
        elif action == 'reject':
            leave.status = 'MANAGER_REJECTED'
        else:
            return Response({'error': 'Invalid action. Use approve or reject.'}, status=status.HTTP_400_BAD_REQUEST)

        leave.manager_comments = comments
        leave.save()
        return Response(LeaveRequestSerializer(leave).data)


class HRApproveView(APIView):
    """HR does final approval or rejection on manager-approved leaves."""

    def post(self, request, pk):
        if not request.user.is_authenticated or request.user.role not in ['HR', 'ADMIN']:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        leave = get_object_or_404(LeaveRequest, pk=pk)
        action = request.data.get('action')
        comments = request.data.get('comments', '')

        if leave.status != 'MANAGER_APPROVED':
            return Response({'error': 'Leave is not in MANAGER_APPROVED state'}, status=status.HTTP_400_BAD_REQUEST)

        if action == 'approve':
            leave.status = 'HR_APPROVED'
            leave.approved_by_hr = request.user
            # Deduct days from balance
            current_year = date.today().year
            balance, _ = LeaveBalance.objects.get_or_create(
                user=leave.user, leave_type=leave.leave_type, year=current_year,
                defaults={'total_days': leave.leave_type.default_days, 'used_days': 0}
            )
            balance.used_days += leave.total_days()
            balance.save()
        elif action == 'reject':
            leave.status = 'HR_REJECTED'
        else:
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

        leave.hr_comments = comments
        leave.save()
        return Response(LeaveRequestSerializer(leave).data)


class LeaveBalanceView(APIView):
    """Returns leave balance for the current user (or specified user if admin)."""

    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        
        user_id = request.query_params.get('user_id')
        if user_id and request.user.role in ['ADMIN', 'HR', 'MANAGER']:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            target_user = get_object_or_404(User, pk=user_id)
        else:
            target_user = request.user
        
        current_year = date.today().year
        # Ensure balances exist for all leave types
        for lt in LeaveType.objects.all():
            LeaveBalance.objects.get_or_create(
                user=target_user, leave_type=lt, year=current_year,
                defaults={'total_days': lt.default_days, 'used_days': 0}
            )
        
        balances = LeaveBalance.objects.filter(user=target_user, year=current_year)
        return Response(LeaveBalanceSerializer(balances, many=True).data)


class AllLeavesAdminView(APIView):
    """Admin/HR: see all leave requests with optional filters."""

    def get(self, request):
        if not request.user.is_authenticated or request.user.role not in ['ADMIN', 'HR']:
            return Response({'error': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        qs = LeaveRequest.objects.all().order_by('-created_at')
        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return Response(LeaveRequestSerializer(qs, many=True).data)
