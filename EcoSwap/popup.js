function renderProduct(product) {
  const el = document.getElementById('product');
  if (!product) {
    el.innerHTML = '<em>No product detected.</em>';
    return;
  }
  el.innerHTML =
    (product.image ? `<img src="${product.image}" alt="Product Image" style="max-width:100px;max-height:100px;display:block;margin-bottom:8px;">` : '') +
    `<b>Product:</b> ${product.name || ''}<br><b>Brand:</b> ${product.brand || ''}<br><b>Price:</b> ${product.price || ''}`;
}

function renderImpact(impact) {
  const el = document.getElementById('impact');
  if (!impact) { el.innerHTML = ''; return; }
  el.innerHTML = `<b>Environmental Impact:</b><br>
    Eco-Score: ${impact.ecoScore}<br>
    Nutri-Score: ${impact.nutriScore}<br>
    Carbon Footprint: ${impact.carbonFootprint}<br>
    Packaging: ${impact.packaging}<br>
    Labels: ${impact.labels}`;
}

function renderAlternatives(alts) {
  const el = document.getElementById('alternatives');
  if (!alts || !alts.length) { el.innerHTML = ''; return; }
  el.innerHTML = '<b>Greener Alternatives:</b><ul>' +
    alts.map((a, i) => `<li>${a.name} (${a.reason}) <button onclick="addToCart(${i})">Add to Cart</button></li>`).join('') + '</ul>';
}

function renderRewards(points) {
  document.getElementById('rewards').innerHTML = `<b>Rewards:</b> ${points} EcoPoints`;
}

function addToCart(idx) {
  chrome.runtime.sendMessage({ type: 'ADD_TO_CART', product: window._alts[idx] }, (resp) => {
    renderRewards(resp.points);
    alert('Added to cart! You earned EcoPoints!');
  });
}

function load() {
  chrome.runtime.sendMessage({ type: 'GET_PRODUCT' }, (resp) => {
    renderProduct(resp.product);
    renderImpact(resp.product?.impact);
    window._alts = resp.alternatives;
    renderAlternatives(resp.alternatives);
    renderRewards(resp.points);
  });
}

function manualSearch() {
  const name = document.getElementById('manualProductInput').value.trim();
  if (!name) return;
  // Send to background for analysis
  chrome.runtime.sendMessage({ type: 'MANUAL_ANALYZE', name }, (resp) => {
    renderProduct(resp.product);
    renderImpact(resp.product?.impact);
    window._alts = resp.alternatives;
    renderAlternatives(resp.alternatives);
    renderRewards(resp.points);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  load();
  document.getElementById('manualSearchBtn').addEventListener('click', manualSearch);
});
window.addToCart = addToCart; 