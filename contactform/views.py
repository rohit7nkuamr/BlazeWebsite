from django.shortcuts import render, redirect
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_protect
from django.core.exceptions import ValidationError
from .forms import ContactForm
from .email import send_contact_email
import logging

logger = logging.getLogger(__name__)

@csrf_protect
def contact_page(request):
    form = ContactForm()
    return render(request, 'contactform/contact.html', {'form': form})

@require_http_methods(["POST"])
@csrf_protect
def submit_contact(request):
    try:
        form = ContactForm(request.POST)
        if form.is_valid():
            contact = form.save()
            
            # Send email notifications
            email_sent = send_contact_email(contact)
            
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                response_data = {
                    'status': 'success',
                    'message': 'Your message has been sent successfully!'
                }
                if not email_sent:
                    logger.warning(f"Failed to send email notification for contact ID: {contact.id}")
                return JsonResponse(response_data)
            
            messages.success(request, 'Your message has been sent successfully!')
            return redirect('contactform:contact_page')
        else:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'status': 'error',
                    'errors': form.errors
                }, status=400)
            
            messages.error(request, 'Please correct the errors below.')
            return render(request, 'contactform/contact.html', {'form': form})
            
    except Exception as e:
        logger.error(f"Error in submit_contact: {str(e)}")
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'status': 'error',
                'message': 'An unexpected error occurred. Please try again later.'
            }, status=500)
        
        messages.error(request, 'An unexpected error occurred. Please try again later.')
    return redirect('contactform:contact_page')
