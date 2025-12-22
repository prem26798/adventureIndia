/* ================================================================
   ADVENTURE INDIA - MAIN JAVASCRIPT
   ================================================================ */

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initializeNavigation();
  initializeSmoothScroll();
  initializeDestinationCards();
  initializeEventListeners();
});

/* ---- NAVIGATION ---- */
function initializeNavigation() {
  const navToggle = document.querySelector('.nav__toggle');
  const navMenu = document.querySelector('.nav__menu');
  const dropdowns = document.querySelectorAll('.nav__dropdown');

  // Mobile menu toggle
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // Desktop dropdown hover (keep open on hover)
  dropdowns.forEach(dropdown => {
    const menu = dropdown.querySelector('.nav__dropdown-menu');
    if (menu) {
      // Hover enter
      dropdown.addEventListener('mouseenter', () => {
        if (window.innerWidth > 768) {
          dropdown.classList.add('active');
        }
      });
      // Hover leave
      dropdown.addEventListener('mouseleave', () => {
        if (window.innerWidth > 768) {
          dropdown.classList.remove('active');
        }
      });
    }
  });

  // Mobile dropdown toggle (click to open/close)
  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.nav__link');
    if (toggle) {
      toggle.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          dropdown.classList.toggle('active');
          // Close other dropdowns
          dropdowns.forEach(other => {
            if (other !== dropdown) {
              other.classList.remove('active');
            }
          });
        }
      });
    }
  });

  // Close menu when clicking on a destination link
  const destinationLinks = document.querySelectorAll('.nav__dropdown-item');
  destinationLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
      }
      dropdowns.forEach(dropdown => {
        dropdown.classList.remove('active');
      });
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('nav')) {
      dropdowns.forEach(dropdown => {
        if (window.innerWidth <= 768) {
          dropdown.classList.remove('active');
        }
      });
    }
  });
}

/* ---- SMOOTH SCROLL ---- */
function initializeSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ---- DESTINATION CARDS ---- */
function initializeDestinationCards() {
  const cards = document.querySelectorAll('.destination-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.classList.add('hover');
    });
    card.addEventListener('mouseleave', function() {
      this.classList.remove('hover');
    });
  });
}

/* ---- EVENT LISTENERS ---- */
function initializeEventListeners() {
  // Add any additional event listeners here
  window.addEventListener('resize', handleResize);
}

function handleResize() {
  const navMenu = document.querySelector('.nav__menu');
  if (window.innerWidth > 768) {
    navMenu.classList.remove('active');
  }
}

/* ---- UTILITY FUNCTIONS ---- */
/**
 * Opens a URL in a new tab
 * @param {string} url - The URL to open
 */
function openNewTabUrl(url) {
  window.open(url, '_blank');
}

/**
 * Formats a date string to readable format
 * @param {string} dateString - Date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Truncates text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, length = 150) {
  return text.length > length ? text.substring(0, length) + '...' : text;
}

/**
 * Loads JSON data from a file
 * @param {string} filePath - Path to JSON file
 * @returns {Promise} Promise resolving to JSON data
 */
async function loadJSON(filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading JSON:', error);
    return null;
  }
}

/* ---- DYNAMIC CONTENT LOADER ---- */
/**
 * Dynamically loads and renders destination cards
 */
async function loadDestinations() {
  const container = document.getElementById('destinations-container');
  if (!container) return;

  const destinations = await loadJSON('data/destinations.json');
  if (!destinations) return;

  container.innerHTML = destinations.destinations.map(dest => `
    <div class="destination-card">
      <div class="destination-card__image-box">
        <img src="${dest.image}" alt="${dest.name}" class="destination-card__image">
      </div>
      <div class="destination-card__content">
        <h3 class="destination-card__title">${dest.name}</h3>
        <p class="destination-card__description">${dest.description}</p>
        <a href="#" class="destination-card__link" onclick="openNewTabUrl('${dest.airport.url}')">
          <i class="fas fa-map-marker-alt"></i> ${dest.airport.name}
        </a>
      </div>
    </div>
  `).join('');
}

/**
 * Dynamically loads and renders landmark cards
 */
async function loadLandmarks() {
  const container = document.getElementById('landmarks-container');
  if (!container) return;

  const data = await loadJSON('data/landmarks.json');
  if (!data) return;

  container.innerHTML = data.landmarks.map(landmark => `
    <div class="card">
      <img src="${landmark.image}" alt="${landmark.name}" class="card__image">
      <div class="card__body">
        <h3 class="card__title">${landmark.name}</h3>
        <p class="card__text">${landmark.description}</p>
        <div class="card__footer">
          <small>${landmark.location}</small>
        </div>
      </div>
    </div>
  `).join('');
}

/* ---- EXPORT FUNCTIONS ---- */
window.openNewTabUrl = openNewTabUrl;
window.loadDestinations = loadDestinations;
window.loadLandmarks = loadLandmarks;
