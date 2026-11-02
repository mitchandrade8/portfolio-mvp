document.addEventListener('DOMContentLoaded', () => {
    // Select only sections that actually have an ID to prevent null errors
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    // Helper function to clear all active states
    function removeActiveClasses() {
        navLinks.forEach(link => link.classList.remove('active'));
    }

    // 1. Instantly update active state when a navigation link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            // Ensure we are only affecting internal anchor links (like #projects)
            if (this.getAttribute('href').startsWith('#')) {
                removeActiveClasses();
                this.classList.add('active');
            }
        });
    });

    // 2. Automatically update active state when scrolling down the page
    const observerOptions = {
        root: null,
        // Triggers the highlight when a section hits the upper-middle of the screen
        rootMargin: '-30% 0px -70% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const currentId = entry.target.getAttribute('id');
                const activeLink = document.querySelector(`.nav-links a[href="#${currentId}"]`);

                if (activeLink) {
                    removeActiveClasses();
                    activeLink.classList.add('active');
                }
            }
        });
    }, observerOptions);

    // Attach the observer to your ID-bearing sections
    sections.forEach(section => {
        observer.observe(section);
    });
});