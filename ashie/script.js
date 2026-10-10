
/* -------------------------------------------------------------------------
   1. DATA STORES & STATE
------------------------------------------------------------------------- */
const REASONS_LIST = [
    "1. I love the way you make ordinary moments feel special.",
    "2. I love your smile and the happiness it brings me.",
    "3. I love hearing your voice, even when we have nothing important to say.",
    "4. I love the little things you do that make you uniquely you.",
    "5. I love how we can laugh together over our own little jokes.",
    "6. I love the comfort I feel when we talk.",
    "7. I love the memories we have created together.",
    "8. I love the way you make our story meaningful to me.",
    "9. I love that I can keep discovering new things to appreciate about you.",
    "10. I love you because you are my baby, and choosing you is something I cherish."
];

let currentReasonIndex = 0;

const MEMORY_PHOTOS = [
    { url: '1.jpg', caption: 'Our First Date ' },
    { url: '2.jpg', caption: 'Sweet Laughs ' },
    { url: '3.jpg', caption: 'Late Night Talks ' },
    { url: '4.jpg', caption: 'Sunset Moments ' },
    { url: '5.jpg', caption: 'Our Favorites ' },
    { url: '6.jpg', caption: 'Stargazing Night ' },
    { url: '7.jpg', caption: 'Unforgettable Days ' },
    { url: '8.jpg', caption: 'Warm Hugs ' },
    { url: '9.jpg', caption: 'Road Trip Adventures ' },
    { url: '10.jpg', caption: 'My Forever Baby ' }
];

/* -------------------------------------------------------------------------
   2. DOM READY INITIALIZATION
------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();
    setupStoryVideo();

    // A stale gift-card hash can make the browser reopen halfway down the page.
    if (window.location.hash.startsWith('#card-')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    window.scrollTo(0, 0);

    initGalaxyCanvas();
    renderMemoryGallery();
    updateReasonDisplay();
    setupEventListeners();
    initFireworksCanvas();
});

/* -------------------------------------------------------------------------
   3. EVENT LISTENERS & NAVIGATION
------------------------------------------------------------------------- */
function setupEventListeners() {
    const musicBtn = document.getElementById('music-toggle-btn');
    const musicModal = document.getElementById('music-modal');
    const closeMusicModal = document.getElementById('close-music-modal');
    const heroListenBtn = document.getElementById('hero-listen-btn');

    const toggleModal = () => {
        if (musicModal) {
            musicModal.classList.toggle('hidden-screen');
        }
    };

    if (musicBtn) musicBtn.addEventListener('click', toggleModal);
    if (heroListenBtn) heroListenBtn.addEventListener('click', toggleModal);
    if (closeMusicModal) closeMusicModal.addEventListener('click', toggleModal);

    const toggleAudioBtn = document.getElementById('toggle-ambient-audio');
    const bgAudio = document.getElementById('bg-audio');
    const modalAudio = document.getElementById('modal-audio-player');
    const statusEl = document.getElementById('music-status-text');

    let isPlaying = false;

    function syncAudioState(shouldPlay) {
        const audioElements = [modalAudio || bgAudio].filter(Boolean);

        if (shouldPlay) {
            // Keep both audio elements synchronized without changing their sources.
            const activeTime = audioElements.length
                ? audioElements[0].currentTime || 0
                : 0;

            audioElements.forEach(audio => {
                audio.currentTime = activeTime;
                audio.play().catch(error => {
                    console.log('Audio playback requires user interaction.', error);
                });
            });
        } else {
            audioElements.forEach(audio => audio.pause());
        }
    }

    function updateMusicStateUI() {
        if (statusEl) {
            statusEl.innerText = isPlaying
                ? 'Playing Melody 🎵'
                : 'Paused';
        }

        if (toggleAudioBtn) {
            toggleAudioBtn.innerHTML = isPlaying
                ? '<i data-lucide="volume-x" class="w-5 h-5"></i> Pause Romantic Melody'
                : '<i data-lucide="volume-2" class="w-5 h-5"></i> Play Romantic Melody Here';
        }

        if (window.lucide) lucide.createIcons();
    }

    [bgAudio, modalAudio].forEach(audio => {
        if (!audio) return;

        audio.addEventListener('play', () => {
            isPlaying = true;
            updateMusicStateUI();
        });

        audio.addEventListener('pause', () => {
            const anotherPlaying = [bgAudio, modalAudio].some(
                other => other && other !== audio && !other.paused
            );

            isPlaying = anotherPlaying;
            updateMusicStateUI();
        });
    });

    if (toggleAudioBtn) {
        toggleAudioBtn.addEventListener('click', () => {
            syncAudioState(!isPlaying);
        });
    }

    /* OPEN MY SURPRISE:
       Show the galaxy introduction only after this button is clicked.
       Music playback does NOT open the introduction. */
    const openSurpriseBtn = document.getElementById('open-surprise-btn');
    const continueFromMusicBtn = document.getElementById('continue-from-music-btn');
    const introScreen = document.getElementById('intro-screen');
    const universeScreen = document.getElementById('universe-screen');

    const continueToSurprise = () => {
        if (!openSurpriseBtn || openSurpriseBtn.disabled) return;

        if (musicModal) musicModal.classList.add('hidden-screen');
        openSurpriseBtn.disabled = true;

        if (introScreen) introScreen.classList.add('animate-warp');

        setTimeout(() => {
            if (introScreen) {
                introScreen.classList.add('hidden-screen');
                introScreen.classList.remove('animate-warp');
            }

            openSurpriseBtn.disabled = false;

            document.dispatchEvent(new CustomEvent('open-galaxy-intro'));
        }, 650);
    };

    if (openSurpriseBtn) openSurpriseBtn.addEventListener('click', continueToSurprise);
    if (continueFromMusicBtn) continueFromMusicBtn.addEventListener('click', continueToSurprise);

    const returnTopBtn = document.getElementById('return-top-btn');

    if (returnTopBtn) {
        returnTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* CARD 1: ENVELOPE AND LETTER */
    const envelopeCard = document.getElementById('envelope-card');
    const revealedLetter = document.getElementById('revealed-letter');

    if (envelopeCard && revealedLetter) {
        envelopeCard.addEventListener('click', () => {
            envelopeCard.classList.add('hidden-screen');
            revealedLetter.classList.remove('hidden-screen');
        });
    }

    /* CARD 4: REASONS CAROUSEL */
    const prevReasonBtn = document.getElementById('prev-reason-btn');
    const nextReasonBtn = document.getElementById('next-reason-btn');

    if (prevReasonBtn) {
        prevReasonBtn.addEventListener('click', () => {
            if (currentReasonIndex > 0) {
                currentReasonIndex--;
                updateReasonDisplay();
            }
        });
    }

    if (nextReasonBtn) {
        nextReasonBtn.addEventListener('click', () => {
            currentReasonIndex =
                (currentReasonIndex + 1) % REASONS_LIST.length;

            updateReasonDisplay();
        });
    }
}

/* -------------------------------------------------------------------------
   4. GALLERY & IMAGE PREVIEW
------------------------------------------------------------------------- */
function renderMemoryGallery() {
    const galleryContainer = document.getElementById('memory-gallery-grid');
    if (!galleryContainer) return;

    galleryContainer.innerHTML = '';

    MEMORY_PHOTOS.forEach((photo, idx) => {
        const card = document.createElement('div');

        card.className =
            'glass-card rounded-2xl p-3 border border-purple-400/30 group relative flex flex-col items-center text-center transition-all hover:scale-105';

        card.innerHTML = `
            <div class="relative w-full aspect-square rounded-xl overflow-hidden mb-3 border border-purple-300/30">
                <img
                    id="memory-img-${idx}"
                    src="${photo.url}"
                    alt="${photo.caption}"
                    title="Click to view photo full screen"
                    class="photo-zoom w-full h-full object-cover"
                    style="cursor: zoom-in;"
                >
                <label class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[11px] text-white font-medium cursor-pointer p-2">
                    <span>Change Photo</span>
                    <input
                        type="file"
                        accept="image/*"
                        class="hidden"
                        onchange="previewImage(event, 'memory-img-${idx}')"
                    >
                </label>
            </div>
            <span contenteditable="true"
                class="text-xs font-medium text-purple-200 outline-none hover:bg-purple-900/40 px-2 py-1 rounded w-full truncate">
                ${photo.caption}
            </span>
        `;

        galleryContainer.appendChild(card);
    });
}

/* Replace a photo using the existing file picker. */
function previewImage(event, targetId) {
    const file = event.target.files && event.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        const image = document.getElementById(targetId);
        if (image) image.src = e.target.result;
    };

    reader.readAsDataURL(file);
}

/* Instagram story video replacement. */
function uploadStoryMedia(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const videoElem = document.getElementById('highlight-video');
    if (!videoElem) return;

    if (!file.type.startsWith('video/')) return;

    const url = URL.createObjectURL(file);
    if (videoElem.dataset.objectUrl) {
        URL.revokeObjectURL(videoElem.dataset.objectUrl);
    }
    videoElem.dataset.objectUrl = url;
    videoElem.querySelector('source')?.remove();
    videoElem.src = url;
    videoElem.loop = true;
    videoElem.muted = true;
    videoElem.playsInline = true;
    videoElem.load();
    playStoryVideo(videoElem);
}

function setupStoryVideo() {
    const video = document.getElementById('highlight-video');
    if (!video) return;

    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.addEventListener('canplay', () => playStoryVideo(video));
    video.addEventListener('ended', () => {
        video.currentTime = 0;
        playStoryVideo(video);
    });

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                playStoryVideo(video);
            } else {
                video.pause();
            }
        }, { threshold: 0.15 });
        observer.observe(video);
    } else {
        playStoryVideo(video);
    }
}

function playStoryVideo(video) {
    video.play().catch(error => {
        console.warn('Story video could not autoplay. Check that the video codec is browser-compatible.', error);
    });
}

/* -------------------------------------------------------------------------
   5. REASONS CAROUSEL
------------------------------------------------------------------------- */
function updateReasonDisplay() {
    const numSpan = document.getElementById('reason-current-num');
    const textDisplay = document.getElementById('reason-text-display');
    const prevBtn = document.getElementById('prev-reason-btn');

    if (numSpan) numSpan.innerText = currentReasonIndex + 1;

    if (textDisplay) {
        textDisplay.innerText = REASONS_LIST[currentReasonIndex];
    }

    if (prevBtn) {
        prevBtn.disabled = currentReasonIndex === 0;
    }

    if (typeof triggerFireworksBurst === 'function') {
        triggerFireworksBurst();
    }
}

/* -------------------------------------------------------------------------
   6. GALAXY BACKGROUND CANVAS
------------------------------------------------------------------------- */
function initGalaxyCanvas() {
    const canvas = document.getElementById('galaxy-bg');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const stars = [];
    const shootingStars = [];
    let frameId = 0;
    let lastFrame = 0;
    let gradientA;
    let gradientB;

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        gradientA = ctx.createRadialGradient(
            width * 0.2, height * 0.3, 50,
            width * 0.2, height * 0.3, width * 0.5
        );
        gradientA.addColorStop(0, 'rgba(126, 34, 206, 0.12)');
        gradientA.addColorStop(1, 'transparent');
        gradientB = ctx.createRadialGradient(
            width * 0.8, height * 0.7, 50,
            width * 0.8, height * 0.7, width * 0.5
        );
        gradientB.addColorStop(0, 'rgba(76, 29, 149, 0.14)');
        gradientB.addColorStop(1, 'transparent');
    }

    window.addEventListener('resize', resize);
    resize();

    const starCount = Math.min(170, Math.floor((width * height) / 6500));

    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 1.8 + 0.2,
            alpha: Math.random(),
            speed: Math.random() * 0.015 + 0.005,
            color: Math.random() > 0.3 ? '#c084fc' : '#e9d5ff'
        });
    }

    function addShootingStar() {
        if (Math.random() < 0.025) {
            shootingStars.push({
                x: Math.random() * width,
                y: Math.random() * (height / 2),
                length: Math.random() * 80 + 40,
                speed: Math.random() * 10 + 6,
                angle: Math.PI / 4,
                alpha: 1
            });
        }
    }

    function animate() {
        frameId = requestAnimationFrame(animate);
        if (document.hidden) return;

        const now = performance.now();
        if (now - lastFrame < 1000 / 30) return;
        lastFrame = now;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = gradientA;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = gradientB;
        ctx.fillRect(0, 0, width, height);

        for (const star of stars) {
            star.alpha += star.speed;

            if (star.alpha > 1 || star.alpha < 0.2) {
                star.speed = -star.speed;
            }

            ctx.globalAlpha = star.alpha;
            ctx.fillStyle = star.color;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        addShootingStar();

        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const star = shootingStars[i];

            star.x += Math.cos(star.angle) * star.speed;
            star.y += Math.sin(star.angle) * star.speed;
            star.alpha -= 0.02;

            if (star.alpha <= 0) {
                shootingStars.splice(i, 1);
                continue;
            }

            ctx.strokeStyle = `rgba(233, 213, 255, ${star.alpha})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(
                star.x - Math.cos(star.angle) * star.length,
                star.y - Math.sin(star.angle) * star.length
            );
            ctx.stroke();
        }
    }

    function start() {
        if (!frameId) animate();
    }
    function stop() {
        cancelAnimationFrame(frameId);
        frameId = 0;
    }
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stop();
        else start();
    });
    animate();
}

/* -------------------------------------------------------------------------
   7. FIREWORKS CANVAS (CARD 4)
------------------------------------------------------------------------- */
let triggerFireworksBurst = () => {};

function initFireworksCanvas() {
    const canvas = document.getElementById('fireworks-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx || !canvas.parentElement) return;

    let width = 0;
    let height = 0;
    const particles = [];
    let frameId = 0;
    let lastFrame = 0;
    let isVisible = false;

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
        width = rect.width;
        height = rect.height;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;

            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 1;

            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.alpha = 1;
            this.decay = Math.random() * 0.02 + 0.01;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.03;
            this.alpha -= this.decay;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.alpha);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function createBurst(x, y) {
        const colors = [
            '#c084fc', '#e9d5ff', '#fbbf24',
            '#f59e0b', '#a855f7'
        ];

        for (let i = 0; i < 24; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            particles.push(new Particle(x, y, color));
        }
    }

    triggerFireworksBurst = () => {
        if (isVisible && width > 0 && height > 0) {
            createBurst(
                Math.random() * width,
                Math.random() * (height * 0.6)
            );
        }
    };

    function animate() {
        frameId = requestAnimationFrame(animate);
        if (!isVisible || document.hidden) {
            cancelAnimationFrame(frameId);
            frameId = 0;
            return;
        }

        const now = performance.now();
        if (now - lastFrame < 1000 / 24) return;
        lastFrame = now;

        ctx.clearRect(0, 0, width, height);

        if (Math.random() < 0.012 && particles.length < 120) {
            createBurst(
                Math.random() * width,
                Math.random() * (height * 0.6)
            );
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            particle.update();
            particle.draw();

            if (particle.alpha <= 0) {
                particles.splice(i, 1);
            }
        }

    }

    const observer = new IntersectionObserver(entries => {
        isVisible = entries[0].isIntersecting;
        if (isVisible && !frameId) {
            resize();
            animate();
        }
        if (!isVisible && frameId) {
            cancelAnimationFrame(frameId);
            frameId = 0;
            particles.length = 0;
            ctx.clearRect(0, 0, width, height);
        }
    }, { threshold: 0.05 });
    observer.observe(canvas);

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && isVisible && !frameId) animate();
        if (document.hidden && frameId) {
            cancelAnimationFrame(frameId);
            frameId = 0;
        }
    });
}

/* -------------------------------------------------------------------------
   9. GALAXY INTRODUCTION & PHOTO LIGHTBOX
------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    const galaxyIntro = document.getElementById('song-galaxy-intro');
    const enterGalaxy = document.getElementById('enter-galaxy-btn');
    const closeGalaxy = document.getElementById('close-song-intro');

    let galaxyShown = false;

    function showGalaxyIntro() {
        if (!galaxyIntro || galaxyShown) return;

        galaxyShown = true;
        galaxyIntro.classList.remove('hidden-screen');
        document.body.classList.add('intro-modal-open');

        if (typeof triggerFireworksBurst === 'function') {
            for (let i = 0; i < 4; i++) triggerFireworksBurst();
        }
    }

    function hideGalaxyIntro() {
        if (galaxyIntro) galaxyIntro.classList.add('hidden-screen');
        document.body.classList.remove('intro-modal-open');
    }

    // The song does not trigger the introduction.
    // Only the existing opening button dispatches this event.
    document.addEventListener('open-galaxy-intro', showGalaxyIntro);

    if (enterGalaxy) {
        enterGalaxy.addEventListener('click', () => {
            hideGalaxyIntro();

            const universe = document.getElementById('universe-screen');
            if (universe) universe.classList.remove('hidden-screen');

                window.history.replaceState(null, '', window.location.pathname + window.location.search);
                window.scrollTo(0, 0);
        });
    }

    function returnToOpeningScreen() {
        hideGalaxyIntro();

        const intro = document.getElementById('intro-screen');
        if (intro) intro.classList.remove('hidden-screen');

        galaxyShown = false;
    }

    if (closeGalaxy) {
        closeGalaxy.addEventListener('click', returnToOpeningScreen);
    }

    if (galaxyIntro) {
        galaxyIntro.addEventListener('click', event => {
            if (event.target === galaxyIntro) returnToOpeningScreen();
        });
    }

    /* PHOTO LIGHTBOX */
    const lightbox = document.getElementById('photo-lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeLightbox = document.getElementById('close-photo-lightbox');

    function openPhoto(img) {
        if (!lightbox || !lightboxImage || !img) return;

        lightboxImage.src = img.currentSrc || img.src;
        lightboxImage.alt = img.alt || 'Our memory';

        const card = img.closest('#memory-gallery-grid > *');
        const caption = card && card.querySelector('[contenteditable="true"]');

        if (lightboxCaption) {
            lightboxCaption.textContent =
                (caption && caption.textContent.trim()) ||
                img.alt ||
                'Our favorite memory';
        }

        lightbox.classList.remove('hidden-screen');
        document.body.style.overflow = 'hidden';
    }

    document.addEventListener('click', event => {
        const img = event.target.closest('img');

        if (!img || event.target.closest('label')) return;

        if (
            img.classList.contains('photo-zoom') ||
            img.closest('#memory-gallery-grid')
        ) {
            openPhoto(img);
        }
    });

    function closePhoto() {
        if (lightbox) lightbox.classList.add('hidden-screen');
        document.body.style.overflow = '';
    }

    if (closeLightbox) {
        closeLightbox.addEventListener('click', closePhoto);
    }

    if (lightbox) {
        lightbox.addEventListener('click', event => {
            if (event.target === lightbox) closePhoto();
        });
    }

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            hideGalaxyIntro();
            closePhoto();
        }
    });

    const globalFireworks = document.getElementById('global-fireworks');

    if (globalFireworks) {
        globalFireworks.style.pointerEvents = 'none';
    }
});
