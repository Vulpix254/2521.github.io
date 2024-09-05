document.addEventListener('DOMContentLoaded', () => {
    const fetchMoviePoster = async (movieTitle) => {
        const response = await fetch('/getOMDBApiKey');
        const { apiKey } = await response.json(); // Fetch OMDB API key from backend
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

                // Update chart labels and data for current movies
                allMoviesChart.data.labels = currentMovies.map(row => row[0]); // Movie titles
                allMoviesChart.data.datasets[0].data = currentMovies.map(row => parseFloat(row[8])); // Group Rating
                allMoviesChart.update(); // Re-render the chart with updated data
            };

            // Chart Instances
            const ctxTop10 = document.getElementById('top10Chart').getContext('2d');
            const ctxWorst10 = document.getElementById('worst10Chart').getContext('2d');
            const ctxAllMovies = document.getElementById('allMoviesChart').getContext('2d');

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
            new Chart(ctxTop10, {
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
            new Chart(ctxWorst10, {
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
            const allMoviesChart = new Chart(ctxAllMovies, {
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
            const lastUpdatedMovie = sortedData.find(movie => parseFloat(movie[8]) > 0); // Find the last movie with a valid rating
            if (lastUpdatedMovie) {
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
            }

            // Add event listeners to open a new tab with a search for the movie title when a bar is clicked
            const addChartClickEvent = (chart, movies) => {
                chart.canvas.addEventListener('click', (event) => {
                    const activePoint = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
                    if (activePoint.length > 0) {
                        const movieIndex = activePoint[0].index;
                        const movieTitle = movies[movieIndex][0];
                        const searchUrl = `https://www.imdb.com/find?q=${encodeURIComponent(movieTitle)}`;
                        window.open(searchUrl, '_blank');
                    }
                });
            };

            addChartClickEvent(allMoviesChart, sortedData);  // For the paginated "All Movies" chart

            // Handle pagination
            const prevButton = document.getElementById('prevButton');
            const nextButton = document.getElementById('nextButton');

            const updatePaginationButtons = () => {
                prevButton.disabled = currentPage === 1;
                nextButton.disabled = currentPage === totalPages;
            };

            prevButton.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    updateAllMoviesChart();
                    updatePaginationButtons();
                }
            });

            nextButton.addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    updateAllMoviesChart();
                    updatePaginationButtons();
                }
            });

            updatePaginationButtons(); // Initialize pagination buttons

        })
        .catch(error => console.error('Error fetching movie data:', error));
});
