const audioPlayer = document.getElementById('audioPlayer');
const mainPlayer = document.getElementById('mainPlayer');
const musicContainer = document.getElementById('musicContainer');
const playPauseBtn = document.getElementById('playPauseBtn');

let currentPlaylist = [];
let currentIndex = 0;
let isShuffle = false;
let isRepeat = false;

// 1. Search Logic using Deezer (via Proxy to prevent CORS errors)
async function searchMusic(query) {
    if (!query) return;
    musicContainer.innerHTML = '<div class="loader-text">Searching the galaxy...</div>';

    // This proxy helps bypass browser security blocks
    const proxy = "https://corsproxy.io/?";
    const url = `${proxy}${encodeURIComponent(`https://api.deezer.com/search?q=${query}`)}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        currentPlaylist = data.data;
        displayResults(currentPlaylist);
    } catch (e) {
        musicContainer.innerHTML = '<div class="loader-text">Connection blocked. Use USB mode or try a different browser!</div>';
    }
}

function displayResults(songs) {
    musicContainer.innerHTML = '';
    songs.forEach((song, index) => {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.innerHTML = `
            <img src="${song.album.cover_medium}" alt="cover">
            <h4 style="margin:10px 0 5px; font-size:14px; white-space:nowrap; overflow:hidden;">${song.title}</h4>
            <p style="color:#888; font-size:12px;">${song.artist.name}</p>
        `;
        card.onclick = () => playSong(index);
        musicContainer.appendChild(card);
    });
}

function playSong(index) {
    currentIndex = index;
    const song = currentPlaylist[currentIndex];
    
    mainPlayer.classList.add('active');
    audioPlayer.src = song.preview; // Deezer provides 30s high-quality previews
    
    document.getElementById('trackArt').src = song.album.cover_small;
    document.getElementById('trackTitle').innerText = song.title;
    document.getElementById('trackArtist').innerText = song.artist.name;
    document.getElementById('downloadBtn').href = song.link;

    audioPlayer.play();
    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

// 2. Controls (Shuffle & Repeat)
document.getElementById('shuffleBtn').onclick = (e) => {
    isShuffle = !isShuffle;
    e.currentTarget.classList.toggle('toggle-active', isShuffle);
};

document.getElementById('repeatBtn').onclick = (e) => {
    isRepeat = !isRepeat;
    e.currentTarget.classList.toggle('toggle-active', isRepeat);
};

audioPlayer.onended = () => {
    if (isRepeat) {
        audioPlayer.play();
    } else {
        let nextIndex = isShuffle ? Math.floor(Math.random() * currentPlaylist.length) : currentIndex + 1;
        if (nextIndex < currentPlaylist.length) playSong(nextIndex);
    }
};

// 3. USB Upload Logic
document.getElementById('fileUpload').onchange = (e) => {
    const files = Array.from(e.target.files);
    currentPlaylist = files.map(file => ({
        title: file.name.replace('.mp3', ''),
        artist: { name: "Local File" },
        album: { cover_medium: "https://via.placeholder.com/200/222/bc13fe?text=USB" },
        preview: URL.createObjectURL(file)
    }));
    displayResults(currentPlaylist);
};

// Player Mechanics
playPauseBtn.onclick = () => {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        audioPlayer.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
};

audioPlayer.ontimeupdate = () => {
    const prog = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    document.getElementById('timeSlider').value = prog || 0;
    document.getElementById('currentTime').innerText = formatTime(audioPlayer.currentTime);
    document.getElementById('durationTime').innerText = formatTime(audioPlayer.duration || 0);
};

document.getElementById('timeSlider').oninput = (e) => {
    audioPlayer.currentTime = (e.target.value / 100) * audioPlayer.duration;
};

function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0'+sec : sec}`;
}

document.getElementById('searchBtn').onclick = () => searchMusic(document.getElementById('searchInput').value);
document.getElementById('volumeSlider').oninput = (e) => audioPlayer.volume = e.target.value;
