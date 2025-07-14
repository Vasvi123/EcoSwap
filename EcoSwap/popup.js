function renderProduct(product) {
  const el = document.getElementById('product');
  if (!product) {
    el.innerHTML = '<em>No product detected.</em>';
    return;
  }
  el.innerHTML = `<b>Product:</b> ${product.name || ''}<br><b>Brand:</b> ${product.brand || ''}<br><b>Price:</b> ${product.price || ''}`;
}

function renderImpact(impact) {
  const el = document.getElementById('impact');
  if (!impact) { el.innerHTML = ''; return; }
  el.innerHTML = `<b>Environmental Impact:</b><br>
    Carbon Footprint: ${impact.carbonFootprint}<br>
    Ethical Sourcing: ${impact.ethicalSourcing}<br>
    Local: ${impact.local}<br>
    Recycled: ${impact.recycled}`;
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

document.addEventListener('DOMContentLoaded', load);
window.addToCart = addToCart; 