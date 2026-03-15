// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // ----- Elements -----
    const audio = document.getElementById('audio');
    const playPauseBtn = document.getElementById('play-pause');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    const progress = document.getElementById('progress');
    const currentTimeSpan = document.getElementById('current-time');
    const durationSpan = document.getElementById('duration');
    const volumeSlider = document.getElementById('volume');
    const autoplayCheckbox = document.getElementById('autoplay');
    const songTitle = document.getElementById('song-title');
    const songArtist = document.getElementById('song-artist');
    const coverImg = document.getElementById('cover-img');
    const playlistEl = document.getElementById('playlist-list');

    // ----- Sample Track Data (replace with your own files) -----
    const tracks = [
        {
            title: "Sunset Drive",
            artist: "Dreamer",
            src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            cover: "https://via.placeholder.com/300/1e1e2f/ffffff?text=Sunset+Drive"
        },
        {
            title: "Electric Feel",
            artist: "Neon",
            src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
            cover: "https://via.placeholder.com/300/2a2a40/ffffff?text=Electric+Feel"
        },
        {
            title: "Midnight Rain",
            artist: "Luna",
            src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
            cover: "https://via.placeholder.com/300/3a3a50/ffffff?text=Midnight+Rain"
        }
    ];

    let currentTrackIndex = 0;
    let isPlaying = false;

    // ----- Helper: Format time (seconds to mm:ss) -----
    function formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // ----- Load track into audio element and update UI -----
    function loadTrack(index) {
        const track = tracks[index];
        audio.src = track.src;
        songTitle.textContent = track.title;
        songArtist.textContent = track.artist;
        coverImg.src = track.cover;
        // Reset progress bar
        progress.value = 0;
        currentTimeSpan.textContent = "0:00";
        // Update active class in playlist
        document.querySelectorAll('#playlist-list li').forEach((li, i) => {
            if (i === index) {
                li.classList.add('active');
            } else {
                li.classList.remove('active');
            }
        });
        // If it was playing, continue playing after load
        if (isPlaying) {
            audio.play().catch(e => console.log('Playback failed:', e));
        }
    }

    // ----- Play/Pause toggle -----
    function togglePlayPause() {
        if (audio.src === '') {
            loadTrack(0); // Load first track if none loaded
        }
        if (audio.paused) {
            audio.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            isPlaying = true;
        } else {
            audio.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            isPlaying = false;
        }
    }

    // ----- Play next track -----
    function playNext() {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        loadTrack(currentTrackIndex);
        if (isPlaying) audio.play();
    }

    // ----- Play previous track -----
    function playPrev() {
        currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        loadTrack(currentTrackIndex);
        if (isPlaying) audio.play();
    }

    // ----- Update progress bar and times as audio plays -----
    function updateProgress() {
        if (audio.duration) {
            const percent = (audio.currentTime / audio.duration) * 100;
            progress.value = percent;
            currentTimeSpan.textContent = formatTime(audio.currentTime);
            durationSpan.textContent = formatTime(audio.duration);
        }
    }

    // ----- Seek when user changes progress bar -----
    function seek() {
        if (audio.duration) {
            const seekTime = (progress.value / 100) * audio.duration;
            audio.currentTime = seekTime;
        }
    }

    // ----- Set volume -----
    function setVolume() {
        audio.volume = volumeSlider.value;
    }

    // ----- Handle track end (for autoplay) -----
    function onTrackEnd() {
        if (autoplayCheckbox.checked) {
            playNext();
        } else {
            // Reset play button
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            isPlaying = false;
        }
    }

    // ----- Build playlist UI -----
    function buildPlaylist() {
        playlistEl.innerHTML = '';
        tracks.forEach((track, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${track.title}</span> <small>${track.artist}</small>`;
            li.addEventListener('click', () => {
                if (currentTrackIndex !== index) {
                    currentTrackIndex = index;
                    loadTrack(currentTrackIndex);
                    if (isPlaying) audio.play();
                } else {
                    // Same track: just play/pause?
                    togglePlayPause();
                }
            });
            playlistEl.appendChild(li);
        });
        // Set first track as active (if none loaded yet)
        if (tracks.length > 0 && !audio.src) {
            loadTrack(0);
        }
    }

    // ----- Event Listeners -----
    playPauseBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', playPrev);
    nextBtn.addEventListener('click', playNext);

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', () => {
        durationSpan.textContent = formatTime(audio.duration);
    });
    audio.addEventListener('ended', onTrackEnd);

    progress.addEventListener('input', seek); // real‑time seeking while dragging
    volumeSlider.addEventListener('input', setVolume);

    // Initialize volume from slider
    audio.volume = volumeSlider.value;

    // Build playlist on page load
    buildPlaylist();

    // Optional: Keyboard shortcuts (space for play/pause)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            togglePlayPause();
        }
    });
});