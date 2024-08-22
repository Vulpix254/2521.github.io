document.addEventListener('DOMContentLoaded', () => {
    let top10ChartInstance;
    let worst10ChartInstance;
    let allMoviesChartInstance;

    const fetchData = async () => {
        try {
            const response = await fetch('https://our-2521-backend-dcf9451b4f85.herokuapp.com/getData');
            const data = await response.json();
            console.log("Raw data from backend:", data);

            // Filter out invalid ratings (where Group Rating is NaN or 0)
            const filteredData = data.filter(row => {
                const rating = parseFloat(row[8].replace('%', ''));
                return !isNaN(rating) && rating > 0;
            });

            console.log("Filtered data:", filteredData);

            if (filteredData.length === 0) {
                console.error('No valid data available to plot charts or lists.');
                return;
            }

            // Sort the filtered data by rating (ascending)
            const sortedData = filteredData.sort((a, b) => parseFloat(a[8].replace('%', '')) - parseFloat(b[8].replace('%', '')));

            // Get Top 10 Movies (highest ratings first)
            const top10Movies = sortedData.slice(-10).reverse();
            console.log("Top 10 Movies for Chart:", top10Movies);

            // Get Worst 10 Movies (lowest ratings first)
            const worst10Movies = sortedData.slice(0, 10);
            console.log("Worst 10 Movies for Chart:", worst10Movies);

            // Function to create chart
            const createChart = (ctx, data, label, colors) => {
                return new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: data.map(row => row[0]), // Movie titles
                        datasets: [{
                            label: label,
                            data: data.map(row => parseFloat(row[8].replace('%', ''))), // Group Rating
                            backgroundColor: colors.background,
                            borderColor: colors.border,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(tooltipItem) {
                                        return `${tooltipItem.label}: ${tooltipItem.raw}%`;
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100, // Set the maximum value of the Y-axis to 100
                                ticks: {
                                    callback: function(value) {
                                        return value + '%'; // Add percentage sign to Y-axis labels
                                    }
                                }
                            }
                        },
                        onClick: function(evt, activeElements) {
                            if (activeElements.length > 0) {
                                const index = activeElements[0].index;
                                const movieTitle = data[index][0]; // Movie title from the data
                                const searchUrl = `https://www.imdb.com/find/?q=${encodeURIComponent(movieTitle)}`;
                                window.open(searchUrl, '_blank');
                            }
                        }
                    }
                });
            };

            // Render the top 10 chart
            const top10Ctx = document.getElementById('top10Chart').getContext('2d');
            if (top10ChartInstance) {
                top10ChartInstance.destroy(); // Destroy existing chart if it exists
            }
            top10ChartInstance = createChart(
                top10Ctx,
                top10Movies,
                'Top 10 Group Ratings',
                {
                    background: 'rgba(75, 192, 192, 0.2)',
                    border: 'rgba(75, 192, 192, 1)'
                }
            );

            // Render the worst 10 chart
            const worst10Ctx = document.getElementById('worst10Chart').getContext('2d');
            if (worst10ChartInstance) {
                worst10ChartInstance.destroy(); // Destroy existing chart if it exists
            }
            worst10ChartInstance = createChart(
                worst10Ctx,
                worst10Movies,
                'Worst 10 Group Ratings',
                {
                    background: 'rgba(255, 99, 132, 0.2)',
                    border: 'rgba(255, 99, 132, 1)'
                }
            );

            // Pagination variables
            const itemsPerPage = 10;
            const totalPages = Math.ceil(sortedData.length / itemsPerPage);
            let currentPage = 1;

            // Function to update the 'All Movies' chart with pagination
            const updateChart = (page) => {
                const start = (page - 1) * itemsPerPage;
                const end = start + itemsPerPage;
                const pageData = sortedData.slice(start, end);

                // Destroy the previous chart instance if it exists
                if (allMoviesChartInstance) {
                    allMoviesChartInstance.destroy();
                }

                // Create a new chart instance
                allMoviesChartInstance = new Chart(document.getElementById('allMoviesChart').getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: pageData.map(row => row[0]),
                        datasets: [{
                            label: 'All Movies Ratings',
                            data: pageData.map(row => parseFloat(row[8].replace('%', ''))),
                            backgroundColor: 'rgba(153, 102, 255, 0.2)',
                            borderColor: 'rgba(153, 102, 255, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(tooltipItem) {
                                        return `${tooltipItem.label}: ${tooltipItem.raw}%`;
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100, // Set the maximum value of the Y-axis to 100
                                ticks: {
                                    callback: function(value) {
                                        return value + '%'; // Add percentage sign to Y-axis labels
                                    }
                                }
                            }
                        },
                        onClick: function(evt, activeElements) {
                            if (activeElements.length > 0) {
                                const index = activeElements[0].index;
                                const movieTitle = pageData[index][0]; // Movie title from the data
                                const searchUrl = `https://www.imdb.com/find/?q=${encodeURIComponent(movieTitle)}`;
                                window.open(searchUrl, '_blank');
                            }
                        }
                    }
                });

                // Update button states
                document.getElementById('prevPage').disabled = (page === 1);
                document.getElementById('nextPage').disabled = (page === totalPages);
            };

            // Initialize the first page of the 'All Movies' chart
            updateChart(currentPage);

            // Add event listeners for pagination buttons
            document.getElementById('prevPage').addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    updateChart(currentPage);
                }
            });

            document.getElementById('nextPage').addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    updateChart(currentPage);
                }
            });

            // Create lists of top 10 and worst 10 movies
            const top10List = document.getElementById('top10List');
            top10Movies.forEach(row => {
                const listItem = document.createElement('li');
                listItem.textContent = `${row[0]} - ${row[8]} rating`;
                top10List.appendChild(listItem);
            });

            // Sort the worst10Movies array by rating in ascending order
            const sortedWorst10Movies = worst10Movies.slice().sort((a, b) => parseFloat(a[8].replace('%', '')) - parseFloat(b[8].replace('%', '')));

            const worst10List = document.getElementById('worst10List');
            sortedWorst10Movies.forEach(row => {
                const listItem = document.createElement('li');
                listItem.textContent = `${row[0]} - ${row[8]} rating`;
                worst10List.appendChild(listItem);
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    fetchData();
});
