from rest_framework import serializers
from .models import LeaveRequest, LeaveType, LeaveBalance
from django.contrib.auth import get_user_model

User = get_user_model()

class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = '__all__'

class SimpleUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'department', 'role']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username

class LeaveRequestSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(read_only=True)
    leave_type = LeaveTypeSerializer(read_only=True)
    leave_type_id = serializers.PrimaryKeyRelatedField(
        queryset=LeaveType.objects.all(), source='leave_type', write_only=True
    )
    total_days = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = LeaveRequest
        fields = [
            'id', 'user', 'leave_type', 'leave_type_id', 'start_date', 'end_date',
            'reason', 'status', 'status_display', 'total_days',
            'manager_comments', 'hr_comments', 'created_at', 'updated_at',
            'approved_by_manager', 'approved_by_hr'
        ]
        read_only_fields = ['status', 'manager_comments', 'hr_comments', 'approved_by_manager', 'approved_by_hr']

    def get_total_days(self, obj):
        return obj.total_days()

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class LeaveBalanceSerializer(serializers.ModelSerializer):
    leave_type = LeaveTypeSerializer(read_only=True)
    remaining_days = serializers.IntegerField(read_only=True)

    class Meta:
        model = LeaveBalance
        fields = ['id', 'leave_type', 'total_days', 'used_days', 'remaining_days', 'year']
