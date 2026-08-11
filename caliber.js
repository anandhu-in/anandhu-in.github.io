// ======================================
// HERO ANIMATION
// ======================================

document.querySelector(".database-hero").classList.add("hero-show");


// ======================================
// REVEAL ON SCROLL
// ======================================

const hiddenElements = document.querySelectorAll(".database-section");

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
    });
}, { threshold: 0.2 });

hiddenElements.forEach(section => {
    section.classList.add("hidden");
    revealObserver.observe(section);
});


// ======================================
// PROGRESS BAR + COUNTER
// (covers overall bars/percent AND every
// individual skill-card bar/percent, since
// they all share the same .fill / .counter
// classes now)
// ======================================

const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        // Overall bar
        const overall = entry.target.querySelector(".overall-fill");
        if (overall) {
            overall.style.width = overall.dataset.width + "%";
        }

        // Skill bars
        entry.target.querySelectorAll(".fill").forEach(fill => {
            fill.style.width = fill.dataset.width + "%";
        });

        // Percent counters (overall + per-skill)
        entry.target.querySelectorAll(".counter").forEach(counter => {
            const target = +counter.dataset.target;
            let current = 0;
            const speed = Math.max(8, 120 / target);

            const update = () => {
                if (current < target) {
                    current++;
                    counter.textContent = current + "%";
                    setTimeout(update, speed);
                } else {
                    counter.textContent = target + "%";
                }
            };

            update();
        });

        progressObserver.unobserve(entry.target);
    });
}, { threshold: .35 });

document.querySelectorAll(".database-section").forEach(section => {
    progressObserver.observe(section);
});


// ======================================
// SIDEBAR ACTIVE LINK
// ======================================

const navLinks = document.querySelectorAll(".sidebar a");
const sections = document.querySelectorAll(".database-section");

window.addEventListener("scroll", () => {
    let current = "";

    sections.forEach(section => {
        const top = section.offsetTop - 180;
        if (pageYOffset >= top) {
            current = section.getAttribute("id");
        }
    });

    navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === "#" + current) {
            link.classList.add("active");
        }
    });
});


// ======================================
// SMOOTH SCROLL
// ======================================

navLinks.forEach(link => {
    link.addEventListener("click", function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute("href"))
            .scrollIntoView({ behavior: "smooth" });
    });
});


// ======================================
// SKILL CARDS — details hint + cursor glow
// ======================================

const cards = document.querySelectorAll(".skill-card");

cards.forEach(card => {

    // small "view details" hint in the corner
    const hint = document.createElement("span");
    hint.className = "details-hint";
    hint.textContent = "VIEW DETAILS →";
    card.appendChild(hint);

    // cursor-follow glow (uses CSS variables, doesn't
    // fight with the card's own background/border styles)
    card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mx", x + "px");
        card.style.setProperty("--my", y + "px");
    });
});


// ======================================
// SKILL DETAIL MODAL
// ======================================

const modal = document.getElementById("skillModal");
const modalTitle = document.getElementById("modalTitle");
const modalLevel = document.querySelector(".modalLevel");
const modalPlatforms = document.getElementById("modalPlatforms");
const modalTools = document.getElementById("modalTools");
const modalTechniques = document.getElementById("modalTechniques");
const closeModalBtn = document.getElementById("closeModal");

function openModal(card) {
    const title = card.dataset.title || card.querySelector("h4")?.textContent || "";
    const percentEl = card.querySelector(".counter");
    const percent = percentEl ? percentEl.dataset.target : "";

    modalTitle.textContent = title;
    modalLevel.textContent = percent ? ("Proficiency: " + percent + "%") : "";
    modalPlatforms.textContent = card.dataset.platforms || "—";
    modalTools.textContent = card.dataset.tools || "—";
    modalTechniques.textContent = card.dataset.techniques || "—";

    modal.classList.add("open");
    document.body.classList.add("modal-open");
}

function closeModal() {
    modal.classList.remove("open");
    document.body.classList.remove("modal-open");
}

cards.forEach(card => {
    card.addEventListener("click", () => openModal(card));
});

if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeModal);
}

if (modal) {
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
});


// ======================================
// TERMINAL CURSOR TITLE (blinking tag)
// ======================================

const title = document.querySelector(".database-tag");

if (title) {
    setInterval(() => {
        title.classList.toggle("blink");
    }, 550);
}