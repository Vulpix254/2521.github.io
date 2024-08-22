document.addEventListener('DOMContentLoaded', () => {
    // Fetch data from the backend and process it to create multiple charts and lists
    fetch('https://our-2521-backend-dcf9451b4f85.herokuapp.com/getData')
        .then(response => response.json())
        .then(data => {
            console.log("Raw data from backend:", data);  // Debugging log

            // Filter out rows where the Group Rating is not a valid number (e.g., #DIV/0! or empty)
            const filteredData = data.filter(row => {
                const rating = parseFloat(row[8]);
                return !isNaN(rating) && rating > 0;
            });

            console.log("Filtered data:", filteredData);  // Debugging log

            if (filteredData.length === 0) {
                console.error('No valid data available to plot charts or lists.');
                return;
            }

            // Sort data by the 9th column (index 8) which holds the "Group Rating"
            const sortedData = filteredData.sort((a, b) => b[8] - a[8]);

            // Top 10 Movies by Rating
            const top10Movies = sortedData.slice(0, 10);
            console.log("Top 10 Movies:", top10Movies);  // Debugging log

            // Worst 10 Movies by Rating (from the end of the sorted list)
            const worst10Movies = sortedData.slice(-10).reverse();
            console.log("Worst 10 Movies:", worst10Movies);  // Debugging log

            // Check if canvas elements exist
            const ctxTop10 = document.getElementById('top10Chart');
            const ctxWorst10 = document.getElementById('worst10Chart');

            if (!ctxTop10 || !ctxWorst10) {
                console.error('Chart canvas elements not found.');
                return;
            }

            // Ensure the canvas has a 2D context
            const top10Ctx = ctxTop10.getContext('2d');
            const worst10Ctx = ctxWorst10.getContext('2d');

            if (!top10Ctx || !worst10Ctx) {
                console.error('Unable to get 2D context for chart canvases.');
                return;
            }

            // Create chart data for top 10 movies
            const top10ChartData = {
                labels: top10Movies.map(row => row[0]), // Movie titles
                datasets: [{
                    label: 'Top 10 Group Ratings',
                    data: top10Movies.map(row => parseFloat(row[8])), // Group Rating
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            };

            // Create chart data for worst 10 movies
            const worst10ChartData = {
                labels: worst10Movies.map(row => row[0]), // Movie titles
                datasets: [{
                    label: 'Worst 10 Group Ratings',
                    data: worst10Movies.map(row => parseFloat(row[8])), // Group Rating
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            };

            // Render the top 10 chart
            new Chart(top10Ctx, {
                type: 'bar',
                data: top10ChartData,
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            // Render the worst 10 chart
            new Chart(worst10Ctx, {
                type: 'bar',
                data: worst10ChartData,
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            // Optionally, create lists of top 10 and worst 10 movies
            const top10List = document.getElementById('top10List');
            top10Movies.forEach(row => {
                const listItem = document.createElement('li');
                listItem.textContent = `${row[0]} - ${row[8]} rating`;
                top10List.appendChild(listItem);
            });

            const worst10List = document.getElementById('worst10List');
            worst10Movies.forEach(row => {
                const listItem = document.createElement('li');
                listItem.textContent = `${row[0]} - ${row[8]} rating`;
                worst10List.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});
