import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import CustomUser
from apps.leave.models import LeaveType, LeaveBalance
from datetime import date

def init_data():
    print("=== Seeding Demo Data ===")
    
    # Create Leave Types
    types = [
        ('Annual Leave', 14, 'Annual entitlement leave'),
        ('Sick Leave', 7, 'Medical and sick days'),
        ('Casual Leave', 5, 'Short personal leave'),
        ('Maternity Leave', 90, 'Maternity/Paternity benefits'),
    ]
    leave_types = []
    for name, days, desc in types:
        lt, created = LeaveType.objects.get_or_create(name=name, defaults={'default_days': days, 'description': desc})
        leave_types.append(lt)
        if created:
            print(f"  Created leave type: {name} ({days} days)")
    
    # Create Demo Users
    users_data = [
        ('admin', 'admin123', 'ADMIN', 'Administration', 'Admin', 'User'),
        ('manager1', 'mgr123', 'MANAGER', 'IT', 'James', 'Wilson'),
        ('manager2', 'mgr123', 'MANAGER', 'HR', 'Sarah', 'Carter'),
        ('hr_officer', 'hr123', 'HR', 'Administration', 'Rachel', 'Green'),
        ('john_doe', 'emp123', 'EMPLOYEE', 'IT', 'John', 'Doe'),
        ('jane_smith', 'emp123', 'EMPLOYEE', 'IT', 'Jane', 'Smith'),
        ('bob_jones', 'emp123', 'EMPLOYEE', 'HR', 'Bob', 'Jones'),
        ('alice_wong', 'emp123', 'EMPLOYEE', 'Finance', 'Alice', 'Wong'),
    ]
    
    current_year = date.today().year
    for uname, pwd, urole, dept, first, last in users_data:
        if not CustomUser.objects.filter(username=uname).exists():
            u = CustomUser.objects.create_user(
                username=uname, password=pwd, role=urole, email=f"{uname}@example.com",
                department=dept, first_name=first, last_name=last
            )
            if urole == 'ADMIN':
                u.is_staff = True
                u.is_superuser = True
                u.save()
            
            # Create leave balances
            for lt in leave_types:
                LeaveBalance.objects.get_or_create(
                    user=u, leave_type=lt, year=current_year,
                    defaults={'total_days': lt.default_days, 'used_days': 0}
                )
            print(f"  Created {urole}: {uname} (pass: {pwd})")
        else:
            # Ensure balances exist for existing users
            u = CustomUser.objects.get(username=uname)
            for lt in leave_types:
                LeaveBalance.objects.get_or_create(
                    user=u, leave_type=lt, year=current_year,
                    defaults={'total_days': lt.default_days, 'used_days': 0}
                )

    print("\n=== Done! Demo credentials ===")
    print("ADMIN:    admin / admin123")
    print("MANAGER:  manager1 / mgr123")
    print("HR:       hr_officer / hr123")
    print("EMPLOYEE: john_doe / emp123")

if __name__ == '__main__':
    init_data()
