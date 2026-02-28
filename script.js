const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const musicContainer = document.getElementById('musicContainer');
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');

async function searchMusic(query) {
    // 1. Clean up the search term (remove extra spaces)
    const term = query.trim();
    
    if (!term) {
        musicContainer.innerHTML = '<div class="loader-text">Please enter a song or artist name!</div>';
        return;
    }
    
    // 2. See what's happening in the background
    console.log("Searching for:", term);
    
    musicContainer.innerHTML = '<div class="loader-text">🔍 Searching the airwaves...</div>';
    
    // 3. Use a slightly broader search URL
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&limit=24&media=music`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        console.log("API Response:", data); // Check if data actually came back

        if (data.resultCount === 0) {
            musicContainer.innerHTML = `<div class="loader-text">❌ No results for "${term}". Try searching something famous like "Dua Lipa".</div>`;
            return;
        }

        displayResults(data.results);
    } catch (error) {
        console.error("Detailed Error:", error);
        musicContainer.innerHTML = '<div class="loader-text">⚠️ Connection Error. Are you online?</div>';
    }
}

function displayResults(songs) {
    musicContainer.innerHTML = ''; // Clear previous results
    
    songs.forEach(song => {
        const card = document.createElement('div');
        card.className = 'song-card';
        // Using a higher resolution image from iTunes
        const artwork = song.artworkUrl100.replace('100x100bb.jpg', '400x400bb.jpg');
        
        card.innerHTML = `
            <img src="${artwork}" alt="Cover">
            <h4>${song.trackName}</h4>
            <p>${song.artistName}</p>
        `;
        
        card.onclick = () => playSong(song);
        musicContainer.appendChild(card);
    });
}

function playSong(song) {
    audioPlayer.src = song.previewUrl;
    document.getElementById('trackArt').src = song.artworkUrl100;
    document.getElementById('trackTitle').innerText = song.trackName;
    document.getElementById('trackArtist').innerText = song.artistName;
    
    audioPlayer.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

// Event Listeners
searchBtn.addEventListener('click', () => searchMusic(searchInput.value));

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchMusic(searchInput.value);
    }
});

playPauseBtn.onclick = () => {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        audioPlayer.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
};
