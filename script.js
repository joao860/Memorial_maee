document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const initialScreen = document.getElementById('initialScreen');
    const mainContent = document.getElementById('mainContent');
    const startButton = document.getElementById('startButton');
    const spaceHearts = document.getElementById('spaceHearts');
    const fallingHearts = document.getElementById('fallingHearts');
    const carousel = document.getElementById('carousel');
    const carouselIndicators = document.getElementById('carouselIndicators');
    const quoteElement = document.getElementById('quote');
    const spotifyPlayer = document.getElementById('spotifyPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const progressBar = document.getElementById('progress');
    const currentTimeElement = document.getElementById('currentTime');
    const totalTimeElement = document.getElementById('totalTime');
    const audio = document.getElementById('backgroundMusic');

    let currentSlide = 0;
    let isPlaying = false;
    let slideInterval;
    let fallingTimeout;

    // Create space-floating hearts for initial screen
    function createSpaceHearts() {
        for (let i = 0; i < 40; i++) {
            const heart = document.createElement('i');
            heart.classList.add('fas', 'fa-heart', 'space-heart');
            
            // Random size
            const size = Math.random() * 25 + 10;
            heart.style.fontSize = `${size}px`;
            
            // Random position
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            heart.style.left = `${x}%`;
            heart.style.top = `${y}%`;
            
            // Random depth (z-index)
            const zIndex = Math.floor(Math.random() * 10);
            heart.style.zIndex = zIndex;
            
            // Random delay and duration - REDUCED to make hearts appear faster
            const delay = Math.random() * 8; // Reduced from 20
            const duration = Math.random() * 10 + 10; // Reduced from 15 + 15
            heart.style.animationDelay = `${delay}s`;
            heart.style.animationDuration = `${duration}s`;
            
            spaceHearts.appendChild(heart);
        }
    }

    // Create falling hearts like leaves - Improved
    function createFallingHearts() {
        fallingHearts.style.display = 'block';
        
        for (let i = 0; i < 40; i++) { // Increased from 30 to 40 for more hearts
            const heart = document.createElement('i');
            heart.classList.add('fas', 'fa-heart', 'falling-heart');
            
            // Random size with more variation
            const size = Math.random() * 20 + 8;
            heart.style.fontSize = `${size}px`;
            
            // Random position with better distribution
            const x = Math.random() * 100;
            heart.style.left = `${x}%`;
            
            // Random starting position for more natural look
            const startY = Math.random() * -30;
            heart.style.top = `${startY}px`;
            
            // Random delay with better distribution
            const delay = Math.random() * 8;
            heart.style.animationDelay = `${delay}s`;
            
            // Random duration with more variation
            const duration = Math.random() * 6 + 7;
            heart.style.animationDuration = `${duration}s`;
            
            // Random rotation for more natural movement
            const rotation = Math.random() * 360;
            heart.style.transform = `rotate(${rotation}deg)`;
            
            fallingHearts.appendChild(heart);
        }
    }

    // Initialize carousel indicators
    function initCarouselIndicators() {
        const slides = document.querySelectorAll('.carousel-slide');
        
        // Create indicators based on number of slides
        slides.forEach((slide, index) => {
            const indicator = document.createElement('div');
            indicator.classList.add('indicator');
            if (index === 0) {
                indicator.classList.add('active');
            }
            
            indicator.addEventListener('click', () => {
                goToSlide(index);
            });
            
            carouselIndicators.appendChild(indicator);
        });
        
        // Preload all images to get dimensions
        slides.forEach((slide) => {
            const imgElement = slide.querySelector('img');
            if (imgElement) {
                const preloadImg = new Image();
                preloadImg.src = imgElement.src;
                preloadImg.crossOrigin = "anonymous"; // Adicionado para evitar problemas de CORS
                preloadImg.onload = function() {
                    // Store original dimensions as data attributes
                    imgElement.dataset.originalWidth = this.width;
                    imgElement.dataset.originalHeight = this.height;
                    
                    // If this is the first slide, adjust carousel height
                    if (slide.classList.contains('active')) {
                        adjustCarouselHeight(imgElement);
                    }
                };
            }
        });
    }

    // Adjust carousel height based on current image
    function adjustCarouselHeight(imgElement) {
        const carouselWidth = carousel.clientWidth;
        const imgRatio = imgElement.dataset.originalHeight / imgElement.dataset.originalWidth;
        
        // Calculate appropriate height while maintaining aspect ratio
        let newHeight = carouselWidth * imgRatio;
        
        // Set min and max height constraints
        newHeight = Math.max(newHeight, 200); // Minimum height
        newHeight = Math.min(newHeight, 500); // Maximum height
        
        carousel.style.height = `${newHeight}px`;
    }

    // Go to specific slide
    function goToSlide(index) {
        // Clear any existing interval
        clearInterval(slideInterval);
        
        // Hide current slide and quote
        const slides = document.querySelectorAll('.carousel-slide');
        const indicators = document.querySelectorAll('.indicator');
        
        slides[currentSlide].classList.remove('active');
        indicators[currentSlide].classList.remove('active');
        quoteElement.classList.remove('active');
        
        // Update current slide index
        currentSlide = index;
        
        // Show new slide and quote
        setTimeout(() => {
            slides[currentSlide].classList.add('active');
            indicators[currentSlide].classList.add('active');
            
            // Get quote from data attribute of the current image
            const currentImg = slides[currentSlide].querySelector('img');
            if (currentImg && currentImg.dataset.quote) {
                quoteElement.textContent = currentImg.dataset.quote;
            }
            quoteElement.classList.add('active');
            
            // Adjust carousel height for the new image
            if (currentImg && currentImg.dataset.originalWidth) {
                adjustCarouselHeight(currentImg);
            }
            
            // Restart automatic slideshow
            startSlideshow();
        }, 500);
    }

    // Next slide
    function nextSlide() {
        const slides = document.querySelectorAll('.carousel-slide');
        goToSlide((currentSlide + 1) % slides.length);
    }

    // Start automatic slideshow
    function startSlideshow() {
        // Clear any existing interval
        clearInterval(slideInterval);
        
        // Set new interval
        slideInterval = setInterval(() => {
            nextSlide();
        }, 7000); // Change slide every 7 seconds
    }

    // Format time (seconds to MM:SS)
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    // Update progress bar
    function updateProgress() {
        if (audio.duration) {
            const progressPercent = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = `${progressPercent}%`;
            currentTimeElement.textContent = formatTime(audio.currentTime);
            
            // Format remaining time with a minus sign
            const remainingTime = audio.duration - audio.currentTime;
            totalTimeElement.textContent = `-${formatTime(remainingTime)}`;
        }
    }

    // Set progress bar on click
    function setProgress(e) {
        const progressContainer = document.querySelector('.progress-bar');
        const width = progressContainer.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        
        audio.currentTime = (clickX / width) * duration;
    }

    // Toggle play/pause
    function togglePlay() {
        if (isPlaying) {
            audio.pause();
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        } else {
            audio.play();
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        }
        
        isPlaying = !isPlaying;
    }

    // Start the experience
    function startExperience() {
        // Start playing music immediately when button is clicked
        audio.play();
        isPlaying = true;
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        
        initialScreen.style.opacity = '0';
        
        // Iniciar diretamente os corações caindo (sem a chuva inicial)
        createFallingHearts();
        
        setTimeout(() => {
            initialScreen.style.display = 'none';
            mainContent.style.visibility = 'visible';
            mainContent.style.opacity = '1';
            
            // Start slideshow
            startSlideshow();
            
            // Show Spotify player after a delay
            setTimeout(() => {
                spotifyPlayer.classList.add('active');
            }, 2000);
        }, 1500);
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        const currentImg = document.querySelector('.carousel-slide.active img');
        if (currentImg && currentImg.dataset.originalWidth) {
            adjustCarouselHeight(currentImg);
        }
    });

    // Event Listeners
    startButton.addEventListener('click', startExperience);
    playPauseBtn.addEventListener('click', togglePlay);
    document.querySelector('.progress-bar').addEventListener('click', setProgress);
    
    // Audio events
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', () => {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        isPlaying = false;
        progressBar.style.width = '0%';
        audio.currentTime = 0;
    });
    
    // Load audio metadata
    audio.addEventListener('loadedmetadata', () => {
        const remainingTime = audio.duration;
        totalTimeElement.textContent = `-${formatTime(remainingTime)}`;
    });

    // Initialize
    createSpaceHearts();
    initCarouselIndicators();
});