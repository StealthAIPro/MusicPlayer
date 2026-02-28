const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const musicContainer = document.getElementById('musicContainer');
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const timeSlider = document.getElementById('timeSlider');
const currentTimeLabel = document.getElementById('currentTime');
const durationTimeLabel = document.getElementById('durationTime');

// 1. Search Logic
async function searchMusic(query) {
    if (!query) return;
    musicContainer.innerHTML = '<div class="loader-text">Loading full tracks...</div>';
    
    // Jamendo API URL (Public Client ID for testing)
    const url = `https://api.jamendo.com/v3.0/tracks/?client_id=56d30c95&format=jsonpretty&limit=20&namesearch=${encodeURIComponent(query)}&include=musicinfo`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.results.length === 0) {
            musicContainer.innerHTML = '<div>No tracks found. Try "Lofi" or "Rock".</div>';
            return;
        }
        displayResults(data.results);
    } catch (error) {
        musicContainer.innerHTML = '<div>Error connecting to music library.</div>';
    }
}

function displayResults(songs) {
    musicContainer.innerHTML = '';
    songs.forEach(song => {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.innerHTML = `
            <img src="${song.album_image || 'https://via.placeholder.com/200'}" alt="Cover">
            <h4>${song.name}</h4>
            <p>${song.artist_name}</p>
        `;
        card.onclick = () => playSong(song);
        musicContainer.appendChild(card);
    });
}

function playSong(song) {
    audioPlayer.src = song.audio; // Full song URL
    document.getElementById('trackArt').src = song.album_image;
    document.getElementById('trackTitle').innerText = song.name;
    document.getElementById('trackArtist').innerText = song.artist_name;
    
    audioPlayer.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

// 2. Time Slider & Progress Logic
audioPlayer.addEventListener('timeupdate', () => {
    if (audioPlayer.duration) {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        timeSlider.value = progress;
        
        // Update Time Labels
        currentTimeLabel.innerText = formatTime(audioPlayer.currentTime);
        durationTimeLabel.innerText = formatTime(audioPlayer.duration);
    }
});

// Seeking (User clicks the slider)
timeSlider.addEventListener('input', () => {
    const seekTime = (timeSlider.value / 100) * audioPlayer.duration;
    audioPlayer.currentTime = seekTime;
});

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
}

// 3. Basic Controls
playPauseBtn.onclick = () => {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        audioPlayer.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
};

document.getElementById('volumeSlider').oninput = (e) => {
    audioPlayer.volume = e.target.value;
};

searchBtn.onclick = () => searchMusic(searchInput.value);
searchInput.onkeypress = (e) => { if (e.key === 'Enter') searchMusic(searchInput.value); };
