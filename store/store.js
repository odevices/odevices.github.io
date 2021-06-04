
function getProduct(e) {
  return e.closest(".product").dataset.product;
}

function renderStore() {
  let cart = getCart();
  console.log("cart: " + JSON.stringify(cart));
  let e = document.querySelector(".cart-count")
  e.innerHTML = cart.items.length;

  if(cart.items.length > 0)
  {
    document.querySelector("#clear").disabled = false;
    document.querySelector("#next").disabled = false;
  } else {
    document.querySelector("#clear").disabled = true;
    document.querySelector("#next").disabled = true;
  }

  if (apiCache.inventory == null || apiCache.prices == null) {
    let elts = document.querySelectorAll(".product")
    elts.forEach(e => {
      let priceDiv = e.querySelector("#price");
      let button = e.querySelector("#action");
      let count = e.querySelector(".product-count");
      priceDiv.innerHTML = "";
      button.disabled = true;
      button.innerHTML = "Checking...";
      count.style.visibility = "hidden";
    });
  } else {
    let elts = document.querySelectorAll(".product")
    elts.forEach(e => {
      let product = e.dataset.product;
      let price = getPrice(product);
      let stock = getInventory(product);
      let priceDiv = e.querySelector("#price");
      let button = e.querySelector("#action");
      let count = e.querySelector(".product-count");
      priceDiv.innerHTML = formatPrice(price);
      if (cart.items.includes(product)) {
        button.disabled = false;
        button.innerHTML = "Remove";
        count.style.visibility = "visible";
        count.innerHTML = "1";
      } else if (stock < 1) {
        button.disabled = true;
        button.innerHTML = "Out of Stock";
        count.style.visibility = "hidden";
        count.innerHTML = "0";
      } else {
        button.disabled = false;
        button.innerHTML = "Add to Cart";
        count.style.visibility = "hidden";
        count.innerHTML = "0";
      }
    });
  }
}

function initStore() {
  refreshInventory(renderStore);

  let clearButton = document.querySelector("#clear");
  clearButton.addEventListener("click", event => {
    clearCart();
    refreshInventory(renderStore);
    renderStore();
  });

  let nextButton = document.querySelector("#next");
  nextButton.addEventListener("click", event => {
    window.location.href = "cart.html";
  });

  let elts = document.querySelectorAll(".product")
  elts.forEach(e => {
    let product = e.dataset.product;
    let priceDiv = e.querySelector("#price");
    let button = e.querySelector("#action");
    let name = e.querySelector(".product-name");
    let image = e.querySelector('.product-image')
    name.innerHTML = product.toUpperCase();
    image.setAttribute("src","/images/store/"+product+".png");
    priceDiv.innerHTML = "";
    button.disabled = true;
    button.innerHTML = "Checking...";
    button.addEventListener("click", event => {
      let product = getProduct(button);
      if(button.innerHTML=="Add to Cart"){
        addToCart(product);
      } else {
        removeFromCart(product);
      }
      renderStore();
    });
  });

  renderStore();
}

initStore();
