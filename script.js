// Interactive Background
class InteractiveBackground {
    constructor() {
        this.canvas = document.getElementById('background-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.connections = [];
        this.sectionCircles = [];
        this.profileCardCenter = { x: 0, y: 0 };
        
        this.init();
        this.createParticles();
        this.getSectionPositions();
        this.animate();
        this.bindEvents();
    }
    
    init() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    getSectionPositions() {
        // Get profile card center
        const profileCard = document.querySelector('.profile-card');
        if (profileCard) {
            const rect = profileCard.getBoundingClientRect();
            this.profileCardCenter = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
        }
        
        // Get section circle positions and colors
        this.sectionCircles = [
            {
                element: document.querySelector('.section-circle.professional'),
                color: 'rgba(59, 130, 246, 0.4)', // Blue
                hoverColor: 'rgba(59, 130, 246, 0.7)'
            },
            {
                element: document.querySelector('.section-circle.education'),
                color: 'rgba(16, 185, 129, 0.4)', // Green
                hoverColor: 'rgba(16, 185, 129, 0.7)'
            },
            {
                element: document.querySelector('.section-circle.contact'),
                color: 'rgba(245, 158, 11, 0.4)', // Orange
                hoverColor: 'rgba(245, 158, 11, 0.7)'
            },
            {
                element: document.querySelector('.section-circle.about'),
                color: 'rgba(239, 68, 68, 0.4)', // Red
                hoverColor: 'rgba(239, 68, 68, 0.7)'
            }
        ];
        
        // Update positions
        this.updateSectionPositions();
    }
    
    updateSectionPositions() {
        // Update profile card center
        const profileCard = document.querySelector('.profile-card');
        if (profileCard) {
            const rect = profileCard.getBoundingClientRect();
            this.profileCardCenter = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
        }
        
        // Update section circle positions
        this.sectionCircles.forEach(section => {
            if (section.element) {
                const rect = section.element.getBoundingClientRect();
                section.x = rect.left + rect.width / 2;
                section.y = rect.top + rect.height / 2;
                section.isHovered = section.element.matches(':hover');
            }
        });
    }
    
    drawSectionConnections() {
        this.updateSectionPositions();
        
        this.sectionCircles.forEach(section => {
            if (section.x && section.y) {
                // Create animated line effect
                const time = Date.now() * 0.002;
                const pulseIntensity = 0.5 + Math.sin(time + section.x * 0.01) * 0.3;
                
                // Choose color based on hover state
                const color = section.isHovered ? section.hoverColor : section.color;
                const opacity = pulseIntensity * (section.isHovered ? 1 : 0.6);
                
                // Draw main connection line
                this.ctx.beginPath();
                this.ctx.moveTo(section.x, section.y);
                this.ctx.lineTo(this.profileCardCenter.x, this.profileCardCenter.y);
                this.ctx.strokeStyle = color.replace(/[\d\.]+\)$/g, `${opacity})`);
                this.ctx.lineWidth = section.isHovered ? 2 : 1;
                this.ctx.stroke();
                
                // Draw animated particles along the line
                if (section.isHovered) {
                    this.drawLineParticles(section.x, section.y, this.profileCardCenter.x, this.profileCardCenter.y, color, time);
                }
            }
        });
    }
    
    drawLineParticles(x1, y1, x2, y2, color, time) {
        const particleCount = 5;
        const dx = x2 - x1;
        const dy = y2 - y1;
        
        for (let i = 0; i < particleCount; i++) {
            const progress = (time * 0.5 + i * 0.2) % 1;
            const x = x1 + dx * progress;
            const y = y1 + dy * progress;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 2, 0, Math.PI * 2);
            this.ctx.fillStyle = color.replace(/[\d\.]+\)$/g, `${0.8})`);
            this.ctx.fill();
        }
    }
    
    createParticles() {
        const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 11500); // Increased density by 30% (15000 -> 11500)
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                originalX: 0,
                originalY: 0,
                size: Math.random() * 2 + 1
            });
        }
        
        // Store original positions
        this.particles.forEach(particle => {
            particle.originalX = particle.x;
            particle.originalY = particle.y;
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            // Mouse interaction
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 150;
            
            if (distance < maxDistance) {
                const force = (maxDistance - distance) / maxDistance;
                const angle = Math.atan2(dy, dx);
                particle.x -= Math.cos(angle) * force * 2;
                particle.y -= Math.sin(angle) * force * 2;
            } else {
                // Return to original position slowly
                particle.x += (particle.originalX - particle.x) * 0.02;
                particle.y += (particle.originalY - particle.y) * 0.02;
            }
            
            // Natural drift
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Boundary check
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(77, 77, 77, 0.72)'; // 20% brighter (64->77) and higher opacity (0.6->0.72)
            this.ctx.fill();
        });
    }
    
    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) {
                    const opacity = (120 - distance) / 120 * 0.36; // 20% brighter (0.3->0.36)
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(77, 77, 77, ${opacity})`; // 20% brighter color (64->77)
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawConnections();
        this.drawParticles();
        this.drawSectionConnections();
        
        requestAnimationFrame(() => this.animate());
    }
    
    bindEvents() {
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.particles = [];
            this.createParticles();
            this.getSectionPositions();
        });
    }
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Portfolio loaded successfully');
    
    // Initialize interactive background
    new InteractiveBackground();
    
    // Get all interactive elements
    const sectionCircles = document.querySelectorAll('.section-circle');
    const detailCards = document.querySelectorAll('.detail-card');
    const overlay = document.getElementById('overlay');
    const closeBtns = document.querySelectorAll('.close-btn');
    
    // Handle profile image loading
    const profileImg = document.getElementById('profile-img');
    if (profileImg) {
        profileImg.addEventListener('error', function() {
            console.log('Profile image failed to load, using placeholder');
            this.style.display = 'none';
            
            // Create placeholder
            const placeholder = document.createElement('div');
            placeholder.style.cssText = `
                width: 120px;
                height: 120px;
                border-radius: 50%;
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 2rem;
                font-weight: bold;
                margin: 0 auto;
            `;
            placeholder.textContent = 'PD';
            this.parentNode.appendChild(placeholder);
        });
    }
    
    // Add click handlers to section circles
    sectionCircles.forEach(circle => {
        circle.addEventListener('click', function() {
            const section = this.dataset.section;
            const targetCard = document.getElementById(`${section}-card`);
            
            if (targetCard) {
                // Hide all other cards
                detailCards.forEach(card => {
                    if (card !== targetCard) {
                        card.classList.remove('active');
                    }
                });
                
                // Show target card and overlay
                targetCard.classList.add('active');
                overlay.classList.add('active');
                
                // Prevent body scroll
                document.body.style.overflow = 'hidden';
                
                console.log(`Opened ${section} card`);
            }
        });
        
        // Add hover sound effect (optional)
        circle.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });
        
        circle.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // Add click handlers to close buttons
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            closeAllCards();
        });
    });
    
    // Add click handler to overlay
    overlay.addEventListener('click', function() {
        closeAllCards();
    });
    
    // Close cards with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllCards();
        }
    });
    
    // Function to close all cards
    function closeAllCards() {
        detailCards.forEach(card => {
            card.classList.remove('active');
        });
        overlay.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = 'hidden'; // Keep hidden since we want no scroll
        
        console.log('Closed all cards');
    }
    
    // Add smooth animations on page load
    setTimeout(() => {
        sectionCircles.forEach((circle, index) => {
            setTimeout(() => {
                circle.style.opacity = '1';
                circle.style.transform = 'scale(1)';
            }, index * 200);
        });
    }, 500);
    
    // Initialize circles with animation-ready state
    sectionCircles.forEach(circle => {
        circle.style.opacity = '0';
        circle.style.transform = 'scale(0.8)';
        circle.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    });
    
    // Add floating animation to profile card
    const profileCard = document.querySelector('.profile-card');
    if (profileCard) {
        let floatDirection = 1;
        setInterval(() => {
            const currentTransform = profileCard.style.transform || 'translate(-50%, -50%)';
            const yOffset = Math.sin(Date.now() * 0.001) * 3;
            profileCard.style.transform = `translate(-50%, calc(-50% + ${yOffset}px))`;
        }, 50);
    }
    
    // Add particle effect on circle hover (optional enhancement)
    sectionCircles.forEach(circle => {
        circle.addEventListener('mouseenter', function() {
            createHoverEffect(this);
        });
    });
    
    function createHoverEffect(element) {
        // Create subtle glow effect
        const rect = element.getBoundingClientRect();
        const glow = document.createElement('div');
        glow.style.cssText = `
            position: fixed;
            left: ${rect.left - 10}px;
            top: ${rect.top - 10}px;
            width: ${rect.width + 20}px;
            height: ${rect.height + 20}px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            pointer-events: none;
            z-index: 1;
            animation: glowPulse 0.6s ease-out forwards;
        `;
        
        document.body.appendChild(glow);
        
        setTimeout(() => {
            if (glow.parentNode) {
                glow.parentNode.removeChild(glow);
            }
        }, 600);
    }
    
    // Add CSS animation for glow effect
    const style = document.createElement('style');
    style.textContent = `
        @keyframes glowPulse {
            0% {
                opacity: 0;
                transform: scale(0.8);
            }
            50% {
                opacity: 1;
                transform: scale(1.1);
            }
            100% {
                opacity: 0;
                transform: scale(1.3);
            }
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .profile-card {
            animation: fadeInUp 0.8s ease-out;
        }
    `;
    document.head.appendChild(style);
    
    console.log('Interactive portfolio initialized successfully');
});

// Handle window resize
window.addEventListener('resize', function() {
    // Adjust circle positions on mobile if needed
    const circles = document.querySelectorAll('.section-circle');
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        circles.forEach(circle => {
            circle.style.transform = 'scale(0.9)';
        });
    } else {
        circles.forEach(circle => {
            circle.style.transform = 'scale(1)';
        });
    }
});

// Add smooth scroll behavior for any internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Performance optimization: Preload images
function preloadImages() {
    const images = ['MyImage.jfif'];
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Call preload on page load
window.addEventListener('load', preloadImages);