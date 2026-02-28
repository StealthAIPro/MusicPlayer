const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const musicContainer = document.getElementById('musicContainer');
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const timeSlider = document.getElementById('timeSlider');
const currentTimeLabel = document.getElementById('currentTime');
const durationTimeLabel = document.getElementById('durationTime');

// Use a reliable Jamendo Client ID
const CLIENT_ID = '56d30c95'; 

// 1. Load Trending Music on Startup
window.onload = () => {
    fetchMusic('https://api.jamendo.com/v3.0/tracks/?client_id=' + CLIENT_ID + '&format=jsonpretty&limit=20&order=boostpopularity_month');
};

// 2. Search Logic
async function searchMusic(query) {
    if (!query) return;
    musicContainer.innerHTML = '<div class="loader-text">Searching for "' + query + '"...</div>';
    
    // We search by "fuzzy" tags and names for better results
    const searchUrl = `https://api.jamendo.com/v3.0/tracks/?client_id=${CLIENT_ID}&format=jsonpretty&limit=20&search=${encodeURIComponent(query)}`;
    fetchMusic(searchUrl);
}

async function fetchMusic(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            musicContainer.innerHTML = '<div class="loader-text">❌ No tracks found. Try "Electronic" or "Chill".</div>';
            return;
        }
        displayResults(data.results);
    } catch (error) {
        console.error("API Error:", error);
        musicContainer.innerHTML = '<div class="loader-text">⚠️ Connection error. Check your firewall!</div>';
    }
}

function displayResults(songs) {
    musicContainer.innerHTML = '';
    songs.forEach(song => {
        const card = document.createElement('div');
        card.className = 'song-card';
        // Using high-res cover art
        const cover = song.album_image ? song.album_image.replace('1.200.jpg', '1.500.jpg') : 'https://via.placeholder.com/300/222/bc13fe?text=No+Cover';
        
        card.innerHTML = `
            <img src="${cover}" alt="Cover">
            <h4>${song.name}</h4>
            <p>${song.artist_name}</p>
        `;
        card.onclick = () => playSong(song);
        musicContainer.appendChild(card);
    });
}

// 3. Player Controls
function playSong(song) {
    audioPlayer.src = song.audio;
    document.getElementById('trackArt').src = song.album_image;
    document.getElementById('trackTitle').innerText = song.name;
    document.getElementById('trackArtist').innerText = song.artist_name;
    
    audioPlayer.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

audioPlayer.addEventListener('timeupdate', () => {
    if (audioPlayer.duration) {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        timeSlider.value = progress;
        currentTimeLabel.innerText = formatTime(audioPlayer.currentTime);
        durationTimeLabel.innerText = formatTime(audioPlayer.duration);
    }
});

timeSlider.addEventListener('input', () => {
    const seekTime = (timeSlider.value / 100) * audioPlayer.duration;
    audioPlayer.currentTime = seekTime;
});

function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
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

searchBtn.onclick = () => searchMusic(searchInput.value);
searchInput.onkeypress = (e) => { if (e.key === 'Enter') searchMusic(searchInput.value); };
