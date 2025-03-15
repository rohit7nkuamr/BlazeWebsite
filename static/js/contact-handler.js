document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    const submitBtn = form.querySelector('.submit-btn');
    const formMessage = document.getElementById('formMessage');

    // Rate limiting
    let lastSubmissionTime = 0;
    const SUBMISSION_COOLDOWN = 60000; // 1 minute

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Check rate limiting
        const now = Date.now();
        if (now - lastSubmissionTime < SUBMISSION_COOLDOWN) {
            showMessage('Please wait a moment before submitting again.', 'error');
            return;
        }

        // Basic client-side validation
        const formData = new FormData(form);
        const errors = validateForm(formData);
        if (errors.length > 0) {
            showMessage(errors.join('<br>'), 'error');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const data = await response.json();

            if (response.ok) {
                showMessage(data.message, 'success');
                form.reset();
                lastSubmissionTime = now;
            } else {
                if (data.errors) {
                    const errorMessages = Object.values(data.errors).flat();
                    showMessage(errorMessages.join('<br>'), 'error');
                } else {
                    showMessage(data.message || 'An error occurred', 'error');
                }
            }
        } catch (error) {
            showMessage('Failed to send message. Please try again later.', 'error');
            console.error('Error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        }
    });

    function validateForm(formData) {
        const errors = [];
        const email = formData.get('email');
        const message = formData.get('message');

        if (!formData.get('name').trim()) {
            errors.push('Name is required');
        }

        if (!email.trim()) {
            errors.push('Email is required');
        } else if (!isValidEmail(email)) {
            errors.push('Invalid email format');
        }

        if (!formData.get('subject').trim()) {
            errors.push('Subject is required');
        }

        if (!message.trim()) {
            errors.push('Message is required');
        } else if (message.length < 10) {
            errors.push('Message must be at least 10 characters long');
        }

        return errors;
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showMessage(message, type) {
        formMessage.innerHTML = message;
        formMessage.className = `form-message ${type}`;
        formMessage.style.display = 'block';

        // Auto-hide message after 5 seconds
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    }
});