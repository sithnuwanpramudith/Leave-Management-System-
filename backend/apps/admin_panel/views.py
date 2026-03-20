from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from apps.accounts.models import CustomUser
from apps.leave.models import LeaveRequest

@login_required
def dashboard(request):
    total_users = CustomUser.objects.count()
    pending_leaves = LeaveRequest.objects.filter(status='PENDING').count()
    return render(request, 'admin_panel/dashboard.html', {
        'total_users': total_users,
        'pending_leaves': pending_leaves
    })

@login_required
def users(request):
    all_users = CustomUser.objects.all()
    return render(request, 'admin_panel/users.html', {'users': all_users})

@login_required
def add_user(request):
    return render(request, 'admin_panel/add_user.html')

@login_required
def edit_user(request, user_id):
    user = get_object_or_404(CustomUser, id=user_id)
    return render(request, 'admin_panel/edit_user.html', {'target_user': user})

@login_required
def leave_requests(request):
    all_requests = LeaveRequest.objects.all().order_by('-created_at')
    return render(request, 'admin_panel/leave_requests.html', {'requests': all_requests})

@login_required
def reports(request):
    return render(request, 'admin_panel/reports.html')

@login_required
def settings(request):
    return render(request, 'admin_panel/settings.html')
