from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags

def send_contact_email(contact):
    """
    Send email notifications for contact form submissions
    """
    # Email to admin
    admin_context = {
        'name': contact.name,
        'email': contact.email,
        'subject': contact.subject,
        'message': contact.message,
        'created_at': contact.created_at
    }
    
    admin_html_content = render_to_string(
        'contactform/email/admin_notification.html', 
        admin_context
    )
    admin_text_content = strip_tags(admin_html_content)
    
    admin_email = EmailMultiAlternatives(
        f'New Contact Form Submission: {contact.subject}',
        admin_text_content,
        settings.DEFAULT_FROM_EMAIL,
        [settings.ADMIN_EMAIL]
    )
    admin_email.attach_alternative(admin_html_content, "text/html")
    
    # Email to user
    user_context = {
        'name': contact.name,
        'subject': contact.subject
    }
    
    user_html_content = render_to_string(
        'contactform/email/user_confirmation.html', 
        user_context
    )
    user_text_content = strip_tags(user_html_content)
    
    user_email = EmailMultiAlternatives(
        'Thank you for contacting us',
        user_text_content,
        settings.DEFAULT_FROM_EMAIL,
        [contact.email]
    )
    user_email.attach_alternative(user_html_content, "text/html")
    
    # Send both emails
    try:
        admin_email.send()
        user_email.send()
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False