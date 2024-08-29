document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    
    console.log('Attempting to fetch data...');
    fetch('https://our-2521-backend-dcf9451b4f85.herokuapp.com/getData')
        .then(response => {
            console.log('Response received:', response);
            return response.json();
        })
        .then(data => {
            console.log('Data received:', data);

            if (!data || !Array.isArray(data) || data.length === 0) {
                console.error('No valid data found');
                return;
            }

            const movies = data.map(row => {
                if (Array.isArray(row) && row.length > 18) {
                    return {
                        title: row[0] || 'Unknown Title',
                        groupRating: parseFloat(row[8]) || 0,
                        posterUrl: row[17] || null,
                        lastUpdated: row[18] || null
                    };
                }
                return null;
            }).filter(movie => movie && movie.title && !isNaN(movie.groupRating));

            console.log('Filtered Movies:', movies);

            if (movies.length === 0) {
                console.error('No valid movies found after filtering');
                return;
            }

            const sortedMovies = [...movies].sort((a, b) => b.groupRating - a.groupRating);
            const top10Movies = sortedMovies.slice(0, 10);
            const worst10Movies = sortedMovies.slice(-10).reverse();

            const createChartData = (movies) => ({
                labels: movies.map(movie => movie.title),
                datasets: [{
                    label: 'Group Rating',
                    data: movies.map(movie => movie.groupRating),
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            });

            const top10Ctx = document.getElementById('top10Chart');
            const worst10Ctx = document.getElementById('worst10Chart');
            const allMoviesCtx = document.getElementById('allMoviesChart');

            if (top10Ctx && worst10Ctx && allMoviesCtx) {
                new Chart(top10Ctx.getContext('2d'), {
                    type: 'bar',
                    data: createChartData(top10Movies),
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });

                new Chart(worst10Ctx.getContext('2d'), {
                    type: 'bar',
                    data: createChartData(worst10Movies),
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });

                new Chart(allMoviesCtx.getContext('2d'), {
                    type: 'bar',
                    data: createChartData(sortedMovies),
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            } else {
                console.error('One or more chart contexts not found');
            }

            const top10List = document.getElementById('top10List');
            const worst10List = document.getElementById('worst10List');
            const nowShowingElement = document.getElementById('nowShowing');

            if (top10List && worst10List && nowShowingElement) {
                top10List.innerHTML = '';
                top10Movies.forEach(movie => {
                    const li = document.createElement('li');
                    li.textContent = `${movie.title} - ${movie.groupRating} rating`;
                    top10List.appendChild(li);
                });

                worst10List.innerHTML = '';
                worst10Movies.forEach(movie => {
                    const li = document.createElement('li');
                    li.textContent = `${movie.title} - ${movie.groupRating} rating`;
                    worst10List.appendChild(li);
                });

                const lastMovie = movies[movies.length - 1];
                if (lastMovie && lastMovie.posterUrl) {
                    nowShowingElement.innerHTML = `
                        <h3>Now Showing: ${lastMovie.title}</h3>
                        <img src="${lastMovie.posterUrl}" alt="${lastMovie.title} poster" style="max-width: 200px;">
                    `;
                } else {
                    nowShowingElement.textContent = 'No movie available for Now Showing.';
                }
            } else {
                console.error('One or more list elements not found');
            }
        })
        .catch(error => console.error('Error fetching data:', error));
});
