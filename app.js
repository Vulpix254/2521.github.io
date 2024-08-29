document.addEventListener('DOMContentLoaded', () => {
    fetch('https://our-2521-backend-dcf9451b4f85.herokuapp.com/getData')
        .then(response => response.json())
        .then(data => {
            console.log("Raw data from backend:", data);

            // Check if the data contains headers and remove them if present
            const hasHeaders = data[0] && data[0].length > 1 && isNaN(parseFloat(data[0][8]));
            const startIndex = hasHeaders ? 1 : 0;
            const actualData = hasHeaders ? data.slice(1) : data;

            // Filter out invalid ratings and ensure ratings are numeric
            const filteredData = actualData.filter(row => {
                if (Array.isArray(row) && row.length > 8) {
                    const ratingStr = row[8];
                    const rating = parseFloat(ratingStr.replace('%', '').trim());
                    return !isNaN(rating) && rating > 0;
                }
                return false;
            });

            console.log("Filtered data:", filteredData);

            if (filteredData.length === 0) {
                console.error('No valid data available to plot charts or lists.');
                return;
            }

            // Convert ratings to numbers and sort data by rating in descending order
            const sortedData = filteredData.map(row => {
                const ratingStr = row[8];
                const rating = parseFloat(ratingStr.replace('%', '').trim());
                return {
                    title: row[0],
                    rating: rating,
                    posterUrl: row[17] || null
                };
            }).sort((a, b) => b.rating - a.rating);

            console.log("Sorted data (highest to lowest rating):", sortedData);

            // Get Top 10 Movies (highest ratings)
            const top10Movies = sortedData.slice(0, 10);
            console.log("Top 10 Movies for Chart:", top10Movies);

            // Get Worst 10 Movies (lowest ratings)
            const worst10Movies = sortedData.slice(-10).reverse(); // Reverse to show worst at the top
            console.log("Worst 10 Movies for Chart:", worst10Movies);

            // Plotting Charts
            const ctxTop10 = document.getElementById('top10Chart');
            const ctxWorst10 = document.getElementById('worst10Chart');
            const ctxAllMovies = document.getElementById('allMoviesChart');

            if (!ctxTop10 || !ctxWorst10 || !ctxAllMovies) {
                console.error('Chart canvas elements not found.');
                return;
            }

            const top10Ctx = ctxTop10.getContext('2d');
            const worst10Ctx = ctxWorst10.getContext('2d');
            const allMoviesCtx = ctxAllMovies.getContext('2d');

            if (!top10Ctx || !worst10Ctx || !allMoviesCtx) {
                console.error('Unable to get 2D context for chart canvases.');
                return;
            }

            // Create chart data for top 10 movies
            const top10ChartData = {
                labels: top10Movies.map(movie => movie.title),
                datasets: [{
                    label: 'Top 10 Group Ratings',
                    data: top10Movies.map(movie => movie.rating),
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            };

            // Create chart data for worst 10 movies
            const worst10ChartData = {
                labels: worst10Movies.map(movie => movie.title),
                datasets: [{
                    label: 'Worst 10 Group Ratings',
                    data: worst10Movies.map(movie => movie.rating),
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            };

            // Create chart data for all movies
            const allMoviesChartData = {
                labels: sortedData.map(movie => movie.title),
                datasets: [{
                    label: 'All Movies Group Ratings',
                    data: sortedData.map(movie => movie.rating),
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

            // Clear and create lists of top 10 and worst 10 movies
            const top10List = document.getElementById('top10List');
            top10List.innerHTML = ''; // Clear existing content
            top10Movies.forEach(movie => {
                const listItem = document.createElement('li');
                listItem.textContent = `${movie.title} - ${movie.rating}% rating`;
                top10List.appendChild(listItem);
            });

            const worst10List = document.getElementById('worst10List');
            worst10List.innerHTML = ''; // Clear existing content
            worst10Movies.forEach(movie => {
                const listItem = document.createElement('li');
                listItem.textContent = `${movie.title} - ${movie.rating}% rating`;
                worst10List.appendChild(listItem);
            });

            // "Now Showing" Section - Display last movie added with values
            const nowShowingElement = document.getElementById('nowShowing');
            if (nowShowingElement) {
                const lastMovie = sortedData[sortedData.length - 1];
                if (lastMovie && lastMovie.posterUrl) {
                    nowShowingElement.innerHTML = `
                        <h3>Now Showing: ${lastMovie.title}</h3>
                        <img src="${lastMovie.posterUrl}" alt="${lastMovie.title} poster" style="max-width: 200px;">
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
