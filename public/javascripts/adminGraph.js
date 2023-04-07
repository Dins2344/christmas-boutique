
(function ($) {
  'use strict'
  fetch('/admin/data-for-graphs')
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
      const sales = Object.values(data.monthlySales)
      const products = Object.values(data.productSold)
      const visitors = Object.values(data.visitorsCount)
      const orderStatus = Object.values(data.orderDetails)
      const paymentStatus = Object.values(data.paymentDetails)
      /* Sale statistics Chart */
      if ($('#myChart').length) {
        const ctx = document.getElementById('myChart').getContext('2d')
        const chart = new Chart(ctx, {
          // The type of chart we want to create
          type: 'line',

          // The data for our dataset
          data: {
            labels: [
              'Jan',
              'Feb',
              'Mar',
              'Apr',
              'May',
              'Jun',
              'Jul',
              'Aug',
              'Sep',
              'Oct',
              'Nov',
              'Dec'
            ],
            datasets: [
              {
                label: 'Sales',
                tension: 0.3,
                fill: true,
                backgroundColor: 'rgba(44, 120, 220, 0.2)',
                borderColor: 'rgba(44, 120, 220)',
                data: sales
              },
              {
                label: 'Visitors',
                tension: 0.3,
                fill: true,
                backgroundColor: 'rgba(4, 209, 130, 0.2)',
                borderColor: 'rgb(4, 209, 130)',
                data: visitors
              },
              {
                label: 'Products',
                tension: 0.3,
                fill: true,
                backgroundColor: 'rgba(380, 200, 230, 0.2)',
                borderColor: 'rgb(380, 200, 230)',
                data: products
              }
            ]
          },
          options: {
            plugins: {
              legend: {
                labels: {
                  usePointStyle: true
                }
              }
            }
          }
        })
      } // End if

      // Polar area
      //   /* Order statitics */
      if ($('#orderStatitics').length) {
        const canvas = document.getElementById('orderStatitics')
        canvas.width = 400 // Set the width of the canvas to 400 pixels
        canvas.height = 400 // Set the height of the canvas to 400 pixels

        const ctx = document.getElementById('orderStatitics').getContext('2d')
        // const chartData = $("#chartData").val().split(",")
        const labels = [
          'Delivered',
          'Ready for shipping',
          'Shipped',
          'Canceled orders',
          'Returned orders'
        ] // example labels

        const chart = new Chart(ctx, {
          type: 'polarArea',

          data: {
            labels,
            datasets: [
              {
                label: 'My Dataset',
                backgroundColor: [
                  'rgba(23, 162, 82, 0.8)', // dark green
                  'rgba(255, 206, 86, 0.8)', // yellow
                  'rgba(75, 192, 192, 0.8)', // green
                  'rgba(255, 240, 0, 0.8)', // dark yellow
                  'rgba(204, 0, 0, 0.8)' // dark red
                ],
                data: orderStatus
              }
            ]
          },
          options: {
            plugins: {
              legend: {
                labels: {
                  usePointStyle: true
                }
              }
            },
            scale: {
              ticks: {
                beginAtZero: true
              },
              reverse: false
            }
          }
        })
      }

      // Donoght chart
      /* Order statitics */
      if ($('#payment-statitics').length) {
        const canvas = document.getElementById('payment-statitics')
        canvas.width = 400 // Set the width of the canvas to 400 pixels
        canvas.height = 400 // Set the height of the canvas to 400 pixels

        const ctx = document.getElementById('payment-statitics').getContext('2d')
        const chart = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Cod', 'Online payment', 'Wallet'],
            datasets: [
              {
                label: 'My Dataset',
                backgroundColor: [
                  '#ff9076', // dark green
                  'rgba(54, 162, 235, 0.8)', // blue
                  'rgba(255, 240, 0, 0.8)' // dark yellow
                ],
                borderColor: [
                  '#ff9076', // dark green
                  'rgba(54, 162, 235, 0.8)', // blue
                  'rgba(255, 240, 0, 0.8)' // dark yellow
                ],
                borderWidth: 1,
                data: paymentStatus
              }
            ]
          },
          options: {
            plugins: {
              legend: {
                labels: {
                  usePointStyle: true
                }
              }
            },
            radius: '70%'
          }
        })
      }
    })
})(jQuery)
