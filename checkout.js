function createOrder(data, actions) {
  let cart = getCart();
  if (cart.items.length == 0) {
    return null;
  }

  let total = 0;
  let items = [];

  cart.items.forEach(p => {
    let price = getPrice(p);
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

  sessionStorage.setItem("ordered", JSON.stringify(cart));
  sessionStorage.setItem("purchase-unit", JSON.stringify(punits[0]));

  return actions.order.create({
    intent: 'AUTHORIZE',
    purchase_units: punits
  });
}

function onApprove(data, actions) {
  console.log("onApprove data", data);
  sessionStorage.setItem("on-approve-data", JSON.stringify(data));
  return actions.order.authorize().then(function (details) {
    sellCart();
    console.log("onApprove authorize details", details);
    sessionStorage.setItem("authorize-details", JSON.stringify(details));
    window.location.href = "checkout-done.html";
  });
}

function onError(err) {
  window.location.href = "checkout-failed.html";
  console.log("onError", err);
}

var noShippingTo = [
  'AU', // Australia
  'CA', // Canada
  'IL', // Israel
  'GR', // Greece
  'SK', // Slovakia
  'RO', // Romania
  'RU', // Russia
];

function onShippingChange(data, actions) {
  console.log("onShippingChange", data);
  if(noShippingTo.includes(data.shipping_address.country_code))
  {
    return actions.reject();
  }
  return actions.resolve();
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

function generateTableHead(table, fields) {
  while (table.firstChild) {
    table.removeChild(table.lastChild);
  }
  let thead = table.createTHead();
  let row = thead.insertRow();
  for (field of fields) {
    let th = document.createElement("th");
    let text = document.createTextNode(field);
    th.appendChild(text);
    row.appendChild(th);
  }
  // empty column for buttons
  let th = document.createElement("th");
  let text = document.createTextNode("");
  th.appendChild(text);
  row.appendChild(th);
}

function generateTable(table, fields, records) {
  for (record of records) {
    let row = table.insertRow();
    for (field of fields) {
      let cell = row.insertCell();
      let text = document.createTextNode(record[field]);
      cell.appendChild(text);
    }
    let cell = row.insertCell();
    if (record["Item"] != "Total") {
      let btn = document.createElement("button");
      btn.textContent = "x";
      btn.type = "submit";
      btn.id = "remove-row";
      let product = record["Item"].toLowerCase();
      btn.addEventListener("click", event => {
        if (removeFromCart(product) == 0) {
          window.location.href = "store.html";
        } else {
          renderCheckout();
        }
      });
      cell.appendChild(btn);
    }
  }
}

function renderCheckout() {
  let cart = getCart();
  let table = document.querySelector(".cart-table");

  if (apiCache.inventory == null || apiCache.prices == null) {

  } else {
    if (cart.items.length > 0) {
      let records = [];
      let total = 0;
      cart.items.forEach(p => {
        let price = getPrice(p);
        let record = {
          Item: p.toUpperCase(),
          Qty: 1,
          Amount: formatPrice(price, prefix = 'symbol'),
        };
        records.push(record);
        total += price;
      });
      records.push({
        Item: "Total",
        Qty: cart.items.length,
        Amount: formatPrice(total),
      });
      console.log(records);
      let fields = ["Item", "Qty", "Amount"]
      generateTableHead(table, fields);
      generateTable(table, fields, records);
      initPayPalButton();
    } else {

    }
  }
}

function initCheckout() {
  if (isCartEmpty()) {
    window.location.href = "store.html";
    return;
  }
  renderCheckout();
  refreshInventory(renderCheckout);
}

initCheckout();


