fetch('https://our-2521-backend-dcf9451b4f85.herokuapp.com/getData')
    .then(response => response.json())
    .then(data => {
        // Filter movies with valid ratings
        const moviesWithRatings = data.filter(row => row[8] && !isNaN(row[8])); // Assuming column 9 (index 8) has the ratings

        // Sort by the last movie with a rating added
        const lastRatedMovie = moviesWithRatings[moviesWithRatings.length - 1];
        const lastRatedMovieTitle = lastRatedMovie[0]; // Assuming the title is in the first column (index 0)

        // Set the "Now Showing" section with the last rated movie details
        document.getElementById('nowShowingTitle').innerText = `Now Showing: ${lastRatedMovieTitle}`;

        // Fetch and set the movie poster
        fetchPoster(lastRatedMovieTitle).then(posterUrl => {
            document.getElementById('posterImage').src = posterUrl;
        });

        // Proceed with other chart and list rendering
        // (Existing chart rendering code goes here)
        // Example: plotChart('top10Chart', top10Data);
        // Example: plotChart('worst10Chart', worst10Data);
    })
    .catch(error => console.error('Error fetching data:', error));

// Function to fetch the movie poster URL
function fetchPoster(movieTitle) {
    const apiKey = 'your-omdb-api-key'; // Replace with your OMDB API key
    const url = `https://www.omdbapi.com/?t=${encodeURIComponent(movieTitle)}&apikey=${apiKey}`;

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.Response === "True") {
                return data.Poster;
            } else {
                return 'default-poster.jpg'; // Use a default image if no poster is found
            }
        })
        .catch(error => {
            console.error('Error fetching poster:', error);
            return 'default-poster.jpg'; // Fallback to a default image on error
        });
}
