let lastProduct = null;
let greenerAlternatives = [];
let userPoints = 0;

function analyzeProduct(product) {
  // Mock analysis: randomize impact and alternatives
  const impact = {
    carbonFootprint: Math.floor(Math.random() * 100) + ' kg CO2',
    ethicalSourcing: Math.random() > 0.5 ? 'Yes' : 'No',
    local: Math.random() > 0.5 ? 'Yes' : 'No',
    recycled: Math.random() > 0.5 ? 'Yes' : 'No',
  };
  // Mock alternatives
  greenerAlternatives = [
    { name: product.name + ' (Eco)', brand: product.brand, price: product.price, reason: 'Recycled materials' },
    { name: product.name + ' (Local)', brand: 'Local Brand', price: product.price, reason: 'Locally made' }
  ];
  return impact;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'PRODUCT_INFO') {
    lastProduct = msg.product;
    lastProduct.impact = analyzeProduct(msg.product);
    // Optionally, notify popup
  } else if (msg.type === 'GET_PRODUCT') {
    sendResponse({ product: lastProduct, alternatives: greenerAlternatives, points: userPoints });
  } else if (msg.type === 'ADD_TO_CART') {
    // Reward user if they pick a green alternative
    if (msg.product && msg.product.name && msg.product.name.includes('(Eco)')) {
      userPoints += 10;
    }
    sendResponse({ points: userPoints });
  }
}); 