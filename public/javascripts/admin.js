const blocking = (id) => {
  $.ajax({
    url: '/admin/blockuser/' + id,
    method: 'get',
    success: (response) => {
      if (response.status) {
        location.reload()
      }
    }
  })
}
const unblocking = (id) => {
  $.ajax({
    url: '/admin/unblockuser/' + id,
    method: 'get',
    success: (response) => {
      if (response.status) {
        location.reload()
      }
    }
  })
}
const logoutConfirm = () => {
  swal('Are you sure you want to logout.?', {
    buttons: ['No', 'Yes']
  }).then((value) => {
    if (value) {
      logout()
    }
  })
}
const logout = () => {
  $.ajax({
    url: '/admin/logout',
    type: 'get',
    success: (response) => {
      if (response.status) {
        location.replace('/admin/login')
      }
    }
  })
}
