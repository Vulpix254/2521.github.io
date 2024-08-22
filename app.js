document.addEventListener('DOMContentLoaded', () => {
    fetch('https://our-2521-backend-dcf9451b4f85.herokuapp.com/getData')
        .then(response => response.json())
        .then(data => {
            console.log("Raw data from backend:", data);

            // Filter out invalid ratings and ensure ratings are numeric
            const filteredData = data.filter(row => {
                // Assuming the rating is at index 8
                const ratingStr = row[8];
                const rating = parseFloat(ratingStr.replace('%', '').trim());
                return !isNaN(rating) && rating > 0;
            });

            console.log("Filtered data:", filteredData);

            if (filteredData.length === 0) {
                console.error('No valid data available to plot charts or lists.');
                return;
            }

            // Convert ratings to numbers and sort data by rating in descending order
            const sortedData = filteredData.map(row => {
                // Convert the rating to a number
                const ratingStr = row[8];
                const rating = parseFloat(ratingStr.replace('%', '').trim());
                return { ...row, rating }; // Attach the numeric rating
            }).sort((a, b) => b.rating - a.rating);

            console.log("Sorted data (highest to lowest rating):", sortedData);

            // Get Top 10 Movies (highest ratings)
            const top10Movies = sortedData.slice(0, 10);
            console.log("Top 10 Movies for Chart:", top10Movies);

            // Get Worst 10 Movies (lowest ratings)
            const worst10Movies = sortedData.slice(-10);
            console.log("Worst 10 Movies for Chart:", worst10Movies);

            // Plotting Charts
            const ctxTop10 = document.getElementById('top10Chart');
            const ctxWorst10 = document.getElementById('worst10Chart');

            if (!ctxTop10 || !ctxWorst10) {
                console.error('Chart canvas elements not found.');
                return;
            }

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
                    data: top10Movies.map(row => row.rating), // Group Rating
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
                    data: worst10Movies.map(row => row.rating), // Group Rating
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

            // Clear and create lists of top 10 and worst 10 movies
            const top10List = document.getElementById('top10List');
            top10List.innerHTML = ''; // Clear existing content
            top10Movies.forEach(row => {
                const listItem = document.createElement('li');
                listItem.textContent = `${row[0]} - ${row.rating}% rating`;
                top10List.appendChild(listItem);
            });

            const worst10List = document.getElementById('worst10List');
            worst10List.innerHTML = ''; // Clear existing content
            worst10Movies.forEach(row => {
                const listItem = document.createElement('li');
                listItem.textContent = `${row[0]} - ${row.rating}% rating`;
                worst10List.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});
