from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from apps.leave.models import LeaveRequest
from apps.leave.forms import LeaveRequestForm

@login_required
def dashboard(request):
    leaves = LeaveRequest.objects.filter(user=request.user).order_by('-created_at')[:5]
    return render(request, 'employee/dashboard.html', {'leaves': leaves})

@login_required
def apply_leave(request):
    if request.method == 'POST':
        form = LeaveRequestForm(request.POST)
        if form.is_valid():
            leave = form.save(commit=False)
            leave.user = request.user
            leave.save()
            return redirect('leave_history')
    else:
        form = LeaveRequestForm()
    return render(request, 'employee/apply_leave.html', {'form': form})

@login_required
def leave_history(request):
    leaves = LeaveRequest.objects.filter(user=request.user).order_by('-created_at')
    return render(request, 'employee/leave_history.html', {'leaves': leaves})

@login_required
def profile(request):
    return render(request, 'employee/profile.html')
