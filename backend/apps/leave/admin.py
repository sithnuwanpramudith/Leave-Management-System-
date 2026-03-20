from django.contrib import admin
from .models import LeaveType, LeaveRequest, LeaveBalance

@admin.register(LeaveType)
class LeaveTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'default_days')
    search_fields = ('name',)

@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'leave_type', 'start_date', 'end_date', 'status', 'created_at')
    list_filter = ('status', 'leave_type', 'start_date')
    search_fields = ('user__username', 'reason')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Request Info', {
            'fields': ('user', 'leave_type', 'start_date', 'end_date', 'reason')
        }),
        ('Status & Approvals', {
            'fields': ('status', 'manager_comments', 'hr_comments', 'approved_by_manager', 'approved_by_hr')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(LeaveBalance)
class LeaveBalanceAdmin(admin.ModelAdmin):
    list_display = ('user', 'leave_type', 'total_days', 'used_days', 'remaining_days', 'year')
    list_filter = ('year', 'leave_type')
    search_fields = ('user__username',)
