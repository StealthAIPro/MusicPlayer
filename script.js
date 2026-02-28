const CLIENT_ID = '56d30c95';
const audioPlayer = document.getElementById('audioPlayer');
const mainPlayer = document.getElementById('mainPlayer');
const musicContainer = document.getElementById('musicContainer');
const playPauseBtn = document.getElementById('playPauseBtn');
const downloadBtn = document.getElementById('downloadBtn');
const timeSlider = document.getElementById('timeSlider');

let likedSongs = JSON.parse(localStorage.getItem('likedSongs')) || [];

window.onload = () => searchMusic('popular');

async function searchMusic(query) {
    musicContainer.innerHTML = '<div class="loader-text">📡 Signal found... Fetching beats...</div>';
    
    // Using 'tags' search which is more reliable for general searches
    const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${CLIENT_ID}&format=jsonpretty&limit=18&order=popularity_total&search=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (!data.results || data.results.length === 0) {
            musicContainer.innerHTML = '<div class="loader-text">❌ No results found. Try "Lofi".</div>';
            return;
        }
        displayResults(data.results);
    } catch (e) {
        musicContainer.innerHTML = '<div class="loader-text">⚠️ API Blocked. Use the "USB" button to play your own files!</div>';
    }
}

function displayResults(songs) {
    musicContainer.innerHTML = '';
    songs.forEach(song => {
        const card = document.createElement('div');
        card.className = 'song-card';
        const img = song.album_image || 'https://via.placeholder.com/300/222/bc13fe?text=USB';
        
        card.innerHTML = `
            <img src="${img}" alt="cover">
            <h4>${song.name}</h4>
            <p>${song.artist_name}</p>
        `;
        card.onclick = () => playSong(song);
        musicContainer.appendChild(card);
    });
}

function playSong(song) {
    // Show the player
    mainPlayer.classList.add('active');
    
    const streamUrl = song.audio || song.preview;
    audioPlayer.src = streamUrl;
    
    // Update UI
    document.getElementById('trackArt').src = song.album_image || 'https://via.placeholder.com/300/222/bc13fe?text=USB';
    document.getElementById('trackTitle').innerText = song.name;
    document.getElementById('trackArtist').innerText = song.artist_name;
    
    // Setup Download
    downloadBtn.href = streamUrl;
    downloadBtn.setAttribute('download', `${song.name}.mp3`);

    audioPlayer.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

// USB / Local File logic
document.getElementById('fileUpload').onchange = (e) => {
    const files = Array.from(e.target.files);
    const localTracks = files.map(file => ({
        name: file.name.replace('.mp3', ''),
        artist_name: "USB Drive",
        audio: URL.createObjectURL(file),
        album_image: ""
    }));
    displayResults(localTracks);
};

// Player Logic
audioPlayer.ontimeupdate = () => {
    if(audioPlayer.duration) {
        const prog = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        timeSlider.value = prog;
        document.getElementById('currentTime').innerText = formatTime(audioPlayer.currentTime);
        document.getElementById('durationTime').innerText = formatTime(audioPlayer.duration);
    }
};

timeSlider.oninput = () => audioPlayer.currentTime = (timeSlider.value / 100) * audioPlayer.duration;

function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0'+sec : sec}`;
}

playPauseBtn.onclick = () => {
    if (audioPlayer.paused) { audioPlayer.play(); playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>'; }
    else { audioPlayer.pause(); playPauseBtn.innerHTML = '<i class="fas fa-play"></i>'; }
};

document.getElementById('searchBtn').onclick = () => searchMusic(document.getElementById('searchInput').value);
document.getElementById('volumeSlider').oninput = (e) => audioPlayer.volume = e.target.value;
