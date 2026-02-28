const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const musicContainer = document.getElementById('musicContainer');
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');

// Function to fetch music
async function searchMusic(query) {
    if (!query) return;
    
    musicContainer.innerHTML = '<div class="loader-text">Tuning in...</div>';
    
    try {
        const response = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=20`);
        const data = await response.json();
        displayResults(data.results);
    } catch (error) {
        console.error("Error fetching music:", error);
    }
}

// Function to display results
function displayResults(songs) {
    musicContainer.innerHTML = '';
    
    songs.forEach(song => {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.innerHTML = `
            <img src="${song.artworkUrl100.replace('100x100', '400x400')}" alt="Cover">
            <h4>${song.trackName}</h4>
            <p>${song.artistName}</p>
        `;
        
        card.onclick = () => playSong(song);
        musicContainer.appendChild(card);
    });
}

// Player controls
function playSong(song) {
    audioPlayer.src = song.previewUrl;
    document.getElementById('trackArt').src = song.artworkUrl100;
    document.getElementById('trackTitle').innerText = song.trackName;
    document.getElementById('trackArtist').innerText = song.artistName;
    
    audioPlayer.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

playPauseBtn.onclick = () => {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        audioPlayer.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
};

// Search listeners
searchBtn.onclick = () => searchMusic(searchInput.value);
searchInput.onkeypress = (e) => { if (e.key === 'Enter') searchMusic(searchInput.value); };

// Volume Control
document.getElementById('volumeSlider').oninput = (e) => {
    audioPlayer.volume = e.target.value;
};
