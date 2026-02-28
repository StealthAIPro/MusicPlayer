const CLIENT_ID = '56d30c95';
const audioPlayer = document.getElementById('audioPlayer');
const mainPlayer = document.getElementById('mainPlayer');
const musicContainer = document.getElementById('musicContainer');
const playPauseBtn = document.getElementById('playPauseBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');

let currentPlaylist = [];
let isShuffle = false;
let isRepeat = false;

async function searchMusic(query) {
    const url = `https://api.jamendo.com/v3.0/tracks/?client_id=${CLIENT_ID}&format=jsonpretty&limit=20&search=${encodeURIComponent(query)}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        currentPlaylist = data.results;
        displayResults(currentPlaylist);
    } catch (e) {
        musicContainer.innerHTML = '<div class="loader-text">API Error. Use USB mode!</div>';
    }
}

function displayResults(songs) {
    musicContainer.innerHTML = '';
    songs.forEach((song, index) => {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.innerHTML = `
            <img src="${song.album_image || 'https://via.placeholder.com/200/222/bc13fe?text=USB'}" alt="cover">
            <h4>${song.name}</h4>
            <p>${song.artist_name}</p>
        `;
        card.onclick = () => playSong(song, index);
        musicContainer.appendChild(card);
    });
}

function playSong(song, index) {
    mainPlayer.classList.add('active');
    audioPlayer.src = song.audio || song.preview;
    document.getElementById('trackArt').src = song.album_image || 'https://via.placeholder.com/200/222/bc13fe?text=USB';
    document.getElementById('trackTitle').innerText = song.name;
    document.getElementById('trackArtist').innerText = song.artist_name;
    document.getElementById('downloadBtn').href = song.audio;
    
    audioPlayer.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

// Shuffle & Repeat Toggles
shuffleBtn.onclick = () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('toggle-active', isShuffle);
};

repeatBtn.onclick = () => {
    isRepeat = !isRepeat;
    repeatBtn.classList.toggle('toggle-active', isRepeat);
};

// Handle Song Ending
audioPlayer.onended = () => {
    if (isRepeat) {
        audioPlayer.play();
    } else if (isShuffle) {
        const randomIndex = Math.floor(Math.random() * currentPlaylist.length);
        playSong(currentPlaylist[randomIndex], randomIndex);
    }
    // Else: Stop or play next (can be added)
};

// Standard Controls
playPauseBtn.onclick = () => {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        audioPlayer.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
};

document.getElementById('timeSlider').oninput = (e) => {
    audioPlayer.currentTime = (e.target.value / 100) * audioPlayer.duration;
};

audioPlayer.ontimeupdate = () => {
    const prog = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    document.getElementById('timeSlider').value = prog || 0;
    document.getElementById('currentTime').innerText = formatTime(audioPlayer.currentTime);
    document.getElementById('durationTime').innerText = formatTime(audioPlayer.duration || 0);
};

function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0'+sec : sec}`;
}

document.getElementById('searchBtn').onclick = () => searchMusic(document.getElementById('searchInput').value);

// USB Upload
document.getElementById('fileUpload').onchange = (e) => {
    const files = Array.from(e.target.files);
    currentPlaylist = files.map(file => ({
        name: file.name.replace('.mp3', ''),
        artist_name: "Local USB",
        audio: URL.createObjectURL(file)
    }));
    displayResults(currentPlaylist);
};
