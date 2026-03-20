from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.dashboard, name='hr_dashboard'),
    path('employees/', views.employees, name='employee_list'),
    path('employees/add/', views.add_employee, name='add_employee'),
    path('policy/', views.leave_policy, name='leave_policy'),
    path('final-approval/<int:leave_id>/', views.final_approval, name='final_approval'),
]
