// dissolve-animation.js - Dissolve animations for menu swiping

// Self-executing function to avoid global scope pollution
(function() {
  // List of all menu sections in order
  const menuSections = [
    'gourmet-burgers',
    'wraps',
    'sides',
    'pasta',
    'main-course',
    'chinese',
    'cold-beverages',
    'hot-beverages'
  ];

  // Cache DOM references
  let menuContainer, leftIndicator, rightIndicator;
  
  // Variables for touch events
  let touchStartX = 0;
  let touchEndX = 0;
  let touchMoveX = 0;
  let swipeThreshold = 0.25; // Threshold to trigger page change (25% of screen width)
  let animating = false;
  let windowWidth;
  let thresholdDistance;
  
  // Debounce function to limit function calls
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Initialize swipe detection when DOM is loaded
  document.addEventListener('DOMContentLoaded', function() {
    // Wait for the content to load before initializing swipe
    setTimeout(initSwipeNavigation, 300);
  });

  // Initialize swipe detection when hash changes (page navigation)
  window.addEventListener('hashchange', function() {
    // Wait for the content to load before initializing swipe
    setTimeout(initSwipeNavigation, 300);
  });

  // Function to initialize swipe detection
  function initSwipeNavigation() {
    // Only run this on pages that have the menu container
    menuContainer = document.querySelector('.menu-container');
    if (!menuContainer) return;
    
    // Update window width for calculations
    windowWidth = window.innerWidth;
    thresholdDistance = windowWidth * swipeThreshold;

    // Add new-page class to show the swipe hint animation
    menuContainer.classList.add('new-page');
    
    // Remove the class after the animation completes
    setTimeout(() => {
      menuContainer.classList.remove('new-page');
    }, 3500);

    // Add swipe indicators if they don't exist
    if (!menuContainer.querySelector('.swipe-indicator-left')) {
      leftIndicator = document.createElement('div');
      leftIndicator.className = 'swipe-indicator swipe-indicator-left';
      menuContainer.appendChild(leftIndicator);
    } else {
      leftIndicator = menuContainer.querySelector('.swipe-indicator-left');
    }

    if (!menuContainer.querySelector('.swipe-indicator-right')) {
      rightIndicator = document.createElement('div');
      rightIndicator.className = 'swipe-indicator swipe-indicator-right';
      menuContainer.appendChild(rightIndicator);
    } else {
      rightIndicator = menuContainer.querySelector('.swipe-indicator-right');
    }

    // Remove any existing event listeners to prevent duplicates
    const newMenuContainer = menuContainer.cloneNode(true);
    menuContainer.parentNode.replaceChild(newMenuContainer, menuContainer);
    
    // Re-select the elements after cloning
    menuContainer = document.querySelector('.menu-container');
    leftIndicator = menuContainer.querySelector('.swipe-indicator-left');
    rightIndicator = menuContainer.querySelector('.swipe-indicator-right');
    
    // Add touch event listeners to the menu container
    menuContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    menuContainer.addEventListener('touchmove', handleTouchMove, { passive: true });
    menuContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Add vibration feedback if supported
    if ('vibrate' in navigator) {
      menuContainer.addEventListener('touchstart', () => {
        navigator.vibrate(10); // Subtle vibration on touch
      }, { passive: true });
    }
  }
  
  // Touch start handler
  function handleTouchStart(e) {
    if (animating) return;
    
    touchStartX = e.changedTouches[0].screenX;
    // Reset any existing swipe indicators
    menuContainer.classList.remove('swipe-active-left', 'swipe-active-right');
    
    // Hide indicators
    leftIndicator.classList.remove('visible');
    rightIndicator.classList.remove('visible');
  }
  
  // Touch move handler - optimized with requestAnimationFrame
  const handleTouchMove = debounce(function(e) {
    if (animating) return;
    
    touchMoveX = e.changedTouches[0].screenX;
    // Calculate the distance moved
    const moveDistance = touchMoveX - touchStartX;
    
    // Use requestAnimationFrame for smoother animations
    requestAnimationFrame(() => {
      // Show appropriate indicator based on swipe direction
      if (moveDistance < -20) { // Swiping left (next)
        const currentIndex = menuSections.indexOf(window.location.hash.slice(1) || 'gourmet-burgers');
        // Only show if there's a next section
        if (currentIndex < menuSections.length - 1) {
          rightIndicator.classList.add('visible');
          leftIndicator.classList.remove('visible');
          menuContainer.classList.add('swipe-active-right');
          menuContainer.classList.remove('swipe-active-left');
        }
      } else if (moveDistance > 20) { // Swiping right (previous)
        const currentIndex = menuSections.indexOf(window.location.hash.slice(1) || 'gourmet-burgers');
        // Only show if there's a previous section
        if (currentIndex > 0) {
          leftIndicator.classList.add('visible');
          rightIndicator.classList.remove('visible');
          menuContainer.classList.add('swipe-active-left');
          menuContainer.classList.remove('swipe-active-right');
        }
      } else {
        // Not enough movement, hide indicators
        leftIndicator.classList.remove('visible');
        rightIndicator.classList.remove('visible');
        menuContainer.classList.remove('swipe-active-left', 'swipe-active-right');
      }
    });
  }, 16); // ~60fps
  
  // Touch end handler
  function handleTouchEnd(e) {
    if (animating) return;
    
    touchEndX = e.changedTouches[0].screenX;
    const swipeDistance = touchEndX - touchStartX;
    
    // If the swipe distance is greater than the threshold, navigate to the next/previous section
    if (Math.abs(swipeDistance) > thresholdDistance) {
      // Get current section
      const currentHash = window.location.hash.slice(1) || 'gourmet-burgers';
      const currentIndex = menuSections.indexOf(currentHash);
      let nextIndex;
      
      // Provide haptic feedback if supported
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
      
      if (swipeDistance < 0 && currentIndex < menuSections.length - 1) { // Swipe left to go to next section
        nextIndex = currentIndex + 1;
        animateDissolveTransition('next', menuSections[nextIndex]);
      } else if (swipeDistance > 0 && currentIndex > 0) { // Swipe right to go to previous section
        nextIndex = currentIndex - 1;
        animateDissolveTransition('prev', menuSections[nextIndex]);
      }
    } else {
      // Not enough distance swiped, hide indicators
      leftIndicator.classList.remove('visible');
      rightIndicator.classList.remove('visible');
      menuContainer.classList.remove('swipe-active-left', 'swipe-active-right');
    }
  }
  
  // Function to animate the dissolve transition - optimized for performance
  function animateDissolveTransition(direction, targetSection) {
    // Set animating flag to prevent multiple swipes
    animating = true;
    
    // Get the current menu image
    const menuSvg = document.querySelector('.menu-svg');
    if (!menuSvg) {
      // If no image, just navigate
      window.location.hash = '#' + targetSection;
      animating = false;
      return;
    }
    
    // Create a snapshot of the current image
    const snapshot = menuSvg.cloneNode(true);
    
    // Use getBoundingClientRect for more accurate positioning
    const rect = menuSvg.getBoundingClientRect();
    snapshot.style.position = 'absolute';
    snapshot.style.top = rect.top + 'px';
    snapshot.style.left = rect.left + 'px';
    snapshot.style.width = rect.width + 'px';
    snapshot.style.height = rect.height + 'px';
    snapshot.style.zIndex = '5';
    
    // Use transform for better performance
    snapshot.style.transform = 'translate3d(0,0,0)';
    snapshot.style.willChange = 'transform, opacity';
    
    // Add the snapshot to the container
    menuContainer.appendChild(snapshot);
    
    // Update horizontal navigation before changing the hash
    updateHorizontalNavForSwipe(targetSection);
    
    // Use requestAnimationFrame for smoother animations
    requestAnimationFrame(() => {
      // Add the appropriate dissolve-out class based on direction
      if (direction === 'next') {
        snapshot.classList.add('dissolve-next-out');
      } else {
        snapshot.classList.add('dissolve-prev-out');
      }
      
      // Navigate to the target section
      window.location.hash = '#' + targetSection;
    });
    
    // Listen for the hashchange event to complete the animation
    const hashChangeHandler = function() {
      // Remove the event listener
      window.removeEventListener('hashchange', hashChangeHandler);
      
      // Get the new menu image
      setTimeout(() => {
        const newMenuSvg = document.querySelector('.menu-svg');
        if (newMenuSvg) {
          // Prepare for animation
          newMenuSvg.style.willChange = 'transform, opacity';
          
          // Add the appropriate dissolve-in class based on direction
          requestAnimationFrame(() => {
            if (direction === 'next') {
              newMenuSvg.classList.add('dissolve-next-in');
            } else {
              newMenuSvg.classList.add('dissolve-prev-in');
            }
            
            // Remove the classes after animation completes
            setTimeout(() => {
              newMenuSvg.classList.remove('dissolve-next-in', 'dissolve-prev-in');
              newMenuSvg.style.willChange = 'auto';
              
              // Remove the snapshot
              if (snapshot.parentNode) {
                snapshot.parentNode.removeChild(snapshot);
              }
              
              // Reset animating flag
              animating = false;
              
              // Hide indicators
              const newLeftIndicator = document.querySelector('.swipe-indicator-left');
              const newRightIndicator = document.querySelector('.swipe-indicator-right');
              if (newLeftIndicator) newLeftIndicator.classList.remove('visible');
              if (newRightIndicator) newRightIndicator.classList.remove('visible');
              
              // Remove active classes
              const newMenuContainer = document.querySelector('.menu-container');
              if (newMenuContainer) {
                newMenuContainer.classList.remove('swipe-active-left', 'swipe-active-right');
              }
              
              // Reinitialize swipe for the new page
              setTimeout(initSwipeNavigation, 100);
            }, 500);
          });
        } else {
          // If no new image, just reset
          animating = false;
        }
      }, 50);
    };
    
    // Add the hashchange event listener
    window.addEventListener('hashchange', hashChangeHandler);
  }
  
  // Function to update horizontal navigation during swipe
  function updateHorizontalNavForSwipe(targetSection) {
    const horizontalNav = document.querySelector('.horizontal-nav');
    if (!horizontalNav) return;
    
    // Remove active class from all items
    const navItems = horizontalNav.querySelectorAll('.horizontal-nav-item');
    navItems.forEach(item => {
      item.classList.remove('active');
      
      // Get the href attribute and extract the section name
      const href = item.getAttribute('href');
      if (href && href === '#' + targetSection) {
        item.classList.add('active');
      }
    });
    
    // Get the active item
    const activeItem = horizontalNav.querySelector('.horizontal-nav-item.active');
    if (!activeItem) return;
    
    const navContainer = horizontalNav.querySelector('.nav-container');
    if (!navContainer) return;
    
    // Calculate scroll position to center the active item
    const itemRect = activeItem.getBoundingClientRect();
    const navRect = navContainer.getBoundingClientRect();
    const scrollLeft = activeItem.offsetLeft - (navRect.width / 2) + (itemRect.width / 2);
    
    // Use smooth scrolling for better UX
    navContainer.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    });
  }
  
  // Handle window resize
  window.addEventListener('resize', debounce(() => {
    // Update window width for calculations
    windowWidth = window.innerWidth;
    thresholdDistance = windowWidth * swipeThreshold;
  }, 100));
})();
