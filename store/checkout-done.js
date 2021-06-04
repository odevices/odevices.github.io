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
}

function generateTable(table, fields, records) {
  for (record of records) {
    let row = table.insertRow();
    for (field of fields) {
      let cell = row.insertCell();
      let text = document.createTextNode(record[field]);
      cell.appendChild(text);
    }
  }
}

function initCheckoutDone() {
  let pu = sessionStorage.getItem("purchase-unit");
  let approval = sessionStorage.getItem("on-approve-data");
  let status = document.querySelector("#checkout-status");

  if (approval == null) {
    status.innerHTML = "Something is wrong.  No approval details.";
    return;
  }

  if (pu == null) {
    status.innerHTML = "Something is wrong.  No purchase details.";
    return;
  }

  approval = JSON.parse(approval);
  pu = JSON.parse(pu);

  let table = document.querySelector("#receipt-table");
  let orderId = document.querySelector("#order-id");
  orderId.innerHTML = "<b>Your Order ID:</b> " + approval.orderID;
  status.innerHTML = "Your order has been accepted.";

  let fields = ["Item", "Qty", "Amount"]
  let records = [];
  let qty = 0;
  pu.items.forEach(p => {
    qty += p.quantity;
    let record = {
      Item: p.name,
      Qty: p.quantity,
      Amount: formatPrice(p.unit_amount.value, prefix = 'symbol'),
    };
    records.push(record);
  });
  records.push({
    Item: "Total",
    Qty: qty,
    Amount: formatPrice(pu.amount.value),
  });

  generateTableHead(table, fields);
  generateTable(table, fields, records);

  let receipt = document.querySelector("#receipt");
  receipt.style.visibility = "visible";
}

initCheckoutDone();