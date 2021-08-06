import * as common from "./common.mjs"

function createOrder(data, actions) {
  let cart = common.getCart();
  if (cart.length == 0) {
    return null;
  }

  let total = 0;
  let items = [];

  cart.forEach(p => {
    let price = common.getPrice(p);
    let item = {
      name: p.toUpperCase(),
      quantity: 1,
      unit_amount: {
        currency_code: 'JPY',
        value: price,
      }
    };
    items.push(item);
    total += price;
  });

  console.log(items);

  var punits = [{
    description: "Items",
    amount: {
      currency_code: 'JPY',
      value: total,
      breakdown: {
        item_total: {
          currency_code: 'JPY',
          value: total,
        },
        shipping: {
          currency_code: 'JPY',
          value: 0,
        },
        tax_total: {
          currency_code: 'JPY',
          value: 0,
        }
      }
    },
    items: items
  }];

  return actions.order.create({
    intent: 'AUTHORIZE',
    purchase_units: punits
  });
}

function onCheckoutDone() {
  window.location.href = "checkout-done.html";
}

function onApprove(data, actions) {
  console.log("onApprove data", data);
  common.saveApproval(data);
  return actions.order.authorize().then(function (details) {
    console.log("onApprove authorize details", details);
    common.saveAuthorization(details);
    common.sellCart().then(onCheckoutDone);
  });
}

function onError(err) {
  window.location.href = "checkout-failed.html";
  console.log("onError", err);
}

function onShippingChange(data, actions) {
  console.log("onShippingChange", data);
  if (common.canShipTo(data.shipping_address.country_code)) {
    return actions.resolve();
  } else {
    return actions.reject();
  }
}

var paypalReady = false;
function initPayPalButton() {
  if (paypalReady) {
    return;
  }

  paypal.Buttons({
    style: {
      shape: 'pill',
      color: 'gold',
      layout: 'vertical',
      label: 'checkout',
    },
    createOrder: createOrder,
    onApprove: onApprove,
    onError: onError,
    onShippingChange: onShippingChange,
  }).render('#paypal-button-container');

  paypalReady = true;
}

function populateTable(table, fields, records) {
  let addButtons = records.length > 1;

  // Clear all rows.
  while (table.firstChild) {
    table.removeChild(table.lastChild);
  }

  // Add header row.
  let thead = table.createTHead();
  let row = thead.insertRow();
  for (let field of fields) {
    let th = document.createElement("th");
    let text = document.createTextNode(field);
    th.appendChild(text);
    row.appendChild(th);
  }
  if (addButtons) {
    // Add empty column for buttons.
    let th = document.createElement("th");
    let text = document.createTextNode("");
    th.appendChild(text);
    row.appendChild(th);
  }

  // Add row for each record.
  for (let record of records) {
    let row = table.insertRow();
    for (let field of fields) {
      let cell = row.insertCell();
      let text = document.createTextNode(record[field]);
      cell.appendChild(text);
    }
    if (addButtons) {
      let cell = row.insertCell();
      if (record["Item"] != "Total") {
        let btn = document.createElement("button");
        btn.textContent = "x";
        btn.type = "submit";
        btn.id = "remove-row";
        let product = record["Item"].toLowerCase();
        btn.addEventListener("click", event => {
          common.removeFromCart(product).then(renderCart);
        });
        cell.appendChild(btn);
      }
    }
  }
}

function renderCart() {
  if (common.isCartEmpty()) {
    console.log("Cart is empty. Returning to store.");
    window.location.href = "/store";
    return;
  }

  let title = document.querySelector("#cart-title");
  let cart = common.getCart();
  title.innerHTML = "Your Shopping Cart";

  let table = document.querySelector(".cart-table");
  let records = [];
  let total = 0;
  if (cart.length > 0) {
    cart.forEach(p => {
      let price = common.getPrice(p);
      let record = {
        Item: p.toUpperCase(),
        Qty: 1,
        Amount: common.formatPrice(price, 'symbol'),
      };
      records.push(record);
      total += price;
    });
  }
  records.push({
    Item: "Total",
    Qty: cart.length,
    Amount: common.formatPrice(total),
  });
  console.log(records);
  let fields = ["Item", "Qty", "Amount"]
  populateTable(table, fields, records);
  if (cart.length > 0) {
    initPayPalButton();
  }
}

common.refreshApiState().then(renderCart);

