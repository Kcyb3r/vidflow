const videos = [
    {
        id: 1,
        title: 'Sardar ka grandson',
        thumbnail: 'sardarkagrandson_thumnail.jpeg',
        videoUrl: 'Sardar.Ka.Grandson.2021.720p.Hindi.AAC.5.1.x264.mkv',
        views: '1.2M views',
        duration: '2:19:36'
    },
    // Add more videos here
];

const featuredMovies = videos.map(video => ({
    title: video.title,
    image: video.thumbnail,
    rating: '4.5',
    year: '2024'
}));

// DOM Elements
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Element with id "${id}" not found`);
        return null;
    }
    return element;
}

let mainPlayer, videoTitle, views, playlistItems, videoThumbnail,
    thumbnailImg, playButton, searchInput, homeSection, playerSection,
    homeLink, playerLink, startWatchingBtn, sliderTrack, prevBtn, nextBtn;

function initializeElements() {
    mainPlayer = getElement('mainPlayer');
    videoTitle = getElement('videoTitle');
    views = getElement('views');
    playlistItems = getElement('playlistItems');
    videoThumbnail = getElement('videoThumbnail');
    homeSection = getElement('homeSection');
    playerSection = getElement('playerSection');
    homeLink = getElement('homeLink');
    playerLink = getElement('playerLink');
    startWatchingBtn = getElement('startWatching');
    sliderTrack = getElement('sliderTrack');

    if (videoThumbnail) {
        thumbnailImg = videoThumbnail.querySelector('img');
        playButton = videoThumbnail.querySelector('.play-button');
    }

    searchInput = document.querySelector('.search-bar input');
    prevBtn = document.querySelector('.prev-btn');
    nextBtn = document.querySelector('.next-btn');

    return !!(mainPlayer && videoTitle && views && playlistItems && videoThumbnail &&
        thumbnailImg && playButton && searchInput && homeSection && playerSection &&
        homeLink && playerLink && startWatchingBtn && sliderTrack && prevBtn && nextBtn);
}

// Slider variables
let autoSlideInterval;
let isDragging = false;
let startX;
let scrollLeft;

// Video Functions
function loadPlaylist() {
    playlistItems.innerHTML = '';
    videos.forEach(video => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        item.innerHTML = `
            <img class="playlist-thumb" src="${video.thumbnail}" alt="${video.title}">
            <div class="playlist-info">
                <h4>${video.title}</h4>
                <span>${video.views} • ${video.duration}</span>
            </div>
        `;
        item.addEventListener('click', () => playVideo(video));
        playlistItems.appendChild(item);
    });
}

function playVideo(video) {
    if (!video || !video.videoUrl) return;
    
    try {
        mainPlayer.src = video.videoUrl;
        mainPlayer.onerror = () => {
            console.error('Error loading video:', video.videoUrl);
            videoThumbnail.classList.add('visible');
        };
        mainPlayer.onloadeddata = () => {
            console.log('Video loaded successfully:', video.title);
        };
        videoTitle.textContent = video.title;
        views.textContent = video.views;
        thumbnailImg.src = video.thumbnail;
        videoThumbnail.classList.add('visible');
    } catch (error) {
        console.error('Error playing video:', error);
    }
}

// Navigation Functions
function showHome() {
    homeSection.style.display = 'block';
    playerSection.style.display = 'none';
    homeLink.classList.add('active');
    playerLink.classList.remove('active');
}

function showPlayer() {
    homeSection.style.display = 'none';
    playerSection.style.display = 'block';
    homeLink.classList.remove('active');
    playerLink.classList.add('active');
}

// Slider Functions
function loadSlider() {
    sliderTrack.innerHTML = '';
    featuredMovies.forEach(movie => {
        const slide = document.createElement('div');
        slide.className = 'slider-item';
        slide.innerHTML = `
            <img src="${movie.image}" alt="${movie.title}">
            <div class="movie-info">
                <h4>${movie.title}</h4>
                <div class="movie-meta">
                    <span><i class="fas fa-star"></i> ${movie.rating}</span>
                    <span>${movie.year}</span>
                </div>
            </div>
        `;
        slide.addEventListener('click', () => {
            const video = videos.find(v => v.title === movie.title);
            if (video) playVideo(video);
        });
        sliderTrack.appendChild(slide);
    });
    
    // Clone first few items for infinite scroll
    const clonedItems = Array.from(sliderTrack.children)
        .slice(0, 3)
        .map(item => item.cloneNode(true));
    clonedItems.forEach(item => sliderTrack.appendChild(item));
}

function slideMovies(direction) {
    const slideWidth = 220;
    const currentScroll = sliderTrack.scrollLeft;
    const newScroll = direction === 'next' 
        ? currentScroll + slideWidth 
        : currentScroll - slideWidth;
    
    sliderTrack.scrollTo({
        left: newScroll,
        behavior: 'smooth'
    });
    
    const maxScroll = sliderTrack.scrollWidth - sliderTrack.clientWidth;
    if (newScroll >= maxScroll) {
        setTimeout(() => {
            sliderTrack.scrollTo({ left: 0, behavior: 'auto' });
        }, 500);
    } else if (newScroll <= 0) {
        setTimeout(() => {
            sliderTrack.scrollTo({ left: maxScroll - slideWidth, behavior: 'auto' });
        }, 500);
    }
}

// Auto Slide Functions
function startAutoSlide() {
    stopAutoSlide();
    autoSlideInterval = setInterval(() => slideMovies('next'), 3000);
}

function stopAutoSlide() {
    if (autoSlideInterval) clearInterval(autoSlideInterval);
}

// Drag Functions
function startDragging(e) {
    isDragging = true;
    startX = e.pageX - sliderTrack.offsetLeft;
    scrollLeft = sliderTrack.scrollLeft;
    stopAutoSlide();
}

function stopDragging() {
    isDragging = false;
    startAutoSlide();
}

function drag(e) {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - sliderTrack.offsetLeft;
    const walk = (x - startX) * 2;
    sliderTrack.scrollLeft = scrollLeft - walk;
}

// Event Listeners
mainPlayer.addEventListener('pause', () => videoThumbnail.classList.add('visible'));
mainPlayer.addEventListener('play', () => videoThumbnail.classList.remove('visible'));
mainPlayer.addEventListener('ended', () => videoThumbnail.classList.add('visible'));
mainPlayer.addEventListener('error', () => videoThumbnail.classList.add('visible'));
playButton.addEventListener('click', () => mainPlayer.play());

homeLink.addEventListener('click', (e) => {
    e.preventDefault();
    showHome();
});

playerLink.addEventListener('click', (e) => {
    e.preventDefault();
    showPlayer();
});

startWatchingBtn.addEventListener('click', showPlayer);

prevBtn.addEventListener('click', () => {
    slideMovies('prev');
    stopAutoSlide();
    startAutoSlide();
});

nextBtn.addEventListener('click', () => {
    slideMovies('next');
    stopAutoSlide();
    startAutoSlide();
});

// Slider drag events
sliderTrack.addEventListener('mousedown', startDragging);
sliderTrack.addEventListener('mouseleave', stopDragging);
sliderTrack.addEventListener('mouseup', stopDragging);
sliderTrack.addEventListener('mousemove', drag);
sliderTrack.addEventListener('mouseenter', stopAutoSlide);
sliderTrack.addEventListener('mouseleave', startAutoSlide);

// Search functionality
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredVideos = videos.filter(video => 
        video.title.toLowerCase().includes(searchTerm)
    );
    
    playlistItems.innerHTML = '';
    filteredVideos.forEach(video => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        item.innerHTML = `
            <img class="playlist-thumb" src="${video.thumbnail}" alt="${video.title}">
            <div class="playlist-info">
                <h4>${video.title}</h4>
                <span>${video.views} • ${video.duration}</span>
            </div>
        `;
        item.addEventListener('click', () => playVideo(video));
        playlistItems.appendChild(item);
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (!initializeElements()) {
        console.error('Failed to initialize some elements');
        return;
    }

    loadPlaylist();
    loadSlider();
    startAutoSlide();
    showHome();
    if (videos.length > 0) playVideo(videos[0]);
}); 
