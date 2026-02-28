const CLIENT_ID = '56d30c95';
const audioPlayer = document.getElementById('audioPlayer');
const musicContainer = document.getElementById('musicContainer');
const playPauseBtn = document.getElementById('playPauseBtn');
const timeSlider = document.getElementById('timeSlider');

let likedSongs = JSON.parse(localStorage.getItem('likedSongs')) || [];
let currentView = 'explore';

// 1. Initial Load
window.onload = () => searchMusic('trending');

// 2. API Logic
async function searchMusic(query) {
    if (currentView === 'liked') return;
    musicContainer.innerHTML = '<div class="loader">Scanning Nebula...</div>';
    
    const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${CLIENT_ID}&format=jsonpretty&limit=24&search=${encodeURIComponent(query)}&include=musicinfo`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        displayResults(data.results);
    } catch (e) {
        musicContainer.innerHTML = '<div>Connection Error. Use USB mode?</div>';
    }
}

// 3. Display Logic
function displayResults(songs) {
    musicContainer.innerHTML = '';
    songs.forEach(song => {
        const isLiked = likedSongs.some(s => s.audio === (song.audio || song.preview));
        const card = document.createElement('div');
        card.className = 'song-card';
        
        const imgUrl = song.album_image || 'https://via.placeholder.com/300/222/bc13fe?text=USB+Track';
        const streamUrl = song.audio || song.preview;

        card.innerHTML = `
            <i class="fas fa-heart like-icon ${isLiked ? 'liked' : ''}"></i>
            <img src="${imgUrl}" alt="cover">
            <h4>${song.name}</h4>
            <p>${song.artist_name}</p>
        `;

        card.querySelector('img').onclick = () => playSong(song);
        card.querySelector('.like-icon').onclick = (e) => toggleLike(song, e.target);
        
        musicContainer.appendChild(card);
    });
}

// 4. USB / File Upload
document.getElementById('fileUpload').onchange = (e) => {
    const files = Array.from(e.target.files);
    const localTracks = files.map(file => ({
        name: file.name.replace(/\.[^/.]+$/, ""),
        artist_name: "Local USB File",
        audio: URL.createObjectURL(file),
        album_image: "https://via.placeholder.com/300/222/bc13fe?text=USB"
    }));
    displayResults(localTracks);
};

// 5. Like System
function toggleLike(song, el) {
    const streamUrl = song.audio || song.preview;
    const index = likedSongs.findIndex(s => s.audio === streamUrl);
    
    if (index === -1) {
        likedSongs.push({...song, audio: streamUrl});
        el.classList.add('liked');
    } else {
        likedSongs.splice(index, 1);
        el.classList.remove('liked');
        if (currentView === 'liked') el.parentElement.remove();
    }
    localStorage.setItem('likedSongs', JSON.stringify(likedSongs));
}

function showSection(section) {
    currentView = section;
    document.getElementById('tab-explore').className = section === 'explore' ? 'active' : '';
    document.getElementById('tab-liked').className = section === 'liked' ? 'active' : '';
    
    if (section === 'liked') {
        displayResults(likedSongs);
    } else {
        searchMusic('trending');
    }
}

// 6. Player Control
function playSong(song) {
    audioPlayer.src = song.audio || song.preview;
    document.getElementById('trackArt').src = song.album_image || 'https://via.placeholder.com/300/222/bc13fe?text=USB';
    document.getElementById('trackTitle').innerText = song.name;
    document.getElementById('trackArtist').innerText = song.artist_name;
    audioPlayer.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

playPauseBtn.onclick = () => {
    if (audioPlayer.paused) { audioPlayer.play(); playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>'; }
    else { audioPlayer.pause(); playPauseBtn.innerHTML = '<i class="fas fa-play"></i>'; }
};

// 7. Time/Progress logic
audioPlayer.ontimeupdate = () => {
    const prog = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    timeSlider.value = prog || 0;
    document.getElementById('currentTime').innerText = formatTime(audioPlayer.currentTime);
    document.getElementById('durationTime').innerText = formatTime(audioPlayer.duration || 0);
};

timeSlider.oninput = () => audioPlayer.currentTime = (timeSlider.value / 100) * audioPlayer.duration;

function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0'+sec : sec}`;
}

document.getElementById('searchBtn').onclick = () => searchMusic(document.getElementById('searchInput').value);
document.getElementById('volumeSlider').oninput = (e) => audioPlayer.volume = e.target.value;
