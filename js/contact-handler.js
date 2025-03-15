document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      subject: document.getElementById('subject').value,
      message: document.getElementById('message').value
    };

    const submitBtn = contactForm.querySelector('.submit-btn');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Simulate form submission (replace with your actual API endpoint)
    setTimeout(() => {
      handleFormSubmission(formData)
        .then(response => {
          showFormMessage('Message sent successfully!', 'success');
          contactForm.reset();
        })
        .catch(error => {
          showFormMessage('Failed to send message. Please try again.', 'error');
        })
        .finally(() => {
          submitBtn.textContent = originalBtnText;
          submitBtn.disabled = false;
        });
    }, 1000);
  });

  function handleFormSubmission(formData) {
    // Replace this with your actual API endpoint
    return new Promise((resolve, reject) => {
      // Simulate API call
      if (formData.name && formData.email && formData.message) {
        resolve({ success: true });
      } else {
        reject(new Error('Invalid form data'));
      }
    });
  }

  function showFormMessage(message, type) {
    const messageElement = document.getElementById('formMessage');
    messageElement.textContent = message;
    messageElement.className = `form-message ${type}`;
    
    // Auto-hide message after 5 seconds
    setTimeout(() => {
      messageElement.style.display = 'none';
    }, 5000);
  }
});