
console.log("Hostname:", window.location.hostname);
export var cartContext = null;

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
  },

};

var noShippingTo = [
  'AU', // Australia
  'CA', // Canada
  'IL', // Israel
  'GR', // Greece
  'SK', // Slovakia
  'RO', // Romania
  'RU', // Russia
];

export function canShipTo(country) {
  return !noShippingTo.includes(country);
}

export function setCartContext(token) {
  if (token) {
    console.log("Cart Context: ", token);
  } else {
    console.log("Cart Context: session");
  }
  cartContext = token;
}

export function getCartContext() {
  return cartContext;
}

export function hasInventory() {
  return apiCache.inventory !== null;
}

export function hasPrices() {
  return apiCache.prices !== null;
}

export function getInventory(product) {
  if (apiCache.prices == null || apiCache.inventory == null) {
    return 0;
  }
  return apiCache.inventory[product];
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

export function clearCart() {
  if (cartContext) {
    apiCache.cart = null;
  } else {
    sessionStorage.removeItem("cart");
    console.log("Cart cleared.")
  }
}

export function isCartEmpty() {
  return sessionStorage.getItem("cart") == null;
}

export function getCart() {
  if (cartContext) {
    if (apiCache.cart) {
      return apiCache.cart;
    } else {
      return {
        items: [],
      }
    }
  } else {
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
}

function setCart(cart) {
  if (cartContext) {
    apiCache.cart = cart;
  } else {
    sessionStorage.setItem("cart", JSON.stringify(cart));
  }
}

export function addToCart(product) {
  if (cartContext) {
    // do nothing
  } else {
    var cart = getCart();
    cart.items.push(product);
    setCart(cart);
  }
}

export function removeFromCart(product) {
  let cart = getCart();
  console.log("Remove " + product + " from cart.")
  cart.items = cart.items.filter(e => e !== product);
  setCart(cart);
  return cart.items.length;
}

export function sellCart() {
  if (cartContext) {
    fetch(apiHost + '/cart/' + cartContext + '/sell')
      .then(response => console.log('sell cart', cartContext, response));
  } else {
    let cart = getCart();
    cart.items.forEach(p => {
      fetch(apiHost + '/sell/' + p)
        .then(response => console.log('sell', p, response));
    });
  }
  clearCart();
}

function onReceiveCart(data) {
  console.log("received cart for", cartContext, data);
  apiCache.cart = {
    items: data,
  }
}

function onReceiveInventory(data) {
  console.log("received inventory", data);
  apiCache.inventory = data;
}

export function refreshCache() {
  if (cartContext) {
    return fetch(apiHost + '/cart/' + cartContext)
      .then(response => response.json())
      .then(data => onReceiveCart(data));
  } else {
    return fetch(apiHost + '/inventory')
      .then(response => response.json())
      .then(data => onReceiveInventory(data));
  }
}

export function saveApproval(data) {
  let x = JSON.stringify(data);
  sessionStorage.setItem("on-approve-data", x);
}

export function getLastApproval() {
  let x = sessionStorage.getItem("on-approve-data");
  if (x) {
    x = JSON.parse(x);
  }
  return x;
}

export function saveAuthorization(data) {
  let x = JSON.stringify(data);
  sessionStorage.setItem("authorization-details", x);
}

export function getLastAuthorization() {
  let x = sessionStorage.getItem("authorization-details");
  if (x) {
    x = JSON.parse(x);
  }
  return x;
}
