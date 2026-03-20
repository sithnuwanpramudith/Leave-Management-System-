import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import CustomUser

def fix_roles():
    users = CustomUser.objects.all()
    for user in users:
        if user.is_superuser and user.role != 'ADMIN':
            print(f"Updating role for superuser {user.username} to ADMIN")
            user.role = 'ADMIN'
            user.save()
        print(f"User: {user.username}, Role: {user.role}, IsSuperuser: {user.is_superuser}")

if __name__ == "__main__":
    fix_roles()
