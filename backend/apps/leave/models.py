from django.db import models
from django.conf import settings

class LeaveType(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    default_days = models.IntegerField(default=10)

    def __str__(self):
        return self.name

class LeaveRequest(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending Manager Approval'),
        ('MANAGER_APPROVED', 'Approved by Manager'),
        ('MANAGER_REJECTED', 'Rejected by Manager'),
        ('HR_APPROVED', 'Final Approved by HR'),
        ('HR_REJECTED', 'Final Rejected by HR'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.ForeignKey(LeaveType, on_delete=models.SET_NULL, null=True)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Approval tracking
    manager_comments = models.TextField(blank=True, null=True)
    hr_comments = models.TextField(blank=True, null=True)
    approved_by_manager = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='manager_approvals'
    )
    approved_by_hr = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='hr_approvals'
    )

    def total_days(self):
        delta = self.end_date - self.start_date
        return delta.days + 1

    def __str__(self):
        return f"{self.user.username} - {self.leave_type} ({self.status})"

class LeaveBalance(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='leave_balances')
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE)
    total_days = models.IntegerField(default=0)
    used_days = models.IntegerField(default=0)
    year = models.IntegerField()

    class Meta:
        unique_together = ('user', 'leave_type', 'year')

    @property
    def remaining_days(self):
        return self.total_days - self.used_days

    def __str__(self):
        return f"{self.user.username} - {self.leave_type.name} ({self.year})"
