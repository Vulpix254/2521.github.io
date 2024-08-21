// Example data fetching and rendering logic
fetch('https://our-2521-backend.herokuapp.com/getData')
    .then(response => response.json())
    .then(data => {
        // Assuming `data` is an array of arrays where each inner array represents a row from your Google Sheet
        const chartData = {
            labels: data.map(row => row[0]), // Movie titles
            datasets: [{
                label: 'Group Rating',
                data: data.map(row => row[8]), // Group Rating
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        };

        const ctx = document.getElementById('myChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    })
    .catch(error => console.error('Error fetching data:', error));
