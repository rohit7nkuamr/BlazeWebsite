from django.shortcuts import render, redirect
from django.contrib import messages
from django.http import JsonResponse
from .forms import ContactForm

def contact_page(request):
    form = ContactForm()
    return render(request, 'contactform/contact.html', {'form': form})

def submit_contact(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            form.save()
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'status': 'success',
                    'message': 'Your message has been sent successfully!'
                })
            messages.success(request, 'Your message has been sent successfully!')
            return redirect('contactform:contact_page')
        else:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'status': 'error',
                    'errors': form.errors
                })
            messages.error(request, 'Please correct the errors below.')
    return redirect('contactform:contact_page')
