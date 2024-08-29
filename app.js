document.addEventListener('DOMContentLoaded', () => {
    const fetchMoviePoster = async (movieTitle) => {
        const apiKey = process.env.OMDB_API_KEY; // Ensure your OMDB API key is available in your environment variables
        const url = `https://www.omdbapi.com/?t=${encodeURIComponent(movieTitle)}&apikey=${apiKey}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.Response === 'True') {
                return data.Poster;
            } else {
                console.error('Error fetching movie poster:', data.Error);
                return null;
            }
        } catch (error) {
            console.error('Error fetching movie poster:', error);
            return null;
        }
    };

    fetch('https://our-2521-backend-dcf9451b4f85.herokuapp.com/getData')
        .then(response => response.json())
        .then(async data => {
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

            // Pagination
            const moviesPerPage = 10;
            let currentPage = 1;
            const totalPages = Math.ceil(sortedData.length / moviesPerPage);

            const updateAllMoviesChart = () => {
                const startIndex = (currentPage - 1) * moviesPerPage;
                const endIndex = Math.min(startIndex + moviesPerPage, sortedData.length);
                const currentMovies = sortedData.slice(startIndex, endIndex);

                const allMoviesChartData = {
                    labels: currentMovies.map(row => row[0]), // Movie titles
                    datasets: [{
                        label: 'All Movies Group Ratings',
                        data: currentMovies.map(row => parseFloat(row[8])), // Group Rating
                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 1
                    }]
                };

                allMoviesChart.data = allMoviesChartData;
                allMoviesChart.update();
            };

            // Chart Instances
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
                labels: [], // Will be updated on pagination
                datasets: [{
                    label: 'All Movies Group Ratings',
                    data: [], // Will be updated on pagination
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

            // Initialize the all movies chart
            const allMoviesChart = new Chart(allMoviesCtx, {
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

            // Update all movies chart with the current page
            updateAllMoviesChart();

            // Create lists of top 10 and worst 10 movies
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

            // Fetch and render "Now Showing" movie poster
            const lastUpdatedMovie = sortedData[0]; // Assuming the first one is the most recently updated
            const posterUrl = await fetchMoviePoster(lastUpdatedMovie[0]);

            const nowShowing = document.getElementById('nowShowing');
            if (posterUrl) {
                nowShowing.innerHTML = `
                    <h3>Now Showing: ${lastUpdatedMovie[0]}</h3>
                    <img src="${posterUrl}" alt="${lastUpdatedMovie[0]} poster" style="max-width: 200px;">
                `;
            } else {
                nowShowing.innerHTML = 'No movie available for Now Showing.';
            }

            // Add event listeners to open a new tab with a search for the movie title when a bar is clicked
            const addChartClickEvent = (chart, movies) => {
                chart.canvas.addEventListener('click', (event) => {
                    const activePoint = chart.getElementAtEvent(event)[0];
                    if (activePoint) {
                        const movieIndex = activePoint.index;
                        const movieTitle = movies[movieIndex][0];
                        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(movieTitle)}`;
                        window.open(searchUrl, '_blank');
                    }
                });
            };

            // Initialize the top 10 and worst 10 charts with click events
            addChartClickEvent(new Chart(top10Ctx, {
                type: 'bar',
                data: top10ChartData,
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            }), top10Movies);

            addChartClickEvent(new Chart(worst10Ctx, {
                type: 'bar',
                data: worst10ChartData,
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            }), worst10Movies);

            addChartClickEvent(allMoviesChart, sortedData);

            // Pagination Controls
            document.getElementById('prevPage').addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    updateAllMoviesChart();
                    updatePaginationButtons();
                }
            });

            document.getElementById('nextPage').addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    updateAllMoviesChart();
                    updatePaginationButtons();
                }
            });

            const updatePaginationButtons = () => {
                document.getElementById('prevPage').disabled = (currentPage === 1);
                document.getElementById('nextPage').disabled = (currentPage === totalPages);
            };

            updatePaginationButtons();
        })
        .catch(error => console.error('Error fetching data:', error));
});
