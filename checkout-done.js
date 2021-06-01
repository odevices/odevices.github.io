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

function initReceipt() {
  let approval = sessionStorage.getItem("on-approve-data");
  if (approval == null) {
    let msg = document.querySelector("#msg");
    msg.innerHTML = "Something is wrong.  No approval details.";
    return;
  }

  let orderId = document.querySelector("#order-id");
  approval = JSON.parse(approval);
  orderId.innerHTML = "<b>orderID:</b> " + approval.orderID;
  let msg = document.querySelector("#msg");
  msg.innerHTML = "Your order has been accepted.";
  let msg2 = document.querySelector("#msg2");
  msg2.innerHTML = "The payment has only been authorized."
  let msg3 = document.querySelector("#msg3");
  msg3.innerHTML = "You will be charged when your order is ready to ship.";
  let msg4 = document.querySelector("#msg4");
  msg4.innerHTML = "You should receive a receipt via email from <b>PAYPAL.COM</b> soon.";
  
  let pu = sessionStorage.getItem("purchase-unit");
  if (pu != null) {
    pu = JSON.parse(pu);

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

    let table = document.querySelector("#receipt-table");
    let fields = ["Item", "Qty", "Amount"]
    generateTableHead(table, fields);
    generateTable(table, fields, records);
  }

}

initReceipt();