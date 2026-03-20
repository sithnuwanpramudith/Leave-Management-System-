from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from apps.leave.models import LeaveRequest

@login_required
def dashboard(request):
    pending_leaves = LeaveRequest.objects.filter(status='PENDING').order_by('-created_at')
    return render(request, 'manager/dashboard.html', {'pending_leaves': pending_leaves})

@login_required
def approve_leave(request, leave_id):
    leave = get_object_or_404(LeaveRequest, id=leave_id)
    if request.method == 'POST':
        action = request.POST.get('action')
        comments = request.POST.get('comments')
        if action == 'approve':
            leave.status = 'MANAGER_APPROVED'
        else:
            leave.status = 'MANAGER_REJECTED'
        leave.manager_comments = comments
        leave.save()
        return redirect('manager_dashboard')
    return render(request, 'manager/approve_leave.html', {'leave': leave})

@login_required
def team_report(request):
    all_leaves = LeaveRequest.objects.all().order_by('-created_at')
    return render(request, 'manager/team_report.html', {'leaves': all_leaves})

@login_required
def leave_balance(request):
    return render(request, 'manager/leave_balance.html')
