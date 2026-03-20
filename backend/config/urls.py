from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin_django/', admin.site.urls),  # Django default admin
    path('accounts/', include('apps.accounts.urls')),
    path('leave/', include('apps.leave.urls')),
    path('admin/', include('apps.admin_panel.urls')),
    path('employee/', include('apps.employee.urls')),
    path('manager/', include('apps.manager.urls')),
    path('hr/', include('apps.hr.urls')),
    path('reports/', include('apps.reports.urls')),
    path('', include('apps.accounts.urls')), # Redirect home to accounts for login logic
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
