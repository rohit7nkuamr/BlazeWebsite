/**
 * 3D Animation Effects for Blaze Restaurant Website
 * This script adds a 3D fade animation to the MAIN.svg when the menu button is clicked
 */

// Function to create the flash overlay if it doesn't exist
function ensureFlashOverlay() {
  if (!document.querySelector('.flash-overlay')) {
    const flashOverlay = document.createElement('div');
    flashOverlay.className = 'flash-overlay';
    document.body.appendChild(flashOverlay);
  }
}

// Function to handle the 3D animation when the menu button is clicked
function setupMenuButtonAnimation() {
  // Ensure the flash overlay exists
  ensureFlashOverlay();
  
  // Add event delegation to handle dynamically loaded content
  document.addEventListener('click', function(event) {
    // Check if the clicked element is the menu button
    if (event.target.matches('.menu-btn') || event.target.closest('.menu-btn')) {
      event.preventDefault(); // Prevent the default hash navigation
      
      // Get the hero image
      const heroImg = document.querySelector('.hero-img');
      const flashOverlay = document.querySelector('.flash-overlay');
      
      if (heroImg) {
        // Remove the float animation temporarily to prevent conflicts
        heroImg.style.animation = 'none';
        
        // Add the 3D animation class
        heroImg.classList.add('animate-3d');
        
        // Activate the flash effect
        flashOverlay.classList.add('active');
        
        // After the animation completes, navigate to the menu page
        setTimeout(function() {
          // Get the href from the clicked button
          const href = event.target.getAttribute('href') || 
                       event.target.closest('.menu-btn').getAttribute('href') || 
                       '#menu';
          
          // Navigate to the menu page
          window.location.hash = href;
          
          // Reset the animation classes after navigation
          setTimeout(function() {
            heroImg.classList.remove('animate-3d');
            flashOverlay.classList.remove('active');
            // Restore the float animation
            heroImg.style.animation = '';
          }, 100);
        }, 800); // Match this timing with the CSS animation duration
      } else {
        // If hero image is not found, just navigate
        const href = event.target.getAttribute('href') || 
                     event.target.closest('.menu-btn').getAttribute('href') || 
                     '#menu';
        window.location.hash = href;
      }
    }
  });
}

// Initialize the animation setup when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  setupMenuButtonAnimation();
});

// Also set up the animation after each hash change in case the user navigates back to home
window.addEventListener('hashchange', function() {
  // Small delay to ensure the content is loaded
  setTimeout(setupMenuButtonAnimation, 300);
});

// Initial setup
setupMenuButtonAnimation();
