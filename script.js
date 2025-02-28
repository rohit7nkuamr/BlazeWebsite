/**
 * Simple Hash-Based Router for SPA.
 * Loads partial HTML files from the /pages/ folder based on the URL hash.
 */
const routes = {
  home: 'pages/home.html',
  'hours-location': 'pages/hours-location.html',
  about: 'pages/about.html',
  'order-online': 'pages/order-online.html',
  contact: 'pages/contact.html',

  // The "menu" route
  menu: 'pages/menu.html',

  // 8 actual menu pages
  'gourmet-burgers': 'pages/gourmet-burgers.html',
  wraps: 'pages/wraps.html',
  sides: 'pages/sides.html',
  pasta: 'pages/pasta.html',
  'main-course': 'pages/main-course.html',
  chinese: 'pages/chinese.html',
  'cold-beverages': 'pages/cold-beverages.html',
  'hot-beverages': 'pages/hot-beverages.html'
};

function loadContent() {
  let hash = window.location.hash.slice(1);

  // Default to 'home' if no hash
  if (!hash) {
    hash = 'home';
    window.location.hash = '#home';
  }

  // Fade out effect before loading new content
  const appElement = document.getElementById('app');
  appElement.style.opacity = '0';
  appElement.style.transform = 'translateY(10px)';

  // Normal routing with a slight delay for transition
  setTimeout(() => {
    const page = routes[hash] || routes['home'];
    fetch(page)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.text();
      })
      .then(html => {
        appElement.innerHTML = html;
        // Reset opacity and transform for fade-in effect
        setTimeout(() => {
          appElement.style.opacity = '1';
          appElement.style.transform = 'translateY(0)';
        }, 50);
        setActiveLink(hash);
        updateHorizontalNav();
        
        // Adjust SVG images if they exist
        adjustSvgImages();
      })
      .catch(error => {
        console.error('Error loading page:', error);
        appElement.innerHTML = '<p>Page not found.</p>';
        appElement.style.opacity = '1';
        appElement.style.transform = 'translateY(0)';
      });
  }, 100);
}

// Function to adjust SVG images to fill the available width
function adjustSvgImages() {
  const svgImages = document.querySelectorAll('.menu-svg');
  if (svgImages.length > 0) {
    svgImages.forEach(img => {
      // Ensure the image takes up the full width
      img.style.width = '100%';
      
      // Remove any height constraints
      img.style.maxHeight = 'none';
      
      // Maintain aspect ratio
      img.style.height = 'auto';
    });
  }
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

// horizontal nav highlight
function updateHorizontalNav() {
  const navLinks = document.querySelectorAll('.horizontal-nav-item');
  if (!navLinks.length) return;

  const hash = window.location.hash || '#gourmet-burgers';
  navLinks.forEach(link => link.classList.remove('active'));

  // highlight the link that matches the current hash
  const activeLink = document.querySelector(`.horizontal-nav-item[href="${hash}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
    
    // Scroll the active link into view with a slight offset
    setTimeout(() => {
      const horizNav = document.querySelector('.horizontal-nav');
      if (horizNav && activeLink) {
        // Calculate the scroll position to center the active link
        const linkRect = activeLink.getBoundingClientRect();
        const navRect = horizNav.getBoundingClientRect();
        const scrollLeft = activeLink.offsetLeft - (navRect.width / 2) + (linkRect.width / 2);
        
        // Smooth scroll to the position
        horizNav.scrollTo({
          left: Math.max(0, scrollLeft),
          behavior: 'smooth'
        });
      }
    }, 100);
  }
}

// Add a function to make horizontal nav scrollable with touch/mouse
function enableHorizontalDrag() {
  const horizNav = document.querySelector('.horizontal-nav');
  if (!horizNav) return;
  
  let isDown = false;
  let startX;
  let scrollLeft;
  
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

// Toggle side nav
const hamburger = document.querySelector('.hamburger');
const sideNav = document.querySelector('.side-nav');
hamburger.addEventListener('click', () => {
  sideNav.classList.toggle('open');
  hamburger.classList.toggle('active'); // Toggle active class for cross animation
});

// Close side nav when clicking outside
document.addEventListener('click', (e) => {
  if (!sideNav.contains(e.target) && !hamburger.contains(e.target) && sideNav.classList.contains('open')) {
    sideNav.classList.remove('open');
    hamburger.classList.remove('active');
  }
});

window.addEventListener('hashchange', loadContent);
document.addEventListener('DOMContentLoaded', () => {
  loadContent();
  
  // Add resize event listener to adjust SVG images when window is resized
  window.addEventListener('resize', adjustSvgImages);
  
  // Enable horizontal drag scrolling
  enableHorizontalDrag();
  
  // Handle scrollbar styling
  handleScrollbarStyling();
});

// Add transition styles to the app element
document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.getElementById('app');
  appElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
});
