# To connect with phone or another device
bundle exec jekyll serve --host 0.0.0.0

# if ufw is enabled then..
sudo ufw allow 4000

# If I ever need to use plugins that are not allowed by Github...
https://github.com/jeffreytse/jekyll-deploy-action

# How to customize theme

Get path to theme files:

bundle info --path minima

# Keeping track of inventory

The store flow:

update cart
renderCart
createOrder (hold inventory)
onApprove 
actions.order.authorize success (mark inventory sold)
onError (release inventory)
onShippingChange