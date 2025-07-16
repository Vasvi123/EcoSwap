let lastProduct = null;
let greenerAlternatives = [];
let userPoints = 0;

async function analyzeProduct(product) {
  if (!product || !product.name) return null;
  try {
    // Search Open Food Facts by product name
    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(product.name)}&search_simple=1&action=process&json=1&page_size=1`;
    const resp = await fetch(searchUrl);
    const data = await resp.json();
    if (data.products && data.products.length > 0) {
      const p = data.products[0];
      // Extract eco-score, nutri-score, image, etc.
      const impact = {
        ecoScore: p.ecoscore_grade ? p.ecoscore_grade.toUpperCase() : 'N/A',
        nutriScore: p.nutriscore_grade ? p.nutriscore_grade.toUpperCase() : 'N/A',
        carbonFootprint: p['carbon-footprint_100g'] ? p['carbon-footprint_100g'] + ' g CO2/100g' : 'N/A',
        packaging: p.packaging || 'N/A',
        labels: p.labels || 'N/A',
        image: p.image_front_url || '',
        productName: p.product_name || product.name,
        brand: p.brands || product.brand || '',
      };
      // Greener alternatives: suggest products with better eco-score if available
      let alternatives = [];
      if (impact.ecoScore && impact.ecoScore !== 'A') {
        // Try to find a product with ecoScore A
        const altUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(product.name)}&search_simple=1&action=process&json=1&page_size=5&fields=product_name,ecoscore_grade,brands,image_front_url`;
        const altResp = await fetch(altUrl);
        const altData = await altResp.json();
        alternatives = (altData.products || []).filter(a => a.ecoscore_grade && a.ecoscore_grade.toUpperCase() === 'A').map(a => ({
          name: a.product_name,
          brand: a.brands,
          image: a.image_front_url,
          reason: 'Eco-Score A',
        }));
      }
      return { impact, alternatives };
    }
    return { impact: { ecoScore: 'N/A', nutriScore: 'N/A', carbonFootprint: 'N/A', packaging: 'N/A', labels: 'N/A', image: '', productName: product.name, brand: product.brand }, alternatives: [] };
  } catch (e) {
    return { impact: { ecoScore: 'N/A', nutriScore: 'N/A', carbonFootprint: 'N/A', packaging: 'N/A', labels: 'N/A', image: '', productName: product.name, brand: product.brand }, alternatives: [] };
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'PRODUCT_INFO') {
    lastProduct = msg.product;
    // Analyze product using Open Food Facts
    analyzeProduct(msg.product).then(({ impact, alternatives }) => {
      lastProduct.impact = impact;
      greenerAlternatives = alternatives;
    });
  } else if (msg.type === 'GET_PRODUCT') {
    sendResponse({ product: lastProduct, alternatives: greenerAlternatives, points: userPoints });
  } else if (msg.type === 'ADD_TO_CART') {
    // Reward user if they pick a green alternative
    if (msg.product && msg.product.reason && msg.product.reason.includes('Eco-Score A')) {
      userPoints += 10;
    }
    sendResponse({ points: userPoints });
  } else if (msg.type === 'MANUAL_ANALYZE') {
    // Manual product analysis by name
    const manualProduct = { name: msg.name };
    analyzeProduct(manualProduct).then(({ impact, alternatives }) => {
      const product = { ...manualProduct, impact };
      sendResponse({ product, alternatives, points: userPoints });
    });
    return true; // Indicate async response
  }
}); 