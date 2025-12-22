/* Visitor pages dynamic loader
   - Detect visitor type from pathname and region from ?region=
   - Load data/destinations.json and data/landmarks.json (and data/delhi.json when needed)
   - Render a professional grid of cards responsive for images
*/

async function loadVisitorPage() {
  const path = window.location.pathname;
  const filename = path.substring(path.lastIndexOf('/')+1).toLowerCase();
  let visitorKey = 'complete';
  if (filename.includes('weekend')) visitorKey = 'weekend';
  if (filename.includes('food')) visitorKey = 'food';
  if (filename.includes('adventure')) visitorKey = 'adventure';

  const params = new URLSearchParams(window.location.search);
  const regionParam = params.get('region') || 'north';
  const region = regionParam.charAt(0).toUpperCase() + regionParam.slice(1).toLowerCase();

  const container = document.getElementById('visitor-content');
  const hero = document.getElementById('visitor-hero');
  if (!container) return;

  const destData = await loadJSON('/data/destinations.json');
  const landData = await loadJSON('/data/landmarks.json');

  let items = [];
  if (destData && destData.destinations) {
    items = destData.destinations.filter(d => {
      if (!d.region) return false;
      return d.region.toLowerCase() === region.toLowerCase() || (region.toLowerCase() === 'north' && d.region.toLowerCase()==='central');
    });
  }

  // Special: include delhi landmarks when region is north and requested
  let delhiData = null;
  if (region.toLowerCase() === 'north') {
    try { delhiData = await loadJSON('/data/delhi.json'); } catch(e) { delhiData = null; }
  }

  // Choose items per visitor type
  let selected = [];
  if (visitorKey === 'weekend') {
    selected = items.slice(0, 4);
  } else if (visitorKey === 'food') {
    // heuristic: include destinations with "highlights" or those in southern regions for food
    selected = items.filter(d => (d.highlights && d.highlights.length>0)).slice(0, 8);
    if (selected.length === 0) selected = items.slice(0,6);
  } else if (visitorKey === 'adventure') {
    // heuristic: pick entries whose description contains adventure keywords
    const keywords = ['hike','hill','park','national','waterfall','adventure','river','mountain','trek'];
    selected = items.filter(d => keywords.some(k => d.description && d.description.toLowerCase().includes(k)) ).slice(0,8);
    if (selected.length===0) selected = items.slice(0,6);
  } else {
    // complete coverage
    selected = items.slice(0, 12);
  }

  // Build hero
  if (hero) {
    hero.querySelector('h1').textContent = `${capitalize(visitorKey)} — ${region}`;
    const heroImg = hero.querySelector('.hero__image img');
    if (selected[0] && selected[0].image) heroImg.src = selected[0].image;
  }

  // Render selected items
  container.innerHTML = selected.map(d => `
    <article class="visitor-card">
      <div class="visitor-card__media">
        <img src="${d.image}" alt="${escapeHtml(d.name)}">
      </div>
      <div class="visitor-card__body">
        <h3>${escapeHtml(d.name)}</h3>
        <p>${escapeHtml(truncateText(d.description || '', 160))}</p>
        <p class="visitor-meta"><strong>Best season:</strong> ${d.bestSeason || 'Year-round'}</p>
      </div>
    </article>
  `).join('');

  // If Delhi data exists and visitorKey is 'complete' or 'weekend', show Delhi landmarks below
  if (delhiData && (visitorKey === 'complete' || visitorKey === 'weekend')) {
    const delhiTitle = document.createElement('h2');
    delhiTitle.textContent = 'New Delhi Highlights';
    container.appendChild(delhiTitle);
    const grid = document.createElement('div');
    grid.className = 'cards-grid';
    grid.innerHTML = (delhiData.landmarks || []).map(l => `
      <div class="destination-card">
        <div class="destination-card__image-box"><img src="${l.image}" alt="${escapeHtml(l.name)}" class="destination-card__image"></div>
        <div class="destination-card__content">
          <h3 class="destination-card__title">${escapeHtml(l.name)}</h3>
          <p class="destination-card__description">${escapeHtml(truncateText(l.description||'', 140))}</p>
        </div>
      </div>
    `).join('');
    container.appendChild(grid);
  }
}

function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1); }
function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// Export small helpers for pages
window.loadVisitorPage = loadVisitorPage;

// Run on DOM ready if this script is included in visitor pages
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadVisitorPage);
} else {
  loadVisitorPage();
}
