
console.log("Hostname:", window.location.hostname);
var testMode = window.location.hostname != "orthogonaldevices.com";
if(testMode)
{
  console.log("TEST MODE: active");
}

var apiHost = "https://api.orthogonaldevices.com";
if(testMode)
{
  console.log("TEST MODE: using local apiHost");
  apiHost = "http://localhost:5000";
}

var apiCache = {
  inventory: null,
  prices: {
    "er-101-n": 66000,
    "er-101-pc": 66000,
    "er-101-of": 66000,
    "er-102-n": 49000,
    "er-102-pc": 49000,
    "er-102-of": 49000,
    "er-301-n": 99000,
    "er-301-pc": 99000,
    "er-301-of": 99000,
  }
};

function getInventory(product) {
  if (apiCache.prices == null || apiCache.inventory == null) {
    return 0;
  }
  return apiCache.inventory[product];
}

function getPrice(product) {
  if (apiCache.prices == null) {
    return null;
  }
  return apiCache.prices[product];
}

function formatPrice(number, prefix = 'code') {
  if (number == null) {
    return "";
  }
  return number.toLocaleString('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    currencyDisplay: prefix,
    useGrouping: true
  });
}

function clearCart() {
  sessionStorage.removeItem("cart");
  console.log("Cart cleared.")
}

function isCartEmpty() {
  let data = sessionStorage.getItem("cart");
  if (data == null) {
    return true;
  }
  let cart = JSON.parse(data);
  return cart.items.length == 0;
}

function getCart() {
  let data = sessionStorage.getItem("cart");
  if (data == null) {
    return {
      items: [],
    }
  }
  let cart = JSON.parse(data);
  let tmp = JSON.parse(data);
  tmp.items.forEach(p => {
    if (getInventory(p) < 1) {
      cart.items = cart.items.filter(e => e !== p);
    }
  });
  return cart;
}

function setCart(cart) {
  sessionStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(product) {
  var cart = getCart();
  cart.items.push(product);
  setCart(cart);
}

function removeFromCart(product) {
  let cart = getCart();
  console.log("Remove " + product + " from cart.")
  cart.items = cart.items.filter(e => e !== product);
  setCart(cart);
  return cart.items.length;
}

function sellCart() {
  let data = sessionStorage.getItem("ordered");
  if (data == null) {
    return;
  }

  let cart = JSON.parse(data);
  if (cart.items.length == 0) {
    return;
  }

  cart.items.forEach(p => {
    fetch('/sell/' + p)
      //fetch('http://localhost:5000/sell/'+p)
      .then(response => console.log('sell', p, response));
  });

  sessionStorage.removeItem("ordered");
  clearCart();
}

function onInventory(data, after) {
  console.log("inventory", data);
  apiCache.inventory = data;
  if (after != null) {
    after();
  }
}

function onPrices(data, after) {
  console.log("prices", data);
  apiCache.prices = data;
  if (after != null) {
    after();
  }
}

function refreshInventory(after) {
  fetch(apiHost+'/stock')
    .then(response => response.json())
    .then(data => onInventory(data, after));
}

function refreshPrices(after) {
  fetch(apiHost+'/prices')
    .then(response => response.json())
    .then(data => onPrices(data, after));
}
