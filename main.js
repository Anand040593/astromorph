// Throttled Scroll Manager for Navbar & Hero reveal animations
const navbar = document.querySelector('.navbar');
const heroScrollContainer = document.querySelector('.hero-scroll-container');
const heroStickyWrapper = document.querySelector('.hero-sticky-wrapper');
const heroRipple = document.querySelector('.hero-ripple');

let lastScrollY = window.scrollY;
let scrollTicking = false;

function updateScrollAnimations() {
    const scrollY = lastScrollY;

    // 1. Navbar Scrolled Effect
    if (navbar) {
        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // 2. Hero Scroll Mask Reveal
    if (heroScrollContainer && heroStickyWrapper) {
        const maxScroll = window.innerHeight;
        let progress = Math.min(scrollY / maxScroll, 1);
        
        // Calculate max radius needed to cover the screen corners
        const maxRadius = Math.sqrt(Math.pow(window.innerWidth / 2, 2) + Math.pow(window.innerHeight / 2, 2));
        
        // Starts at 0px radius, expands to maxRadius + a little extra padding
        const radius = progress * (maxRadius + 100); 
        
        heroStickyWrapper.style.setProperty('--hero-mask', `${radius}px`);
        
        // Fade out the ripple border when it completely covers the screen
        if (heroRipple) {
            if (progress >= 1) {
                heroRipple.style.opacity = '0';
                heroRipple.style.pointerEvents = 'none';
            } else {
                heroRipple.style.opacity = '1';
                heroRipple.style.pointerEvents = 'auto';
            }
        }
    }

    scrollTicking = false;
}

window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    if (!scrollTicking) {
        window.requestAnimationFrame(updateScrollAnimations);
        scrollTicking = true;
    }
}, { passive: true });

// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-links a');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking a link
navItems.forEach(item => {
    item.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Intersection Observer for Scroll Animations
const faders = document.querySelectorAll('.zoom-in');

const appearOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const appearOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            return;
        } else {
            // Support stagger delays via CSS variables if present
            const delay = entry.target.style.getPropertyValue('--delay');
            if (delay) {
                entry.target.style.transitionDelay = delay;
            }
            entry.target.classList.add('appear');
            observer.unobserve(entry.target);
        }
    });
}, appearOptions);

faders.forEach(fader => {
    appearOnScroll.observe(fader);
});

// Parallax effect for mouse move on hero (disabled for performance)
// const hero = document.querySelector('.hero');
// hero.addEventListener('mousemove', (e) => {
//     const x = (window.innerWidth - e.pageX * 2) / 100;
//     const y = (window.innerHeight - e.pageY * 2) / 100;
//     // hero.style.transform = `translateX(${x}px) translateY(${y}px)`;
// });

// Liquid Light Blobs (Gooey effect) - Highly Optimized
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
const gooeyContainer = document.querySelector('.gooey-container');

const blobs = [
    { el: document.querySelector('.blob-1'), x: window.innerWidth / 2, y: window.innerHeight / 2, speed: 0.12 },
    { el: document.querySelector('.blob-2'), x: window.innerWidth / 2, y: window.innerHeight / 2, speed: 0.08 },
    { el: document.querySelector('.blob-3'), x: window.innerWidth / 2, y: window.innerHeight / 2, speed: 0.05 }
];

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let isIdle = false;
let idleTimeout = null;
let dripSpeed = 0;
let isAnimating = false;

function startAnimation() {
    if (!isAnimating && !isTouchDevice) {
        isAnimating = true;
        requestAnimationFrame(animateLiquid);
    }
}

if (!isTouchDevice) {
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Reset idle state
        isIdle = false;
        dripSpeed = 0;
        clearTimeout(idleTimeout);
        
        startAnimation();
        
        // Set idle timeout (1 second of no movement)
        idleTimeout = setTimeout(() => {
            isIdle = true;
        }, 1000);
    });

    // Start initial animation to let the blobs transition to the center
    startAnimation();
    idleTimeout = setTimeout(() => {
        isIdle = true;
    }, 1000);
} else {
    // Hide the gooey container on mobile/touch screens to eliminate rendering/CPU cost
    if (gooeyContainer) {
        gooeyContainer.style.display = 'none';
    }
}

function animateLiquid() {
    // If mouse is idle, simulate a water drip falling down the screen
    if (isIdle) {
        dripSpeed += 0.05; // Gravity acceleration
        mouseY += dripSpeed; // Move target downwards
        mouseX += Math.sin(Date.now() / 200) * 0.3; // Slight wobble as it drips
    }

    let allBlobsOffscreen = true;

    // Animate blobs using GPU-accelerated translate3d
    blobs.forEach(blob => {
        if (blob.el) {
            blob.x += (mouseX - blob.x) * blob.speed;
            blob.y += (mouseY - blob.y) * blob.speed;
            
            // Apply GPU-accelerated transforms
            blob.el.style.transform = `translate3d(${blob.x}px, ${blob.y}px, 0) translate(-50%, -50%)`;
            
            // Check if this blob is still visible in the viewport
            const blobSize = blob.el.offsetWidth || 160;
            if (blob.y < window.innerHeight + blobSize && blob.y > -blobSize &&
                blob.x < window.innerWidth + blobSize && blob.x > -blobSize) {
                allBlobsOffscreen = false;
            }
        }
    });
    
    // Pause animation if idle and all blobs are off-screen
    if (isIdle && allBlobsOffscreen) {
        isAnimating = false;
        return; // Stop requesting new frames to save CPU/GPU cycles
    }

    requestAnimationFrame(animateLiquid);
}
