// Fetch data from the backend
fetch('https://our-2521-backend-dcf9451b4f85.herokuapp.com/getData')
    .then(response => response.json())
    .then(data => {
        if (!data || data.length === 0) {
            throw new Error('No data found');
        }

        // Extract relevant columns
        const movies = data.map(row => ({
            title: row[0],
            groupRating: parseFloat(row[8]) || 0, // Ensure it's a number
            posterUrl: row[17] || null, // Assume the poster URL is in column R
            lastUpdated: row[18] || null, // Assume the last updated date is in column S
        })).filter(movie => !isNaN(movie.groupRating)); // Filter out rows with invalid ratings

        // Sort movies by group rating
        const sortedMovies = [...movies].sort((a, b) => b.groupRating - a.groupRating);

        // Get Top 10 and Worst 10 movies
        const top10Movies = sortedMovies.slice(0, 10);
        const worst10Movies = sortedMovies.slice(-10).reverse(); // Reverse to have the worst at the top

        // Create chart data
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

        // Render Top 10 Movies Chart
        const top10Ctx = document.getElementById('top10Chart').getContext('2d');
        new Chart(top10Ctx, {
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

        // Render Worst 10 Movies Chart
        const worst10Ctx = document.getElementById('worst10Chart').getContext('2d');
        new Chart(worst10Ctx, {
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

        // Render Top 10 Movies List
        const top10List = document.getElementById('top10List');
        top10Movies.forEach(movie => {
            const li = document.createElement('li');
            li.textContent = `${movie.title} - ${movie.groupRating} rating`;
            top10List.appendChild(li);
        });

        // Render Worst 10 Movies List
        const worst10List = document.getElementById('worst10List');
        worst10Movies.forEach(movie => {
            const li = document.createElement('li');
            li.textContent = `${movie.title} - ${movie.groupRating} rating`;
            worst10List.appendChild(li);
        });

        // "Now Showing" Section - Display last movie added with values
        const lastMovie = movies[movies.length - 1];
        if (lastMovie && lastMovie.posterUrl) {
            document.getElementById('nowShowing').innerHTML = `
                <h3>Now Showing: ${lastMovie.title}</h3>
                <img src="${lastMovie.posterUrl}" alt="${lastMovie.title} poster" style="max-width: 200px;">
            `;
        }
    })
    .catch(error => console.error('Error fetching data:', error));
