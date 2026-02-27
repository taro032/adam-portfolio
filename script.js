// Initialize Lucide Icons
lucide.createIcons();

// Scroll Navbar Effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Reveal Elements on Scroll
const revealElements = document.querySelectorAll('.reveal, .reveal-delay-1');

const revealOnScroll = () => {
    const triggerBottom = window.innerHeight * 0.9;

    revealElements.forEach(el => {
        const top = el.getBoundingClientRect().top;
        if (top < triggerBottom) {
            el.classList.add('active');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// --- 高级平滑滚动逻辑 (Custom Cubic-Bezier Easing) ---
const smoothScroll = (targetElement) => {
    const navHeight = document.getElementById('navbar')?.offsetHeight || 72;
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;
    const duration = 1000; // 1秒时长

    // Easing Function: Ease-in-out Cubic
    const ease = (t, b, c, d) => {
        t /= d / 2;
        if (t < 1) return (c / 2) * t * t * t + b;
        t -= 2;
        return (c / 2) * (t * t * t + 2) + b;
    };

    const animation = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    };

    requestAnimationFrame(animation);
};

// Smooth Link Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            smoothScroll(targetElement);
        }
    });
});
