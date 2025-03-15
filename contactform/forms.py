from django import forms
from .models import Contact
import re

class ContactForm(forms.ModelForm):
    class Meta:
        model = Contact
        fields = ['name', 'email', 'subject', 'message']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Your Name',
                'required': True,
                'minlength': '2',
                'maxlength': '100'
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': 'your.email@example.com',
                'required': True
            }),
            'subject': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Message Subject',
                'required': True,
                'minlength': '5',
                'maxlength': '200'
            }),
            'message': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Your Message',
                'rows': 5,
                'required': True,
                'minlength': '10',
                'maxlength': '2000'
            })
        }

    def clean_name(self):
        name = self.cleaned_data.get('name')
        if not name:
            raise forms.ValidationError('Name is required')
        if len(name) < 2:
            raise forms.ValidationError('Name must be at least 2 characters long')
        if not re.match(r'^[a-zA-Z\s\'-]+$', name):
            raise forms.ValidationError('Name contains invalid characters')
        return name

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if not email:
            raise forms.ValidationError('Email is required')
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            raise forms.ValidationError('Invalid email format')
        return email

    def clean_subject(self):
        subject = self.cleaned_data.get('subject')
        if not subject:
            raise forms.ValidationError('Subject is required')
        if len(subject) < 5:
            raise forms.ValidationError('Subject must be at least 5 characters long')
        return subject

    def clean_message(self):
        message = self.cleaned_data.get('message')
        if not message:
            raise forms.ValidationError('Message is required')
        if len(message) < 10:
            raise forms.ValidationError('Message must be at least 10 characters long')
        if len(message) > 2000:
            raise forms.ValidationError('Message must not exceed 2000 characters')
        return message
