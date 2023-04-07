const generateSalesReport = (format) => {
  console.log(format)
  $.ajax({
    url: '/admin/make-report',
    data: { format },
    method: 'post',
    xhrFields: {
      responseType: 'blob' // set the response type to blob
    },
    success: function (response, status, xhr) {
      const contentType = xhr.getResponseHeader('Content-Type')
      const fileExtension = contentType === 'application/pdf' ? 'pdf' : 'xlsx'
      const fileName = `sales-report.${fileExtension}`
      const blob = new Blob([response], { type: contentType })

      if (contentType === 'application/pdf') {
        const fileURL = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = fileURL
        a.download = 'file.pdf'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      } else if (contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        // Confirm if user wants to download Excel file

        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = fileName
        link.click()
      } else {
        Swal({
          title: 'Download failed please try again later..!',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Try again',
          cancelButtonText: 'ok'
        }).then((result) => {
          if (result.isConfirmed) {
            location.href = '/admin/make-report'
          }
        })
        // Unsupported file type
        console.error('Unsupported file type:', contentType)
      }
    },
    error: function (xhr, status, error) {
      console.log('Error generating report:', error)
    }
  })
}
