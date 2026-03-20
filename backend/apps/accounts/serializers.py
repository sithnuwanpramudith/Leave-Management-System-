from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name',
                  'role', 'department', 'phone_number', 'is_active', 'date_joined']
        read_only_fields = ['date_joined']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'first_name', 'last_name', 'role',
                  'department', 'phone_number', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        
        # Create default leave balances for the user
        try:
            from apps.leave.models import LeaveType, LeaveBalance
            from datetime import date
            current_year = date.today().year
            for lt in LeaveType.objects.all():
                LeaveBalance.objects.get_or_create(
                    user=user, leave_type=lt, year=current_year,
                    defaults={'total_days': lt.default_days, 'used_days': 0}
                )
        except Exception:
            pass
        return user

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)
