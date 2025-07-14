// Content script for EcoSwap
function extractProductInfo() {
  let product = {};
  if (window.location.hostname.includes('amazon')) {
    product.name = document.getElementById('productTitle')?.innerText.trim();
    product.brand = document.getElementById('bylineInfo')?.innerText.trim();
    product.price = document.querySelector('#priceblock_ourprice, #priceblock_dealprice')?.innerText.trim();
  } else if (window.location.hostname.includes('flipkart')) {
    product.name = document.querySelector('span.B_NuCI')?.innerText.trim();
    product.brand = document.querySelector('a._2whKao')?.innerText.trim();
    product.price = document.querySelector('div._30jeq3._16Jk6d')?.innerText.trim();
  } else if (window.location.hostname.includes('walmart')) {
    product.name = document.querySelector('h1.prod-ProductTitle, h1[data-automation-id="product-title"]')?.innerText.trim();
    product.brand = document.querySelector('a.prod-brandName, a[data-automation-id="brand-link"]')?.innerText.trim();
    product.price = document.querySelector('span.price-characteristic, span[data-automation-id="product-price"]')?.innerText.trim();
  }
  if (product.name) {
    chrome.runtime.sendMessage({type: 'PRODUCT_INFO', product});
  }
}

// Run on page load
window.addEventListener('load', extractProductInfo);
// Also try after DOM changes (for SPA)
setTimeout(extractProductInfo, 2000); 