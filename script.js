const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const musicContainer = document.getElementById('musicContainer');
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');

async function searchMusic(query) {
    if (!query) return;
    
    // Show loading state
    musicContainer.innerHTML = '<div class="loader-text">🔍 Searching the airwaves...</div>';
    
    // Encode the query (handles spaces like "Taylor Swift")
    const encodedQuery = encodeURIComponent(query);
    const url = `https://itunes.apple.com/search?term=${encodedQuery}&entity=song&limit=20`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        
        if (data.resultCount === 0) {
            musicContainer.innerHTML = '<div class="loader-text">❌ No songs found. Try another search!</div>';
            return;
        }

        displayResults(data.results);
    } catch (error) {
        console.error("Search Error:", error);
        musicContainer.innerHTML = `<div class="loader-text">⚠️ Error: ${error.message}. Check your internet connection.</div>`;
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
