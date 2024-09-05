document.addEventListener('DOMContentLoaded', () => {
    const fetchMoviePoster = async (movieTitle) => {
        const response = await fetch('https://our-2521-backend-dcf9451b4f85.herokuapp.com/getOMDBApiKey');
        const data = await response.json();
        const apiKey = data.apiKey;
        const url = `https://www.omdbapi.com/?t=${encodeURIComponent(movieTitle)}&apikey=${apiKey}`;

        try {
            const response = await fetch(url);
            const movieData = await response.json();
            if (movieData.Response === 'True') {
                return movieData.Poster;
            } else {
                console.error('Error fetching movie poster:', movieData.Error);
                return null;
            }
        } catch (error) {
            console.error('Error fetching movie poster:', error);
            return null;
        }
    };

    fetch('https://our-2521-backend-dcf9451b4f85.herokuapp.com/getData') // Correct Heroku backend URL
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

            const sortedData = filteredData.sort((a, b) => b[8] - a[8]);

            const top10Movies = sortedData.slice(0, 10);
            const worst10Movies = sortedData.slice(-10).reverse();

            const moviesPerPage = 10;
            let currentPage = 1;
            const totalPages = Math.ceil(sortedData.length / moviesPerPage);

            const updateAllMoviesChart = () => {
                const startIndex = (currentPage - 1) * moviesPerPage;
                const endIndex = Math.min(startIndex + moviesPerPage, sortedData.length);
                const currentMovies = sortedData.slice(startIndex, endIndex);

                const allMoviesChartData = {
                    labels: currentMovies.map(row => row[0]),
                    datasets: [{
                        label: 'All Movies Group Ratings',
                        data: currentMovies.map(row => parseFloat(row[8])),
                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 1
                    }]
                };

                allMoviesChart.data = allMoviesChartData;
                allMoviesChart.update();
            };

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

            const top10ChartData = {
                labels: top10Movies.map(row => row[0]),
                datasets: [{
                    label: 'Top 10 Group Ratings',
                    data: top10Movies.map(row => parseFloat(row[8])),
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            };

            const worst10ChartData = {
                labels: worst10Movies.map(row => row[0]),
                datasets: [{
                    label: 'Worst 10 Group Ratings',
                    data: worst10Movies.map(row => parseFloat(row[8])),
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            };

            const allMoviesChartData = {
                labels: [],
                datasets: [{
                    label: 'All Movies Group Ratings',
                    data: [],
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }]
            };

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

            updateAllMoviesChart();

            const top10List = document.getElementById('top10List');
            top10List.innerHTML = '';
            top10Movies.forEach(row => {
                const listItem = document.createElement('li');
                listItem.textContent = `${row[0]} - ${row[8]} rating`;
                top10List.appendChild(listItem);
            });

            const worst10List = document.getElementById('worst10List');
            worst10List.innerHTML = '';
            worst10Movies.forEach(row => {
                const listItem = document.createElement('li');
                listItem.textContent = `${row[0]} - ${row[8]} rating`;
                worst10List.appendChild(listItem);
            });

            const lastUpdatedMovie = sortedData[0];
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

            const addChartClickEvent = (chart, movies) => {
                chart.canvas.addEventListener('click', (event) => {
                    const activePoint = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true)[0];
                    if (activePoint) {
                        const movieIndex = activePoint.index;
                        const movieTitle = movies[movieIndex][0];
                        const searchUrl = `https://www.imdb.com/find?q=${encodeURIComponent(movieTitle)}`;
                        window.open(searchUrl, '_blank');
                    }
                });
            };

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
