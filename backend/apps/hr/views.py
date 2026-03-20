from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from apps.leave.models import LeaveRequest
from apps.accounts.models import CustomUser

@login_required
def dashboard(request):
    final_pending = LeaveRequest.objects.filter(status='MANAGER_APPROVED').order_by('-created_at')
    return render(request, 'hr/dashboard.html', {'leaves': final_pending})

@login_required
def employees(request):
    users = CustomUser.objects.all()
    return render(request, 'hr/employees.html', {'users': users})

@login_required
def add_employee(request):
    return render(request, 'hr/add_employee.html')

@login_required
def leave_policy(request):
    return render(request, 'hr/leave_policy.html')

@login_required
def final_approval(request, leave_id):
    leave = get_object_or_404(LeaveRequest, id=leave_id)
    if request.method == 'POST':
        action = request.POST.get('action')
        comments = request.POST.get('comments')
        if action == 'approve':
            leave.status = 'HR_APPROVED'
        else:
            leave.status = 'HR_REJECTED'
        leave.hr_comments = comments
        leave.save()
        return redirect('hr_dashboard')
    return render(request, 'hr/final_approval.html', {'leave': leave})
