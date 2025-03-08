const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'pages');
const menuPages = [
  'chinese.html',
  'cold-beverages.html',
  'hot-beverages.html',
  'main-course.html',
  'pasta.html',
  'sides.html',
  'wraps.html'
];

menuPages.forEach(page => {
  const filePath = path.join(pagesDir, page);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Extract the image source
  const imgMatch = content.match(/<img src="([^"]+)" alt="[^"]+" class="menu-content-img" \/>/);
  if (imgMatch) {
    const imgSrc = imgMatch[1];
    const altText = page.replace('.html', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // Find where the nav ends
    const navEndIndex = content.indexOf('</nav>') + 6;
    
    // Create new content with the menu container
    const newContent = content.substring(0, navEndIndex) + 
      `\n\n<div class="menu-container">\n  <img src="${imgSrc}" alt="${altText}" class="menu-svg" />\n</div>`;
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated ${page}`);
  } else {
    console.log(`No image found in ${page}`);
  }
});

// Also update the class for any existing menu-content-img to menu-svg
menuPages.forEach(page => {
  const filePath = path.join(pagesDir, page);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace menu-content-img with menu-svg
  const updatedContent = content.replace(/class="menu-content-img"/g, 'class="menu-svg"');
  
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent);
    console.log(`Updated class in ${page}`);
  }
});
