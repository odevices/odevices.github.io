import * as common from "./common.mjs"

function populateTable(table, fields, records) {
  // Clear all rows.
  while (table.firstChild) {
    table.removeChild(table.lastChild);
  }

  // Create header row.
  let thead = table.createTHead();
  let row = thead.insertRow();
  for (let field of fields) {
    let th = document.createElement("th");
    let text = document.createTextNode(field);
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
  }
}

function initCheckoutDone() {
  let lastApproval = common.getLastApproval();
  let lastAuthorization = common.getLastAuthorization();
  let status = document.querySelector("#checkout-status");

  if (lastAuthorization == null) {
    status.innerHTML = "Something is wrong.  No authorization details.<br>Please email support: clarkson@orthogonaldevices.com";
    return;
  }

  if (lastApproval == null) {
    status.innerHTML = "Something is wrong.  No approval details.<br>Please email support: clarkson@orthogonaldevices.com";
    return;
  }

  if (lastApproval.orderID != lastAuthorization.id) {
    status.innerHTML = "Something is wrong.  Approval does not match authorization.<br>Please email support: clarkson@orthogonaldevices.com";
    return;
  }

  let pu = lastAuthorization.purchase_units[0];
  let table = document.querySelector("#receipt-table");
  let orderId = document.querySelector("#order-id");
  orderId.innerHTML = "<b>Your Order ID:</b> " + lastApproval.orderID;
  status.innerHTML = "Your order has been accepted.";

  let fields = ["Item", "Qty", "Amount"]
  let records = [];
  let totalQuantity = 0;
  pu.items.forEach(p => {
    let quantity = parseInt(p.quantity);
    totalQuantity += parseInt(p.quantity);
    let record = {
      Item: p.name,
      Qty: p.quantity,
      Amount: common.formatPrice(parseFloat(p.unit_amount.value), 'symbol'),
    };
    records.push(record);
  });
  records.push({
    Item: "Total",
    Qty: totalQuantity,
    Amount: common.formatPrice(parseFloat(pu.amount.value)),
  });

  populateTable(table, fields, records);

  let receipt = document.querySelector("#receipt");
  receipt.style.visibility = "visible";

  if (lastAuthorization.payer.address.country_code == "JP") {
    document.querySelector("#domestic-shipping-faq").style.visibility = "visible";
  } else {
    document.querySelector("#international-shipping-faq").style.visibility = "visible";
  }

  console.log("approval", lastApproval);
  console.log("authorization", lastAuthorization);
}

initCheckoutDone();