const player = document.getElementById("audioPlayer");

const artists = document.querySelectorAll(".artist");

const playBtn = document.getElementById("playBtn");
const pauseBtn = document.getElementById("pauseBtn");
pauseBtn.style.display = "none";
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const progress = document.getElementById("progress");
const volume = document.getElementById("volume");

const songTitle = document.getElementById("songTitle");
const currentCover = document.getElementById("currentCover");
const playingGif = document.getElementById("playingGif");

const playerFavoriteBtn = document.getElementById("playerFavoriteBtn");
const currentTimeLabel = document.getElementById("currentTime");
const totalTimeLabel = document.getElementById("totalTime");
const volumePercent = document.getElementById("volumePercent");
const muteBtn = document.getElementById("muteBtn");
const themeToggle = document.getElementById("themeToggle");

const searchInput = document.getElementById("searchInput");

const queueToggle = document.getElementById("queueToggle");
const queuePanel = document.getElementById("queuePanel");
const closeQueue = document.getElementById("closeQueue");
const queueCurrentSong = document.getElementById("queueCurrentSong");
const queueList = document.getElementById("queueList");

if (searchInput) {
    searchInput.addEventListener("input", () => {
        const search = searchInput.value.toLowerCase().trim();

        artists.forEach((artist) => {
            const title = (artist.dataset.title || "").toLowerCase();

            if (title.includes(search)) {
                artist.style.display = "inline-block";
            } else {
                artist.style.display = "none";
            }
        });
    });
}

let songs = [];
let currentIndex = 0;
let shuffleMode = false;
let repeatMode = false;
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

const shuffleBtn = document.querySelector('.fa-shuffle');
const repeatBtn = document.querySelector('.fa-repeat');

artists.forEach((artist, index) => {

    songs.push(artist.dataset.song);

    artist.addEventListener("click", () => {

        currentIndex = index;
        loadSong(currentIndex);
        player.play();
        updatePlayerButtons();

    });

});

document.querySelectorAll('.favorite-btn').forEach((btn, index) => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToFavorites(index);
    });
});

shuffleBtn.addEventListener('click', () => {
    shuffleMode = !shuffleMode;
    shuffleBtn.style.color = shuffleMode ? '#1DB954' : 'white';
    renderQueue();
});

queueToggle?.addEventListener("click", () => {
    queuePanel.classList.toggle("open");
    renderQueue();
});

closeQueue?.addEventListener("click", () => {
    queuePanel.classList.remove("open");
});

repeatBtn.addEventListener('click', () => {
    repeatMode = !repeatMode;
    repeatBtn.style.color = repeatMode ? '#1DB954' : 'white';
    renderQueue();
});

function saveFavorites() {
    localStorage.setItem("favorites", JSON.stringify(favorites));
}

function addToFavorites(index) {
    const song = {
        title: artists[index].dataset.title,
        src: songs[index]
    };

    const existing = favorites.findIndex(f => f.src === song.src);

    if (existing === -1) {
        favorites.push(song);
    } else {
        favorites.splice(existing, 1);
    }

    saveFavorites();
    renderFavorites();
    updateFavoriteIcons();
}

function updateFavoriteIcons() {
    document.querySelectorAll('.favorite-btn').forEach((btn, index) => {
        const liked = favorites.some(f => f.src === songs[index]);
        btn.classList.toggle('fa-solid', liked);
        btn.classList.toggle('fa-regular', !liked);
        btn.style.color = liked ? '#1DB954' : '';
    });
    if (playerFavoriteBtn) {
        const liked = favorites.some(f => f.src === songs[currentIndex]);
        playerFavoriteBtn.classList.toggle('fa-solid', liked);
        playerFavoriteBtn.classList.toggle('fa-regular', !liked);
        playerFavoriteBtn.style.color = liked ? '#1DB954' : '';
    }
}

function renderFavorites(filter = '') {
    const section = document.getElementById('favoritesSection');
    const list = document.getElementById('favoritesList');
    if (!section || !list) return;

    list.innerHTML = '';

    favorites
        .filter(song => song.title.toLowerCase().includes(filter.toLowerCase()))
        .forEach(song => {
            const row = document.createElement('div');
            row.className = 'favorite-row';
            row.innerHTML = `
                <span>${song.title}</span>
                <button class="playFav">▶</button>
                <button class="removeFav">🗑</button>
            `;

            row.querySelector('.playFav').addEventListener('click', () => {
                const index = songs.indexOf(song.src);
                if (index !== -1) {
                    currentIndex = index;
                    loadSong(index);
                    player.play();
                    updatePlayerButtons();
                }
            });

            row.querySelector('.removeFav').addEventListener('click', () => {
                favorites = favorites.filter(f => f.src !== song.src);
                saveFavorites();
                renderFavorites(document.getElementById('favoritesSearch')?.value || '');
                updateFavoriteIcons();
            });

            list.appendChild(row);
        });
}


    function loadSong(index) {

    player.src = songs[index];

    if (currentCover) {
        currentCover.src = artists[index].src;
    }

    songTitle.textContent = "🎵 " + artists[index].dataset.title;

    artists.forEach((img) => {
        img.style.border = "none";
        img.style.transform = "scale(1)";
    });

    artists[index].style.border = "3px solid #1DB954";
    artists[index].style.transform = "scale(1.05)";

    if (playerFavoriteBtn) {
        const liked = favorites.some(f => f.src === songs[index]);
        playerFavoriteBtn.classList.toggle("fa-solid", liked);
        playerFavoriteBtn.classList.toggle("fa-regular", !liked);
        playerFavoriteBtn.style.color = liked ? "#1DB954" : "";
    }

    renderQueue();
}

function renderQueue() {
    if (!queuePanel || !queueCurrentSong || !queueList) return;

    queueCurrentSong.textContent = `▶ ${artists[currentIndex].dataset.title}`;
    queueList.innerHTML = "";

    let order = [];

    if (shuffleMode) {
        order = [...Array(songs.length).keys()]
            .filter(i => i !== currentIndex)
            .sort(() => Math.random() - 0.5);
    } else {
        for (let i = 1; i < songs.length; i++) {
            order.push((currentIndex + i) % songs.length);
        }
    }

    order.forEach(index => {
        const row = document.createElement("div");
        row.className = "queue-item";
        row.innerHTML = `<span>${artists[index].dataset.title}</span>`;

        row.addEventListener("click", () => {
            currentIndex = index;
            loadSong(currentIndex);
            player.play();
            updatePlayerButtons();
            queuePanel.classList.remove("open");
        });

        queueList.appendChild(row);
    });
}





function updatePlayerButtons() {
    if (player.paused) {
        playBtn.style.display = "inline-block";
        pauseBtn.style.display = "none";
    } else {
        playBtn.style.display = "none";
        pauseBtn.style.display = "inline-block";
    }
}

playBtn.addEventListener("click", () => {
    player.play();
    updatePlayerButtons();
});

document.addEventListener("keydown", (e) => {
    if ((e.key === "f" || e.key === "F") && currentIndex >= 0) {
        addToFavorites(currentIndex);
    }
});

playerFavoriteBtn?.addEventListener('click', () => {
    addToFavorites(currentIndex);
});

pauseBtn.addEventListener("click", () => {
    player.pause();
    updatePlayerButtons();
});

nextBtn.addEventListener('click', () => {
    if (shuffleMode) {
        let next;
        do {
            next = Math.floor(Math.random() * songs.length);
        } while (songs.length > 1 && next === currentIndex);
        currentIndex = next;
    } else {
        currentIndex = (currentIndex + 1) % songs.length;
    }

    loadSong(currentIndex);
    player.play();
    updatePlayerButtons();
});

prevBtn.addEventListener('click', () => {
    if (shuffleMode) {
        let prev;
        do {
            prev = Math.floor(Math.random() * songs.length);
        } while (songs.length > 1 && prev === currentIndex);
        currentIndex = prev;
    } else {
        currentIndex = (currentIndex - 1 + songs.length) % songs.length;
    }

    loadSong(currentIndex);
    player.play();
    updatePlayerButtons();
});
function formatTime(time){
    if(isNaN(time)) return "0:00";
    const min=Math.floor(time/60);
    const sec=Math.floor(Math.floor(time)%60).toString().padStart(2,'0');
    return `${min}:${sec}`;
}

player.addEventListener('loadedmetadata',()=>{
    if(totalTimeLabel) totalTimeLabel.textContent=formatTime(player.duration);
});

player.addEventListener("timeupdate", () => {
    if (player.duration) {
        progress.value =
            (player.currentTime / player.duration) * 100;
    }
    if(currentTimeLabel) currentTimeLabel.textContent=formatTime(player.currentTime);
    if(totalTimeLabel) totalTimeLabel.textContent=formatTime(player.duration);
});

progress.addEventListener("input", () => {

    player.currentTime =
        (progress.value / 100) * player.duration;

});

volume.addEventListener("input", () => {
    player.volume = volume.value;
    if(volumePercent) volumePercent.textContent = Math.round(player.volume*100)+"%";
    if(muteBtn){
        muteBtn.className = player.volume===0 ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
    }
});

muteBtn?.addEventListener('click',()=>{
    if(player.volume>0){
        player.dataset.lastVolume = player.volume;
        player.volume=0;
        volume.value=0;
    }else{
        const last = parseFloat(player.dataset.lastVolume||1);
        player.volume=last;
        volume.value=last;
    }
    volume.dispatchEvent(new Event('input'));
});

const savedTheme = localStorage.getItem('theme');
if(savedTheme==='light') document.body.classList.add('light-theme');

themeToggle?.addEventListener('click',()=>{
    document.body.classList.toggle('light-theme');
    localStorage.setItem('theme',document.body.classList.contains('light-theme')?'light':'dark');
});

document.addEventListener('keydown',(e)=>{
    if(['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) return;
    if(e.code==='Space'){
        e.preventDefault();
        player.paused?player.play():player.pause();
    }else if(e.key==='ArrowRight'){
        nextBtn.click();
    }else if(e.key==='ArrowLeft'){
        prevBtn.click();
    }else if(e.key.toLowerCase()==='m'){
        muteBtn?.click();
    }
});

player.addEventListener('ended', () => {
    if (repeatMode) {
        player.currentTime = 0;
        player.play();
        updatePlayerButtons();
        return;
    }

    if (shuffleMode) {
        let next;
        do {
            next = Math.floor(Math.random() * songs.length);
        } while (songs.length > 1 && next === currentIndex);
        currentIndex = next;
    } else {
        currentIndex = (currentIndex + 1) % songs.length;
    }

    loadSong(currentIndex);
    player.play();
    updatePlayerButtons();
});

player.addEventListener("play", () => {
    updatePlayerButtons();
    if (playingGif) playingGif.style.display = 'block';
    currentCover?.classList.add('playing');
});

player.addEventListener("pause", () => {
    updatePlayerButtons();
    if (playingGif) playingGif.style.display = 'none';
    currentCover?.classList.remove('playing');
});

const likedSongsBtn = document.getElementById('likedSongsBtn');
const favoritesSection = document.getElementById('favoritesSection');
const favoritesSearch = document.getElementById('favoritesSearch');
const homeContent = document.querySelectorAll(
    '.content > *:not(#favoritesSection):not(#downloadsSection):not(#playlistSection):not(#playlistSongsSection)'
);

likedSongsBtn?.addEventListener('click', () => {
    homeContent.forEach(section => section.style.display = '');
    homeContent.forEach(section => section.style.display = 'none');
    downloadsSection.style.display = 'none';
    favoritesSection.style.display = 'block';
    renderFavorites();
});

const backBtn = document.createElement('button');
backBtn.textContent = '← Back to Home';
backBtn.id = 'backHomeBtn';
favoritesSection?.prepend(backBtn);

backBtn.addEventListener('click', () => {
    favoritesSection.style.display = 'none';
    downloadsSection.style.display = 'none';
    homeContent.forEach(section => section.style.display = '');
});

favoritesSearch?.addEventListener('input', e => {
    renderFavorites(e.target.value);
});


renderFavorites();
updateFavoriteIcons();

updatePlayerButtons();

// ================= DOWNLOADS =================
const downloadsBtn = document.getElementById('downloadsBtn');
const downloadsSection = document.getElementById('downloadsSection');
const downloadsList = document.getElementById('downloadsList');
const backDownloadsBtn = document.getElementById('backDownloadsBtn');

function renderDownloads() {
    if (!downloadsList) return;

    downloadsList.innerHTML = '';

    artists.forEach((artist, index) => {
        const row = document.createElement('div');
        row.className = 'favorite-row';

        row.innerHTML = `
            <img src="${artist.src}" style="width:60px;height:60px;border-radius:12px;object-fit:cover;margin-right:15px;">
            <span style="flex:1;">${artist.dataset.title}</span>
            <button class="playDownload">▶</button>
        `;

        row.querySelector('.playDownload').addEventListener('click', (e) => {
            e.stopPropagation();
            currentIndex = index;
            loadSong(index);
            player.play();
            updatePlayerButtons();
        });

        row.addEventListener('click', () => {
            currentIndex = index;
            loadSong(index);
            player.play();
            updatePlayerButtons();
        });

        downloadsList.appendChild(row);
    });
}

if (downloadsBtn) {
    downloadsBtn.addEventListener('click', () => {
        favoritesSection.style.display = 'none';
        homeContent.forEach(section => section.style.display = 'none');
        downloadsSection.style.display = 'block';
        renderDownloads();
    });
}

backDownloadsBtn?.addEventListener('click', () => {
    downloadsSection.style.display = 'none';
    favoritesSection.style.display = 'none';
    homeContent.forEach(section => section.style.display = '');
});
// ================= PLAYLISTS =================
let playlists = JSON.parse(localStorage.getItem('playlists') || '[]');

function savePlaylists() {
    localStorage.setItem('playlists', JSON.stringify(playlists));
}

function renderPlaylists() {
    const playlistSection = document.getElementById('playlistSection');
    const playlistList = document.getElementById('playlistList');
    if (!playlistSection || !playlistList) return;
    playlistList.innerHTML = '';
    if (playlists.length === 0) {
        const empty = document.createElement('div');
        empty.textContent = "No playlists yet.";
        playlistList.appendChild(empty);
        return;
    }
    playlists.forEach((pl, idx) => {
        const row = document.createElement('div');
        row.className = 'playlist-row';
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.gap = '12px';
        row.style.marginBottom = '8px';
        row.innerHTML = `
            <span style="flex:1;font-weight:bold;">${pl.name}</span>
            <span>${pl.songs.length} song${pl.songs.length !== 1 ? 's' : ''}</span>
            <button class="openPlaylistBtn">Open</button>
            <button class="deletePlaylistBtn" style="color:red;">Delete</button>
        `;
        row.querySelector('.openPlaylistBtn').addEventListener('click', () => {
            openPlaylist(idx);
        });
        row.querySelector('.deletePlaylistBtn').addEventListener('click', () => {
            if (confirm(`Delete playlist "${pl.name}"?`)) {
                playlists.splice(idx, 1);
                savePlaylists();
                renderPlaylists();
            }
        });
        playlistList.appendChild(row);
    });
}

// Sidebar Playlists button logic
const playlistBtn = document.getElementById('playlistBtn');
const playlistSection = document.getElementById('playlistSection');
const backPlaylistBtn = document.getElementById('backPlaylistBtn');
const createPlaylistBtn = document.getElementById('createPlaylistBtn');
const playlistSongs = document.getElementById('playlistSongs');
const playlistSongsTitle = document.getElementById('playlistSongsTitle');
const playlistSongsSection = document.getElementById('playlistSongsSection');

if (playlistBtn) {
    playlistBtn.addEventListener('click', () => {
        favoritesSection && (favoritesSection.style.display = 'none');
        downloadsSection && (downloadsSection.style.display = 'none');
        homeContent.forEach(section => section.style.display = 'none');
        if (playlistSection) playlistSection.style.display = 'block';
        if (playlistSongsSection) playlistSongsSection.style.display = 'none';
        renderPlaylists();
    });
}

if (backPlaylistBtn) {
    backPlaylistBtn.addEventListener('click', () => {
        playlistSection && (playlistSection.style.display = 'none');
        playlistSongsSection && (playlistSongsSection.style.display = 'none');
        favoritesSection && (favoritesSection.style.display = 'none');
        downloadsSection && (downloadsSection.style.display = 'none');
        homeContent.forEach(section => section.style.display = '');
    });
}

if (createPlaylistBtn) {
    createPlaylistBtn.addEventListener('click', () => {
        let name = prompt("Enter playlist name:");
        if (!name) return;
        name = name.trim();
        if (!name) {
            alert("Playlist name cannot be empty.");
            return;
        }
        if (playlists.some(pl => pl.name.toLowerCase() === name.toLowerCase())) {
            alert("A playlist with this name already exists.");
            return;
        }
        playlists.push({ name, songs: [] });
        savePlaylists();
        renderPlaylists();
    });
}

function openPlaylist(idx) {
    if (!playlistSongs || !playlistSongsTitle || !playlistSongsSection) return;
    const pl = playlists[idx];
    playlistSection && (playlistSection.style.display = 'none');
    playlistSongsSection.style.display = 'block';
    playlistSongsTitle.textContent = pl.name;
    renderPlaylistSongs(idx);
}

function renderPlaylistSongs(idx) {
    if (!playlistSongs) return;
    playlistSongs.innerHTML = '';
    const pl = playlists[idx];
    if (!pl) return;
    if (pl.songs.length === 0) {
        const empty = document.createElement('div');
        empty.textContent = "No songs in this playlist.";
        playlistSongs.appendChild(empty);
    } else {
        pl.songs.forEach((songIdx, i) => {
            // Defensive: skip if out-of-bounds
            if (typeof songIdx !== 'number' || songIdx < 0 || songIdx >= artists.length) return;
            const artist = artists[songIdx];
            const row = document.createElement('div');
            row.className = 'playlist-song-row';
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.gap = '12px';
            row.style.marginBottom = '8px';
            row.innerHTML = `
                <img src="${artist.src}" style="width:48px;height:48px;border-radius:8px;object-fit:cover;">
                <span style="flex:1;">${artist.dataset.title}</span>
                <button class="playSongBtn">Play</button>
            `;
            row.querySelector('.playSongBtn').addEventListener('click', () => {
                currentIndex = songIdx;
                loadSong(currentIndex);
                player.play();
                updatePlayerButtons();
            });
            playlistSongs.appendChild(row);
        });
    }
    // Add "Add Current Song" button
    let addBtn = document.createElement('button');
    addBtn.textContent = 'Add Current Song';
    addBtn.style.marginTop = '14px';
    addBtn.addEventListener('click', () => {
        if (typeof currentIndex !== 'number' || currentIndex < 0 || currentIndex >= artists.length) {
            alert("No song is currently selected.");
            return;
        }
        if (pl.songs.includes(currentIndex)) {
            alert("Current song is already in this playlist.");
            return;
        }
        pl.songs.push(currentIndex);
        savePlaylists();
        renderPlaylistSongs(idx);
    });
    playlistSongs.appendChild(addBtn);
    // Add back button
    let backBtn = document.createElement('button');
    backBtn.textContent = '← Back to Playlists';
    backBtn.style.margin = '14px 0 0 10px';
    backBtn.addEventListener('click', () => {
        playlistSongsSection.style.display = 'none';
        playlistSection && (playlistSection.style.display = 'block');
        renderPlaylists();
    });
    playlistSongs.appendChild(backBtn);
}