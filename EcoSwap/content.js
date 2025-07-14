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
    // Try to get product name from image alt as fallback
    let mainImage = document.querySelector('img.db[alt]');
    product.image = mainImage?.src;
    product.name = mainImage?.alt || '';
    // Brand and price selectors may need further refinement based on more HTML, so leave as undefined for now
    product.brand = undefined;
    product.price = undefined;
    // Try to extract product description (fallback to empty string)
    product.description = '';
  }
  console.log("EcoSwap content script running");
  console.log("Extracted product:", product);
  if (product.name) {
    chrome.runtime.sendMessage({type: 'PRODUCT_INFO', product});
  }
}

// Run on page load
window.addEventListener('load', extractProductInfo);
// Also try after DOM changes (for SPA)
setTimeout(extractProductInfo, 2000); 