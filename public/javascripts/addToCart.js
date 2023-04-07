// $('#newAddress').submit((e) => {
//   console.log('called')
//     .e.preventDefault()
//   $.ajax({
//     type: 'get',
//     url: ('/addNewAddress'),
//     data: $('#newAddress').serialize(),
//     success: (response) => {
//       console.log(response)
//       if (response.status) {
//         location.replace('/proceed-to-checkout')
//       }
//     },
//     error: (response, stat, err) => {
//       console.log(response)
//     }

//   })
// })
function removeCoupon (id) {
  console.log(id)
  $.ajax({
    url: '/remove-coupon',
    method: 'get',
    data: { id },
    success: async (response) => {
      console.log(response)
      if (response.status) {
        await swal('Coupon removed...!')
      }
      location.reload()
    }
  })
}
function addToCart (proId) {
  $.ajax({
    url: '/add-cart/' + proId,
    method: 'get',
    success: async (response) => {
      if (response.status) {
        let count = $('#cartCount').html()
        count = parseInt(count) + 1
        $('#carCount').html(count)
        await swal({
          title: 'Added to your cart!',
          icon: 'success'
        })
        location.reload()
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
