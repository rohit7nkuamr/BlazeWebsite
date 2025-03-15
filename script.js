/**
 * Simple Hash-Based Router for SPA.
 * Loads partial HTML files from the /pages/ folder based on the URL hash.
 */
const routes = {
  home: 'pages/home.html',
  'hours-location': 'pages/hours-location.html',
  about: 'pages/about.html',
  'order-online': 'pages/order-online.html',
  contact: 'pages/contact.html',  // Make sure this exists
  menu: 'pages/menu.html',
  'gourmet-burgers': 'pages/gourmet-burgers.html',
  wraps: 'pages/wraps.html',
  sides: 'pages/sides.html',
  pasta: 'pages/pasta.html',
  'main-course': 'pages/main-course.html',
  chinese: 'pages/chinese.html',
  'cold-beverages': 'pages/cold-beverages.html',
  'hot-beverages': 'pages/hot-beverages.html'
};

// Preload common assets to improve page load times
function preloadAssets() {
  // List of common assets to preload
  const commonAssets = [
    'assets/menu/GOURMET BURGERS.svg',
    'assets/menu/WRAPS.svg',
    'assets/menu/SIDES.svg',
    'assets/menu/PASTA.svg',
    'assets/menu/MAIN COURSE.svg',
    'assets/menu/CHINESE.svg',
    'assets/menu/COLD BEVERAGES.svg',
    'assets/menu/HOT BEVERAGES.svg',
    'assets/Blaze PNG 3.svg',
    'assets/About.svg'
  ];
  
  // Create image objects to preload
  commonAssets.forEach(src => {
    const img = new Image();
    img.src = src;
  });
}

// Debounce function to limit function calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function loadContent() {
  let hash = window.location.hash.slice(1);

  // Default to 'home' if no hash
  if (!hash) {
    hash = 'home';
    window.location.hash = '#home';
  }
  
  // Get the app element
  const appElement = document.getElementById('app');
  
  // Save scroll position before page change
  const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  sessionStorage.setItem('scrollPosition', scrollPosition);
  
  // Fade out effect before loading new content
  appElement.style.opacity = '0';
  appElement.style.transform = 'translateY(-50px)';

  // Normal routing with a slight delay for transition
  setTimeout(() => {
    const page = routes[hash] || routes['home'];
    fetch(page, { cache: 'no-store' }) // Prevent caching issues
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.text();
      })
      .then(html => {
        appElement.innerHTML = html;
        
        // Reset opacity and transform for fade-in effect
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            appElement.style.opacity = '1';
            appElement.style.transform = 'translateY(0)';
          });
        });
        
        setActiveLink(hash);
        updateHorizontalNav();
        
        // Adjust SVG images if they exist
        adjustSvgImages();
        setupLazyLoadingIframes(); // Call lazy loading setup after page load
        
        // Restore scroll position if needed
        if (hash === 'home') {
          window.scrollTo(0, 0);
        } else {
          const savedPosition = sessionStorage.getItem('scrollPosition');
          if (savedPosition) {
            window.scrollTo(0, parseInt(savedPosition));
          }
        }
      })
      .catch(error => {
        console.error('Error loading page:', error);
        appElement.innerHTML = '<p>Page not found. <a href="#home">Return to Home</a></p>';
        appElement.style.opacity = '1';
        appElement.style.transform = 'translateY(0)';
      });
  }, 100);
}

// Function to adjust SVG images to fill the available width
function adjustSvgImages() {
  // Use requestAnimationFrame for better performance
  requestAnimationFrame(() => {
    // Adjust About.svg specifically
    const aboutSvg = document.querySelector('img[src="assets/About.svg"]');
    if (aboutSvg) {
      aboutSvg.style.width = '100%';
      aboutSvg.style.maxWidth = '430px';
      aboutSvg.style.objectFit = 'contain';
      aboutSvg.style.display = 'block';
      aboutSvg.style.margin = '0 auto';
    }
    
    // Adjust all menu SVGs
    const menuSvgs = document.querySelectorAll('.menu-svg');
    menuSvgs.forEach(svg => {
      if (svg) {
        svg.style.maxWidth = '100%';
        svg.style.height = 'auto';
        svg.style.display = 'block';
        svg.style.margin = '0 auto';
      }
    });
  });
}

// highlight side nav links
function setActiveLink(hash) {
  const navItems = document.querySelectorAll('.side-nav a');
  navItems.forEach(link => {
    if (link.getAttribute('href') === '#' + hash) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Optimize the updateHorizontalNav function
const updateHorizontalNav = debounce(function() {
  const horizontalNav = document.querySelector('.horizontal-nav');
  if (!horizontalNav) return;
  
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
}, 50);

// Add a function to enable haptic feedback during horizontal navigation scrolling
function enableHapticScrollFeedback() {
  const navContainer = document.querySelector('.nav-container');
  if (!navContainer || !('vibrate' in navigator)) return;
  
  // Get all navigation items including dots
  const allItems = navContainer.querySelectorAll('.horizontal-nav-item, .nav-dot');
  if (allItems.length === 0) return;
  
  // Store the last item that triggered haptic feedback to avoid repeated triggers
  let lastTriggeredItem = null;
  
  // Track scroll position to determine direction
  let lastScrollLeft = navContainer.scrollLeft;
  
  // Add momentum scrolling resistance
  navContainer.style.scrollSnapType = 'x mandatory';
  
  // Make all items snap points
  allItems.forEach(item => {
    item.style.scrollSnapAlign = 'center';
  });
  
  // Create an IntersectionObserver to detect when items are centered in view
  const options = {
    root: navContainer,
    rootMargin: '0px',
    threshold: 0.75 // Trigger when item is 75% visible
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Only trigger for items that are becoming visible and are different from the last triggered item
      if (entry.isIntersecting && entry.target !== lastTriggeredItem) {
        // Determine scroll direction
        const scrollDirection = navContainer.scrollLeft > lastScrollLeft ? 'right' : 'left';
        lastScrollLeft = navContainer.scrollLeft;
        
        // Store this item as the last triggered
        lastTriggeredItem = entry.target;
        
        // Provide haptic feedback
        if (entry.target.classList.contains('horizontal-nav-item')) {
          // Stronger vibration for menu items
          navigator.vibrate(20);
          
          // Navigate to this section
          const href = entry.target.getAttribute('href');
          if (href && href.startsWith('#')) {
            window.location.hash = href.substring(1);
          }
        } else if (entry.target.classList.contains('nav-dot')) {
          // Lighter vibration for dots
          navigator.vibrate(10);
          
          // Find the next menu item after this dot and navigate to it
          let nextItem = entry.target.nextElementSibling;
          while (nextItem && !nextItem.classList.contains('horizontal-nav-item')) {
            nextItem = nextItem.nextElementSibling;
          }
          
          if (nextItem) {
            const href = nextItem.getAttribute('href');
            if (href && href.startsWith('#')) {
              window.location.hash = href.substring(1);
            }
          }
        }
        
        // Add a visual pulse effect
        entry.target.classList.add('scroll-pulse');
        setTimeout(() => {
          entry.target.classList.remove('scroll-pulse');
        }, 300);
      }
    });
  }, options);
  
  // Observe all items
  allItems.forEach(item => observer.observe(item));
  
  // Also add touch event listeners for more responsive feedback
  let touchScrolling = false;
  let lastTouchX = 0;
  let touchStartTime = 0;
  let touchVelocity = 0;
  
  navContainer.addEventListener('touchstart', (e) => {
    touchScrolling = true;
    lastTouchX = e.touches[0].clientX;
    lastScrollLeft = navContainer.scrollLeft;
    touchStartTime = Date.now();
    touchVelocity = 0;
  }, { passive: true });
  
  navContainer.addEventListener('touchmove', (e) => {
    if (!touchScrolling) return;
    
    const touchX = e.touches[0].clientX;
    const touchDiff = touchX - lastTouchX;
    const timeDiff = Date.now() - touchStartTime;
    
    // Calculate velocity (pixels per millisecond)
    if (timeDiff > 0) {
      touchVelocity = touchDiff / timeDiff;
    }
    
    // If significant movement detected
    if (Math.abs(touchDiff) > 10) {
      // Find the item currently in the center of the view
      const containerCenter = navContainer.getBoundingClientRect().left + navContainer.offsetWidth / 2;
      
      // Find the closest item to the center
      let closestItem = null;
      let closestDistance = Infinity;
      
      allItems.forEach(item => {
        const itemRect = item.getBoundingClientRect();
        const itemCenter = itemRect.left + itemRect.width / 2;
        const distance = Math.abs(containerCenter - itemCenter);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestItem = item;
        }
      });
      
      // If we found a closest item and it's different from the last triggered
      if (closestItem && closestItem !== lastTriggeredItem && closestDistance < 30) {
        lastTriggeredItem = closestItem;
        
        // Provide haptic feedback based on item type
        if (closestItem.classList.contains('horizontal-nav-item')) {
          // Stronger vibration for menu items
          navigator.vibrate(20);
          
          // Navigate to this section if scrolling fast enough
          if (Math.abs(touchVelocity) > 0.5) {
            const href = closestItem.getAttribute('href');
            if (href && href.startsWith('#')) {
              window.location.hash = href.substring(1);
            }
          }
        } else if (closestItem.classList.contains('nav-dot')) {
          navigator.vibrate(10);
          
          // Navigate to next section if scrolling fast enough
          if (Math.abs(touchVelocity) > 0.5) {
            let nextItem = closestItem.nextElementSibling;
            while (nextItem && !nextItem.classList.contains('horizontal-nav-item')) {
              nextItem = nextItem.nextElementSibling;
            }
            
            if (nextItem) {
              const href = nextItem.getAttribute('href');
              if (href && href.startsWith('#')) {
                window.location.hash = href.substring(1);
              }
            }
          }
        }
        
        // Add visual feedback
        closestItem.classList.add('scroll-pulse');
        setTimeout(() => {
          closestItem.classList.remove('scroll-pulse');
        }, 300);
      }
      
      lastTouchX = touchX;
      touchStartTime = Date.now();
    }
  }, { passive: true });
  
  navContainer.addEventListener('touchend', () => {
    touchScrolling = false;
  }, { passive: true });
}

// Setup lazy loading for iframes to improve performance
function setupLazyLoadingIframes() {
  // Only load iframes when they're in the viewport
  const iframes = document.querySelectorAll('iframe[data-src]');
  
  if (iframes.length === 0) return;
  
  const lazyLoadIframe = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const iframe = entry.target;
        iframe.src = iframe.dataset.src;
        iframe.removeAttribute('data-src');
        observer.unobserve(iframe);
      }
    });
  };
  
  const iframeObserver = new IntersectionObserver(lazyLoadIframe, {
    rootMargin: '200px 0px', // Load iframe when it's within 200px of viewport
    threshold: 0.01
  });
  
  iframes.forEach(iframe => {
    iframeObserver.observe(iframe);
  });
}

// Preload images for faster loading
function preloadImages() {
  const images = document.querySelectorAll('img[data-src]');
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(image => imageObserver.observe(image));
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    images.forEach(image => {
      image.src = image.dataset.src;
      image.removeAttribute('data-src');
    });
  }
}

// Function to enable haptic feedback for horizontal scrolling with iPhone dock-like behavior
function enableHapticScrollFeedback() {
  const navContainer = document.querySelector('.nav-container');
  if (!navContainer) return;
  
  // Create edge indicators
  const leftIndicator = document.createElement('div');
  leftIndicator.className = 'edge-indicator left';
  
  const rightIndicator = document.createElement('div');
  rightIndicator.className = 'edge-indicator right';
  
  const horizontalNav = document.querySelector('.horizontal-nav');
  horizontalNav.appendChild(leftIndicator);
  horizontalNav.appendChild(rightIndicator);
  
  let lastScrollLeft = navContainer.scrollLeft;
  let lastItemTriggered = null;
  let scrollVelocity = 0;
  let lastScrollTime = 0;
  let isAtLeftEdge = true;
  let isAtRightEdge = false;
  
  // Check if we can use the vibration API
  const canVibrate = 'vibrate' in navigator;
  
  // Set up IntersectionObserver to detect when nav items are in view
  const navItems = document.querySelectorAll('.horizontal-nav-item, .nav-dot');
  const options = {
    root: navContainer,
    rootMargin: '0px',
    threshold: 0.6 // Trigger when 60% of the item is visible
  };
  
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.target !== lastItemTriggered && Math.abs(scrollVelocity) > 0.5) {
        const isNavDot = entry.target.classList.contains('nav-dot');
        
        // Apply scroll pulse animation
        entry.target.classList.add('scroll-pulse');
        setTimeout(() => {
          entry.target.classList.remove('scroll-pulse');
        }, 300);
        
        // Haptic feedback
        if (canVibrate) {
          // Different vibration patterns for nav items vs dots
          if (isNavDot) {
            navigator.vibrate(10);
          } else {
            navigator.vibrate(20);
          }
        }
        
        // Store the last triggered item to prevent repeated triggers
        lastItemTriggered = entry.target;
        
        // If it's a nav dot and we're scrolling fast enough, navigate to the corresponding section
        if (isNavDot && Math.abs(scrollVelocity) > 0.8) {
          const dotIndex = Array.from(document.querySelectorAll('.nav-dot')).indexOf(entry.target);
          const menuSections = document.querySelectorAll('.menu-section');
          if (menuSections[dotIndex]) {
            menuSections[dotIndex].scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  }, options);
  
  // Observe all nav items
  navItems.forEach(item => {
    navObserver.observe(item);
  });
  
  // Track scroll events for velocity calculation and edge detection
  navContainer.addEventListener('scroll', () => {
    const now = performance.now();
    const dt = now - lastScrollTime;
    
    if (dt > 0) {
      // Calculate scroll velocity in pixels per millisecond
      scrollVelocity = (navContainer.scrollLeft - lastScrollLeft) / dt;
      
      // Check if we're at the edges
      const newIsAtLeftEdge = navContainer.scrollLeft <= 10;
      const newIsAtRightEdge = navContainer.scrollLeft >= (navContainer.scrollWidth - navContainer.clientWidth - 10);
      
      // Trigger edge haptic feedback and visual indicators
      if (newIsAtLeftEdge !== isAtLeftEdge) {
        isAtLeftEdge = newIsAtLeftEdge;
        if (isAtLeftEdge && scrollVelocity < -0.3) {
          // Left edge reached with significant velocity
          if (canVibrate) navigator.vibrate(30);
          leftIndicator.classList.add('visible');
          setTimeout(() => leftIndicator.classList.remove('visible'), 500);
        }
      }
      
      if (newIsAtRightEdge !== isAtRightEdge) {
        isAtRightEdge = newIsAtRightEdge;
        if (isAtRightEdge && scrollVelocity > 0.3) {
          // Right edge reached with significant velocity
          if (canVibrate) navigator.vibrate(30);
          rightIndicator.classList.add('visible');
          setTimeout(() => rightIndicator.classList.remove('visible'), 500);
        }
      }
    }
    
    lastScrollLeft = navContainer.scrollLeft;
    lastScrollTime = now;
  });
  
  // Touch events for better mobile experience
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartTime = 0;
  
  navContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartTime = performance.now();
  }, { passive: true });
  
  navContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const touchEndTime = performance.now();
    const touchDuration = touchEndTime - touchStartTime;
    
    // Calculate swipe velocity
    const touchDistance = touchEndX - touchStartX;
    const touchVelocity = Math.abs(touchDistance / touchDuration);
    
    // If it was a fast swipe, trigger haptic feedback
    if (touchVelocity > 1.0) {
      if (canVibrate) navigator.vibrate(15);
      
      // Show edge indicators for fast swipes
      if (touchDistance < 0 && !isAtRightEdge) {
        rightIndicator.classList.add('visible');
        setTimeout(() => rightIndicator.classList.remove('visible'), 500);
      } else if (touchDistance > 0 && !isAtLeftEdge) {
        leftIndicator.classList.add('visible');
        setTimeout(() => leftIndicator.classList.remove('visible'), 500);
      }
    }
  }, { passive: true });
}

// Add a function to make horizontal nav scrollable with touch/mouse
function enableHorizontalDrag() {
  const horizNav = document.querySelector('.horizontal-nav');
  if (!horizNav) return;
  
  let isDown = false;
  let startX;
  let scrollLeft;
  
  // Add haptic feedback to navigation items
  const navItems = horizNav.querySelectorAll('.horizontal-nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Provide haptic feedback when clicking on navigation items
      if ('vibrate' in navigator) {
        navigator.vibrate(20);
      }
    });
  });
  
  // Add dots between menu items for visual separation and haptic feedback
  const navContainer = horizNav.querySelector('.nav-container');
  if (navContainer) {
    // First, remove any existing dots to avoid duplicates
    const existingDots = navContainer.querySelectorAll('.nav-dot');
    existingDots.forEach(dot => dot.remove());
    
    // Add dots between menu items
    const items = Array.from(navContainer.querySelectorAll('.horizontal-nav-item'));
    for (let i = 0; i < items.length - 1; i++) {
      const dot = document.createElement('span');
      dot.className = 'nav-dot';
      dot.innerHTML = '•';
      
      // Insert the dot after the current item
      if (items[i].nextSibling) {
        navContainer.insertBefore(dot, items[i].nextSibling);
      } else {
        navContainer.appendChild(dot);
      }
      
      // Add haptic feedback to dots
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        // Provide stronger haptic feedback for dots
        if ('vibrate' in navigator) {
          navigator.vibrate([10, 30, 10]);
        }
      });
    }
  }
  
  horizNav.addEventListener('mousedown', (e) => {
    isDown = true;
    horizNav.style.cursor = 'grabbing';
    startX = e.pageX - horizNav.offsetLeft;
    scrollLeft = horizNav.scrollLeft;
  });
  
  horizNav.addEventListener('mouseleave', () => {
    isDown = false;
    horizNav.style.cursor = 'grab';
  });
  
  horizNav.addEventListener('mouseup', () => {
    isDown = false;
    horizNav.style.cursor = 'grab';
  });
  
  horizNav.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - horizNav.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    horizNav.scrollLeft = scrollLeft - walk;
  });
}

// Add a function to handle scrollbar styling based on browser support
function handleScrollbarStyling() {
  const horizNav = document.querySelector('.horizontal-nav');
  if (!horizNav) return;
  
  // Check if the user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // If the user doesn't prefer reduced motion, add the hide-scrollbar class
  if (!prefersReducedMotion) {
    horizNav.classList.add('hide-scrollbar');
  }
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initial content load
  loadContent();
  
  // Preload assets
  preloadAssets();
  
  // Preload images
  preloadImages();
  
  // Apply Firefox scrollbar hiding if supported
  applyScrollbarHiding();
  
  // Set up side navigation
  const hamburger = document.querySelector('.hamburger');
  const sideNav = document.querySelector('.side-nav');
  
  // Toggle side nav
  hamburger.addEventListener('click', () => {
    sideNav.classList.toggle('open');
    hamburger.classList.toggle('active'); // Toggle active class for cross animation
  });
  
  // Close side nav when clicking navigation links
  document.querySelectorAll('.side-nav a').forEach(link => {
    link.addEventListener('click', () => {
      // Don't close for phone number links
      if (!link.getAttribute('href').startsWith('tel:')) {
        sideNav.classList.remove('open');
        hamburger.classList.remove('active');
      }
    });
  });
  
  // Close side nav when clicking outside
  document.addEventListener('click', (e) => {
    if (!sideNav.contains(e.target) && !hamburger.contains(e.target) && sideNav.classList.contains('open')) {
      sideNav.classList.remove('open');
      hamburger.classList.remove('active');
    }
  });
  
  // Enable service worker for caching
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, function(err) {
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }
  
  // Add resize event listener to adjust SVG images when window is resized
  window.addEventListener('resize', debounce(() => {
    adjustSvgImages();
    updateHorizontalNav();
  }, 100));
  
  // Enable horizontal drag scrolling
  enableHorizontalDrag();
  
  // Handle scrollbar styling
  handleScrollbarStyling();
  
  // Initialize haptic scroll feedback
  setTimeout(enableHapticScrollFeedback, 500);
});

// Re-initialize haptic feedback when hash changes
window.addEventListener('hashchange', function() {
  // Wait for the content to load before initializing
  setTimeout(enableHapticScrollFeedback, 500);
});

// Handle hash changes
window.addEventListener('hashchange', loadContent);

// Add transition styles to the app element
document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.getElementById('app');
  if (appElement) {
    appElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  }
  
  // Call the lazy loading setup function when content is loaded
  setupLazyLoadingIframes();
});

// Function to enable haptic feedback for horizontal scrolling with iPhone dock-like behavior
function enableHapticScrollFeedback() {
  const navContainer = document.querySelector('.nav-container');
  if (!navContainer) return;
  
  // Create edge indicators
  const leftIndicator = document.createElement('div');
  leftIndicator.className = 'edge-indicator left';
  
  const rightIndicator = document.createElement('div');
  rightIndicator.className = 'edge-indicator right';
  
  const horizontalNav = document.querySelector('.horizontal-nav');
  horizontalNav.appendChild(leftIndicator);
  horizontalNav.appendChild(rightIndicator);
  
  let lastScrollLeft = navContainer.scrollLeft;
  let lastItemTriggered = null;
  let scrollVelocity = 0;
  let lastScrollTime = 0;
  let isAtLeftEdge = true;
  let isAtRightEdge = false;
  
  // Check if we can use the vibration API
  const canVibrate = 'vibrate' in navigator;
  
  // Set up IntersectionObserver to detect when nav items are in view
  const navItems = document.querySelectorAll('.horizontal-nav-item, .nav-dot');
  const options = {
    root: navContainer,
    rootMargin: '0px',
    threshold: 0.6 // Trigger when 60% of the item is visible
  };
  
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.target !== lastItemTriggered && Math.abs(scrollVelocity) > 0.5) {
        const isNavDot = entry.target.classList.contains('nav-dot');
        
        // Apply scroll pulse animation
        entry.target.classList.add('scroll-pulse');
        setTimeout(() => {
          entry.target.classList.remove('scroll-pulse');
        }, 300);
        
        // Haptic feedback
        if (canVibrate) {
          // Different vibration patterns for nav items vs dots
          if (isNavDot) {
            navigator.vibrate(10);
          } else {
            navigator.vibrate(20);
          }
        }
        
        // Store the last triggered item to prevent repeated triggers
        lastItemTriggered = entry.target;
        
        // If it's a nav dot and we're scrolling fast enough, navigate to the corresponding section
        if (isNavDot && Math.abs(scrollVelocity) > 0.8) {
          const dotIndex = Array.from(document.querySelectorAll('.nav-dot')).indexOf(entry.target);
          const menuSections = document.querySelectorAll('.menu-section');
          if (menuSections[dotIndex]) {
            menuSections[dotIndex].scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  }, options);
  
  // Observe all nav items
  navItems.forEach(item => {
    navObserver.observe(item);
  });
  
  // Track scroll events for velocity calculation and edge detection
  navContainer.addEventListener('scroll', () => {
    const now = performance.now();
    const dt = now - lastScrollTime;
    
    if (dt > 0) {
      // Calculate scroll velocity in pixels per millisecond
      scrollVelocity = (navContainer.scrollLeft - lastScrollLeft) / dt;
      
      // Check if we're at the edges
      const newIsAtLeftEdge = navContainer.scrollLeft <= 10;
      const newIsAtRightEdge = navContainer.scrollLeft >= (navContainer.scrollWidth - navContainer.clientWidth - 10);
      
      // Trigger edge haptic feedback and visual indicators
      if (newIsAtLeftEdge !== isAtLeftEdge) {
        isAtLeftEdge = newIsAtLeftEdge;
        if (isAtLeftEdge && scrollVelocity < -0.3) {
          // Left edge reached with significant velocity
          if (canVibrate) navigator.vibrate(30);
          leftIndicator.classList.add('visible');
          setTimeout(() => leftIndicator.classList.remove('visible'), 500);
        }
      }
      
      if (newIsAtRightEdge !== isAtRightEdge) {
        isAtRightEdge = newIsAtRightEdge;
        if (isAtRightEdge && scrollVelocity > 0.3) {
          // Right edge reached with significant velocity
          if (canVibrate) navigator.vibrate(30);
          rightIndicator.classList.add('visible');
          setTimeout(() => rightIndicator.classList.remove('visible'), 500);
        }
      }
    }
    
    lastScrollLeft = navContainer.scrollLeft;
    lastScrollTime = now;
  });
  
  // Touch events for better mobile experience
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartTime = 0;
  
  navContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartTime = performance.now();
  }, { passive: true });
  
  navContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const touchEndTime = performance.now();
    const touchDuration = touchEndTime - touchStartTime;
    
    // Calculate swipe velocity
    const touchDistance = touchEndX - touchStartX;
    const touchVelocity = Math.abs(touchDistance / touchDuration);
    
    // If it was a fast swipe, trigger haptic feedback
    if (touchVelocity > 1.0) {
      if (canVibrate) navigator.vibrate(15);
      
      // Show edge indicators for fast swipes
      if (touchDistance < 0 && !isAtRightEdge) {
        rightIndicator.classList.add('visible');
        setTimeout(() => rightIndicator.classList.remove('visible'), 500);
      } else if (touchDistance > 0 && !isAtLeftEdge) {
        leftIndicator.classList.add('visible');
        setTimeout(() => leftIndicator.classList.remove('visible'), 500);
      }
    }
  }, { passive: true });
}

// Apply scrollbar hiding based on browser support
function applyScrollbarHiding() {
  // Test for Firefox scrollbar-width support
  const style = document.createElement('style');
  try {
    style.appendChild(document.createTextNode(':root{scrollbar-width:none}'));
    document.head.appendChild(style);
    const isScrollbarWidthSupported = getComputedStyle(document.documentElement).scrollbarWidth === 'none';
    document.head.removeChild(style);
    
    if (isScrollbarWidthSupported) {
      // Apply the class only if scrollbar-width is supported
      const navContainers = document.querySelectorAll('.nav-container');
      navContainers.forEach(container => {
        container.classList.add('no-scrollbar');
      });
    }
  } catch (e) {
    // If there's an error, the property is not supported
    console.log('scrollbar-width not supported in this browser');
  }
}

document.getElementById('contactForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const formData = new FormData(this);
  
  try {
    const response = await fetch('/api/contact/submit/', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (response.ok) {
      alert(data.message);
      this.reset();
    } else {
      alert(data.message || 'There was an error submitting your message. Please try again.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('There was an error submitting your message. Please try again.');
  }
});
