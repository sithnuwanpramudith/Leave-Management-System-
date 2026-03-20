import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import CustomUser

def debug_users():
    print("--- User Debug ---")
    users = CustomUser.objects.all()
    for u in users:
        print(f"ID: {u.id}, Username: '{u.username}', Role: '{u.role}', IsSuper: {u.is_superuser}, IsStaff: {u.is_staff}, IsActive: {u.is_active}")
        # Verify role choices
        if u.role not in ['ADMIN', 'MANAGER', 'HR', 'EMPLOYEE']:
            print(f"  WARNING: Role '{u.role}' is not in standard choices!")

if __name__ == "__main__":
    debug_users()
