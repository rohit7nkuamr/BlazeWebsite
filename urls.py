from django.urls import path
from contact import views

urlpatterns = [
    # ... other URL patterns ...
    path('api/contact/submit/', views.contact_submit, name='contact_submit'),
]