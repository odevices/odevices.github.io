
console.log("Hostname:", window.location.hostname);

export var testMode = window.location.hostname != "www.orthogonaldevices.com";
if (testMode) {
  console.log("TEST MODE: active");
}

var apiHost = "https://api.orthogonaldevices.com";
if (testMode) {
  console.log("TEST MODE: using local apiHost");
  apiHost = "http://localhost:5000";
}

var apiCache = {
  cart: null,
  inStock: null,
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
  },

};

var noShippingTo = [
  'AU', // Australia
  'CA', // Canada
  'GR', // Greece
  'SK', // Slovakia
  'RO', // Romania
  'RU', // Russia
];

export function canShipTo(country) {
  return !noShippingTo.includes(country);
}

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

function uuidv4_unsafe() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function overrideApiKey(key) {
  if (key == null) {
    sessionStorage.removeItem("apiKeyOverride");
  } else {
    sessionStorage.setItem("apiKeyOverride", key);
  }
}

export function getApiKey() {
  let key = sessionStorage.getItem("apiKeyOverride");
  if (key == null) {
    key = localStorage.getItem("apiKey");
    if (key == null) {
      key = uuidv4();
      console.log("created apiKey: " + key)
      localStorage.setItem("apiKey", key);
    } else {
      console.log("apiKey: " + key);
    }
  } else {
    console.log("apiKey overridden: " + key);
  }
  return key;
}

export function isInStock(product) {
  if (apiCache.inStock == null) {
    return false;
  }
  return apiCache.inStock.includes(product);
}

export function getPrice(product) {
  if (apiCache.prices == null) {
    console.log("Warning: no price table.");
    return null;
  }
  let price = apiCache.prices[product];
  if (price == null) {
    console.log("Warning: price not found for " + product);
  }
  return price;
}

export function formatPrice(number, prefix = 'code') {
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

export function isCartEmpty() {
  if (apiCache.cart == null) {
    return true;
  }

  return apiCache.cart.length == 0;
}

export function getCart() {
  if (apiCache.cart == null)
    return [];
  return apiCache.cart;
}

function myFetch(url) {
  console.log("fetch: " + url);
  return fetch(url);
}

function onReceiveApiState(data) {
  console.log("received api state", data);
  if (data.cart == null) {
    console.log("cart is missing from api state");
  } else {
    apiCache.cart = data.cart;
  }
  if (data.inStock == null) {
    console.log("inStock is missing from api state");
  } else {
    apiCache.inStock = data.inStock;
  }
  if (data.prices) {
    apiCache.prices = data.prices;
  }
}

export function clearCart() {
  if (isCartEmpty()) {
    return Promise.resolve("Cart is already empty.");
  }
  return myFetch(apiHost + '/user/clearCart/' + getApiKey())
    .then(response => response.json())
    .then(data => onReceiveApiState(data));
}

export function addToCart(product) {
  let cart = getCart();
  if (cart.includes(product)) {
    return Promise.resolve('Already in cart.');
  }
  return myFetch(apiHost + '/user/addToCart/' + getApiKey() + '/' + product)
    .then(response => response.json())
    .then(data => onReceiveApiState(data));
}

export function removeFromCart(product) {
  let cart = getCart();
  if (!cart.includes(product)) {
    return Promise.resolve('Already removed from cart.');
  }
  return myFetch(apiHost + '/user/removeFromCart/' + getApiKey() + '/' + product)
    .then(response => response.json())
    .then(data => onReceiveApiState(data));
}

export function sellCart() {
  if (isCartEmpty()) {
    return Promise.resolve("Nothing to sell.");
  }
  return myFetch(apiHost + '/user/sellCart/' + getApiKey())
    .then(response => response.json())
    .then(data => onReceiveApiState(data));
}

export function refreshApiState() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const email = urlParams.get("email");
  if (email) {
    overrideApiKey(email);
  } else {
    overrideApiKey(null);
  }
  return myFetch(apiHost + '/user/getState/' + getApiKey())
    .then(response => response.json())
    .then(data => onReceiveApiState(data));
}

export function saveApproval(data) {
  let x = JSON.stringify(data);
  localStorage.setItem("on-approve-data", x);
}

export function getLastApproval() {
  let x = localStorage.getItem("on-approve-data");
  if (x) {
    x = JSON.parse(x);
  }
  return x;
}

export function saveAuthorization(data) {
  let x = JSON.stringify(data);
  localStorage.setItem("authorization-details", x);
}

export function getLastAuthorization() {
  let x = localStorage.getItem("authorization-details");
  if (x) {
    x = JSON.parse(x);
  }
  return x;
}
