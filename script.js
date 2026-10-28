const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {
    let current = "";

    // Determine which section is currently on screen
    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        // Offset by a few pixels so it triggers slightly before the section hits the absolute top
        if (pageYOffset >= sectionTop - 150) {
            current = section.getAttribute("id");
        }
    });

    // Remove active class from all links, then add it to the current one
    navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href").includes(current)) {
            link.classList.add("active");
        }
    });
});