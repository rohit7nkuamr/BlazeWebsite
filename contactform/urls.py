from django.urls import path
from . import views

app_name = 'contactform'

urlpatterns = [
    path('', views.contact_page, name='contact_page'),
    path('submit/', views.submit_contact, name='submit_contact'),
]