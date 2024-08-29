document.addEventListener('DOMContentLoaded', () => {
    fetch('https://our-2521-backend-dcf9451b4f85.herokuapp.com/getData')
        .then(response => response.json())
        .then(data => {
            console.log("Raw data from backend:", data);

            // Filter out invalid ratings (where Group Rating is NaN or 0)
            const filteredData = data.filter(row => {
                const rating = parseFloat(row[8]);
                return !isNaN(rating) && rating > 0;
            });

            console.log("Filtered data:", filteredData);

            if (filteredData.length === 0) {
                console.error('No valid data available to plot charts or lists.');
                return;
            }

            // Sort the filtered data by rating (descending)
            const sortedData = filteredData.sort((a, b) => b[8] - a[8]);

            // Get Top 10 Movies
            const top10Movies = sortedData.slice(0, 10);
            console.log("Top 10 Movies for Chart:", top10Movies);

            // Get Worst 10 Movies
            const worst10Movies = sortedData.slice(-10).reverse();
            console.log("Worst 10 Movies for Chart:", worst10Movies);

            // Plotting Charts
            const ctxTop10 = document.getElementById('top10Chart');
            const ctxWorst10 = document.getElementById('worst10Chart');
            const ctxAllMovies = document.getElementById('allMoviesChart'); // Add this line

            if (!ctxTop10 || !ctxWorst10 || !ctxAllMovies) {
                console.error('Chart canvas elements not found.');
                return;
            }

            const top10Ctx = ctxTop10.getContext('2d');
            const worst10Ctx = ctxWorst10.getContext('2d');
            const allMoviesCtx = ctxAllMovies.getContext('2d'); // Add this line

            if (!top10Ctx || !worst10Ctx || !allMoviesCtx) {
                console.error('Unable to get 2D context for chart canvases.');
                return;
            }

            // Debugging data before plotting
            console.log("Top 10 Chart Data Values:", top10Movies.map(row => parseFloat(row[8])));
            console.log("Worst 10 Chart Data Values:", worst10Movies.map(row => parseFloat(row[8])));
            console.log("All Movies Chart Data Values:", sortedData.map(row => parseFloat(row[8]))); // Add this line

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

            // Create chart data for all movies
            const allMoviesChartData = {
                labels: sortedData.map(row => row[0]), // Movie titles
                datasets: [{
                    label: 'All Movies Group Ratings',
                    data: sortedData.map(row => parseFloat(row[8])), // Group Rating
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(153, 102, 255, 1)',
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

            // Render the all movies chart
            new Chart(allMoviesCtx, {
                type: 'bar',
                data: allMoviesChartData,
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
            top10List.innerHTML = ''; // Clear existing content
            top10Movies.forEach(row => {
                const listItem = document.createElement('li');
                listItem.textContent = `${row[0]} - ${row[8]} rating`;
                top10List.appendChild(listItem);
            });

            const worst10List = document.getElementById('worst10List');
            worst10List.innerHTML = ''; // Clear existing content
            worst10Movies.forEach(row => {
                const listItem = document.createElement('li');
                listItem.textContent = `${row[0]} - ${row[8]} rating`;
                worst10List.appendChild(listItem);
            });

            // "Now Showing" Section - Display last movie added with values
            const nowShowingElement = document.getElementById('nowShowing');
            if (nowShowingElement) {
                const lastMovie = sortedData[sortedData.length - 1];
                if (lastMovie && lastMovie[17]) { // Assuming poster URL is at index 17
                    nowShowingElement.innerHTML = `
                        <h3>Now Showing: ${lastMovie[0]}</h3>
                        <img src="${lastMovie[17]}" alt="${lastMovie[0]} poster" style="max-width: 200px;">
                    `;
                } else {
                    nowShowingElement.textContent = 'No movie available for Now Showing.';
                }
            } else {
                console.error('Now Showing element not found');
            }
        })
        .catch(error => console.error('Error fetching data:', error));
});
