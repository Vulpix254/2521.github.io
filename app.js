document.addEventListener('DOMContentLoaded', () => {
    let allMoviesChartInstance = null; // Variable to keep track of the current chart instance

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
                const ratingStr = row[8];
                const rating = parseFloat(ratingStr.replace('%', '').trim());
                return { ...row, rating };
            }).sort((a, b) => b.rating - a.rating);

            console.log("Sorted data (highest to lowest rating):", sortedData);

            // Get Top 10 Movies (highest ratings)
            const top10Movies = sortedData.slice(0, 10);
            console.log("Top 10 Movies for Chart:", top10Movies);

            // Get Worst 10 Movies (lowest ratings)
            const worst10Movies = sortedData.slice(-10);
            console.log("Worst 10 Movies for Chart:", worst10Movies);

            // Chart options
            const commonChartOptions = {
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
                        ticks: {
                            callback: function(value) {
                                return value + '%'; // Add percentage sign to Y-axis labels
                            }
                        }
                    }
                }
            };

            // Plotting Charts for Top 10 and Worst 10
            const ctxTop10 = document.getElementById('top10Chart').getContext('2d');
            const ctxWorst10 = document.getElementById('worst10Chart').getContext('2d');

            new Chart(ctxTop10, {
                type: 'bar',
                data: {
                    labels: top10Movies.map(row => row[0]),
                    datasets: [{
                        label: 'Top 10 Group Ratings',
                        data: top10Movies.map(row => row.rating),
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: commonChartOptions
            });

            new Chart(ctxWorst10, {
                type: 'bar',
                data: {
                    labels: worst10Movies.map(row => row[0]),
                    datasets: [{
                        label: 'Worst 10 Group Ratings',
                        data: worst10Movies.map(row => row.rating),
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }]
                },
                options: commonChartOptions
            });

            // Create lists of top 10 and worst 10 movies
            const top10List = document.getElementById('top10List');
            top10List.innerHTML = '';
            top10Movies.forEach(row => {
                const listItem = document.createElement('li');
                listItem.textContent = `${row[0]} - ${row.rating}% rating`;
                top10List.appendChild(listItem);
            });

            const worst10List = document.getElementById('worst10List');
            worst10List.innerHTML = '';
            worst10Movies.forEach(row => {
                const listItem = document.createElement('li');
                listItem.textContent = `${row[0]} - ${row.rating}% rating`;
                worst10List.appendChild(listItem);
            });

            // Pagination setup
            const itemsPerPage = 10;
            let currentPage = 1;
            const totalPages = Math.ceil(sortedData.length / itemsPerPage);

            const ctxAllMovies = document.getElementById('allMoviesChart').getContext('2d');
            const updateChart = (page) => {
                const start = (page - 1) * itemsPerPage;
                const end = start + itemsPerPage;
                const pageData = sortedData.slice(start, end);

                // Destroy the previous chart instance if it exists
                if (allMoviesChartInstance) {
                    allMoviesChartInstance.destroy();
                }

                // Create a new chart instance
                allMoviesChartInstance = new Chart(ctxAllMovies, {
                    type: 'bar',
                    data: {
                        labels: pageData.map(row => row[0]),
                        datasets: [{
                            label: 'All Movies Ratings',
                            data: pageData.map(row => row.rating),
                            backgroundColor: 'rgba(153, 102, 255, 0.2)',
                            borderColor: 'rgba(153, 102, 255, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: commonChartOptions
                });

                // Update button states
                document.getElementById('prevPage').disabled = (page === 1);
                document.getElementById('nextPage').disabled = (page === totalPages);
            };

            // Event listeners for pagination buttons
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

            // Initial chart update
            updateChart(currentPage);
        })
        .catch(error => console.error('Error fetching data:', error));
    });
