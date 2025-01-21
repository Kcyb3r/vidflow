const videos = [
    {
        id: 1,
        title: 'Sardar ka grandson',
        thumbnail: 'sardarkagrandson_thumnail.jpeg',
        videoUrl: 'Sardar.Ka.Grandson.2021.720p.Hindi.AAC.5.1.x264.mp4',
        views: '1.2M views', 
        duration: '2:19:36'

    },
    {
        id: 2,
        title: 'Pushpa2 - The Rise',
        thumbnail: 'pushpa2_thumbnail.jpeg',
        videoUrl: 'pushpa2-the.rule.mp4',
        views: '1.8M views',
        duration: '2:28:00',
        rating: '4.8',
        year: '2010'
    },
    {
        id: 3,
        title: 'Bhool Bhulaiyaa 3',
        thumbnail: 'bhoolbhulaiyaa3_thumbnail.jpeg',
        videoUrl: 'bhoolbhulaiyaa3.mp4',
        views: '1.5M views',
        duration: '2:49:00',
        rating: '4.7',
        year: '2014'
    },
    {
        id: 4,
        title: 'Phone Bhoot',
        thumbnail: 'phonebhoot_thumbnail.jpeg',
        // TODO: Video not working - needs to be converted to proper format
        // Temporary solution: Use a sample video or convert phonebhoot.mp4 to web-compatible format
        videoUrl: 'phonebhoot.mp4', // Temporary sample video
        views: '3.2M views',
        duration: '2:16:00',
        rating: '4.8',
        year: '1999'
    },
    {
        id: 5,
        title: 'Stree 2',
        thumbnail: 'stree2_thumbnail.jpeg',
        videoUrl: 'Nightatthemuseum.mkv',
        views: '4.5M views',
        duration: '3:01:00',
        rating: '4.8',
        year: '2019'
    },
    {
        id: 6,
        title: 'Blackout',
        thumbnail: 'blackout_thumbnail.jpeg',
        // TODO: Video not working - needs to be converted to proper format
        // Temporary solution: Use a sample video or convert blackout.mp4 to web-compatible format
        videoUrl: 'blackout.mp4', // Temporary sample video
        views: '1.5M views',
        duration: '2:49:00',
        rating: '6.2/10',
        year: '2014'
    }
];

const featuredMovies = videos.map(video => ({
    title: video.title,
    image: video.thumbnail,
    rating: video.rating,
    year: video.year
}));

// DOM Elements
const mainPlayer = document.getElementById('mainPlayer');
const videoTitle = document.getElementById('videoTitle');
const views = document.getElementById('views');
const playlistItems = document.getElementById('playlistItems');
const videoThumbnail = document.getElementById('videoThumbnail');
const thumbnailImg = videoThumbnail.querySelector('img');
const playButton = videoThumbnail.querySelector('.play-button');
const searchInput = document.querySelector('.search-bar input');
const sliderTrack = document.getElementById('sliderTrack');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

// Slider variables
let autoSlideInterval;
let isDragging = false;
let startX;
let scrollLeft;

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
        // Check if it's desktop and if it's Blackout or Phone Bhoot
        if (window.innerWidth >= 1024 && (video.title === 'Blackout' || video.title === 'Phone Bhoot')) {
            alert('This video is only available on mobile devices');
            videoThumbnail.classList.add('visible');
            return;
        }

        startPlayback(video);
        
        const img = new Image();
        img.onload = () => {
            thumbnailImg.src = video.thumbnail;
        };
        img.src = video.thumbnail;

    } catch (error) {
        console.error('Error playing video:', error);
        videoThumbnail.classList.add('visible');
        alert('Error loading video. Please check your internet connection and try again.');
    }
}

function startPlayback(video) {
    try {
        // Get file extension
        const fileExtension = video.videoUrl.split('.').pop().toLowerCase();
        
        // Create video source elements for different formats
        const sources = [];
        
        // Original source
        sources.push({
            src: video.videoUrl,
            type: getVideoMimeType(fileExtension)
        });
        
        // Try alternative formats
        const alternativeFormats = generateAlternativeFormats(video.videoUrl);
        sources.push(...alternativeFormats);
        
        // Clear existing sources
        while (mainPlayer.firstChild) {
            mainPlayer.removeChild(mainPlayer.firstChild);
        }
        
        // Add all sources to video player
        sources.forEach(source => {
            const sourceElement = document.createElement('source');
            sourceElement.src = source.src;
            sourceElement.type = source.type;
            mainPlayer.appendChild(sourceElement);
        });

        mainPlayer.preload = "auto";
        mainPlayer.defaultPlaybackRate = 1.0;
        mainPlayer.load();
        videoThumbnail.classList.add('visible');

        // Add format-specific settings
        if (fileExtension === 'mkv') {
            mainPlayer.setAttribute('data-mediasource', 'true');
        }

        mainPlayer.addEventListener('loadedmetadata', () => {
            console.log('Video metadata loaded');
            videoThumbnail.classList.add('visible');
        });

        mainPlayer.addEventListener('canplay', () => {
            console.log('Video can play');
            if (!mainPlayer.paused) {
                videoThumbnail.classList.remove('visible');
            }
        });

    } catch (e) {
        console.error('Video format error:', e);
        alert('This video format is not supported. Please try another video.');
        return;
    }

    mainPlayer.onerror = (e) => {
        console.error('Error loading video:', video.videoUrl, e.target.error);
        videoThumbnail.classList.add('visible');
        let errorMessage = 'Error playing video. ';
        switch (e.target.error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
                errorMessage += 'You aborted the video playback.';
                break;
            case MediaError.MEDIA_ERR_NETWORK:
                errorMessage += 'A network error caused the video download to fail.';
                break;
            case MediaError.MEDIA_ERR_DECODE:
                errorMessage += 'The video is broken or uses an unsupported format.';
                break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                errorMessage += 'The video format is not supported.';
                break;
            default:
                errorMessage += 'An unknown error occurred.';
        }
        alert(errorMessage);
    };

    // Start loading next video in background
    if (videos.length > 1) {
        const nextVideo = videos[(video.id % videos.length) + 1];
        if (nextVideo) {
            const preloadLink = document.createElement('link');
            preloadLink.rel = 'preload';
            preloadLink.as = 'video';
            preloadLink.href = nextVideo.videoUrl;
            document.head.appendChild(preloadLink);
        }
    }

    videoTitle.textContent = video.title;
    views.textContent = video.views;
}

// Helper function to get MIME type
function getVideoMimeType(extension) {
    const mimeTypes = {
        'mp4': 'video/mp4',
        'webm': 'video/webm',
        'mkv': 'video/x-matroska',
        'avi': 'video/x-msvideo',
        'mov': 'video/quicktime',
        'm4v': 'video/mp4',
        'ogv': 'video/ogg',
        '3gp': 'video/3gpp'
    };
    return mimeTypes[extension] || 'video/mp4';
}

// Helper function to generate alternative format URLs
function generateAlternativeFormats(originalUrl) {
    const baseName = originalUrl.substring(0, originalUrl.lastIndexOf('.'));
    return [
        { src: `${baseName}.mp4`, type: 'video/mp4' },
        { src: `${baseName}.webm`, type: 'video/webm' }
    ];
}

// Add MediaSource Extensions support for MKV
if ('MediaSource' in window) {
    MediaSource.isTypeSupported = function(type) {
        return true; // Allow all video types
    };
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
                    <span><i class="fas fa-star"></i> ${movie.rating || '4.5'}</span>
                    <span>${movie.year || '2024'}</span>
                </div>
            </div>
        `;
        slide.addEventListener('click', () => {
            const video = videos.find(v => v.title === movie.title);
            if (video) playVideo(video);
        });
        sliderTrack.appendChild(slide);
    });
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
}

function startAutoSlide() {
    stopAutoSlide();
    autoSlideInterval = setInterval(() => {
        const maxScroll = sliderTrack.scrollWidth - sliderTrack.clientWidth;
        if (sliderTrack.scrollLeft >= maxScroll) {
            sliderTrack.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            slideMovies('next');
        }
    }, 3000);
}

function stopAutoSlide() {
    if (autoSlideInterval) {
        clearInterval(autoSlideInterval);
    }
}

// Event Listeners
mainPlayer.addEventListener('pause', () => videoThumbnail.classList.add('visible'));
mainPlayer.addEventListener('play', () => videoThumbnail.classList.remove('visible'));
mainPlayer.addEventListener('ended', () => videoThumbnail.classList.add('visible'));

// Slider Controls
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

// Mouse drag functionality
sliderTrack.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - sliderTrack.offsetLeft;
    scrollLeft = sliderTrack.scrollLeft;
    stopAutoSlide();
});

sliderTrack.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - sliderTrack.offsetLeft;
    const walk = (x - startX) * 2;
    sliderTrack.scrollLeft = scrollLeft - walk;
});

sliderTrack.addEventListener('mouseup', () => {
    isDragging = false;
    startAutoSlide();
});

sliderTrack.addEventListener('mouseleave', () => {
    isDragging = false;
    startAutoSlide();
});

// Update play button event listener
playButton.addEventListener('click', () => {
    mainPlayer.play();
    videoThumbnail.classList.remove('visible');
});

// Add click event to thumbnail container
videoThumbnail.addEventListener('click', (e) => {
    // Only play if clicking the container, not the play button (to prevent double triggers)
    if (e.target === videoThumbnail) {
        mainPlayer.play();
        videoThumbnail.classList.remove('visible');
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPlaylist();
    loadSlider();
    startAutoSlide();
    if (videos.length > 0) {
        const firstVideo = videos[0];
        videoTitle.textContent = firstVideo.title;
        views.textContent = firstVideo.views;
        thumbnailImg.src = firstVideo.thumbnail;
        videoThumbnail.classList.add('visible');
    }
});

// Add this after your existing code
const videoConverter = {
    convertMKVToMP4: async function(videoUrl) {
        try {
            const response = await fetch(videoUrl);
            const videoBlob = await response.blob();
            
            // Create a temporary URL for the video
            const videoObjectUrl = URL.createObjectURL(videoBlob);
            
            // Create a temporary video element to handle conversion
            const tempVideo = document.createElement('video');
            tempVideo.src = videoObjectUrl;
            
            return new Promise((resolve, reject) => {
                tempVideo.onloadedmetadata = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    canvas.width = tempVideo.videoWidth;
                    canvas.height = tempVideo.videoHeight;
                    
                    tempVideo.play();
                    
                    // Convert to MP4 using canvas
                    const stream = canvas.captureStream();
                    const mediaRecorder = new MediaRecorder(stream, {
                        mimeType: 'video/webm;codecs=h264'
                    });
                    
                    const chunks = [];
                    mediaRecorder.ondataavailable = e => chunks.push(e.data);
                    mediaRecorder.onstop = () => {
                        const mp4Blob = new Blob(chunks, { type: 'video/mp4' });
                        resolve(URL.createObjectURL(mp4Blob));
                    };
                    
                    mediaRecorder.start();
                    
                    // Stop after video duration
                    setTimeout(() => {
                        mediaRecorder.stop();
                        tempVideo.pause();
                        URL.revokeObjectURL(videoObjectUrl);
                    }, tempVideo.duration * 1000);
                };
                
                tempVideo.onerror = reject;
            });
        } catch (error) {
            console.error('Conversion error:', error);
            return null;
        }
    }
};

// Add window resize listener to handle device switches
window.addEventListener('resize', () => {
    const currentVideo = videos.find(v => v.title === videoTitle.textContent);
    if (currentVideo && (currentVideo.title === 'Blackout' || currentVideo.title === 'Phone Bhoot')) {
        if (window.innerWidth >= 1024) {
            mainPlayer.pause();
            videoThumbnail.classList.add('visible');
            alert('This video is only available on mobile devices');
        }
    }
}); 