
function removeCoupon (id) {
  $.ajax({
    url: '/remove-coupon',
    method: 'get',
    data: { id },
    success: async (response) => {
      if (response.status) {
        await swal('Coupon removed...!')
      }
      location.reload()
    }
  })
}
function addToCart (proId, buy) {
  let quantity = document.getElementById(proId).value

  if (!quantity) {
    quantity = 1
  }
  const cartData = { proId, quantity }
  $.ajax({
    url: '/add-cart',
    method: 'post',
    data: cartData,
    success: async (response) => {
      if (response.status) {
        if (buy !== 1) {
          let count = $('#cartCount').html()
          count = parseInt(count) + 1
          $('#carCount').html(count)
          await swal({
            title: 'Added to your cart!',
            icon: 'success'
          })
          location.reload()
        } else {
          location.replace('/my-cart')
        }
      }
    }

  })
}
function updateQuantity (cartId, productId, count) {
  const quantity = parseInt(document.getElementById(productId).innerHTML)
  count = parseInt(count)
  $.ajax({
    url: '/update-product-quantity/',
    data: {
      cart: cartId,
      product: productId,
      count,
      quantity
    },
    method: 'post',
    success: (response) => {
      if (response.removed) {
        alert('product removed')
        location.reload()
      } else {
        document.getElementById(productId).innerHTML = quantity + count
        location.reload()
      }
    }
  })
}
