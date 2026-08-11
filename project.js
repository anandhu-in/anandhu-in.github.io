// ==========================================================
// HERO
// ==========================================================

document.querySelector(".hero").classList.add("show");


// ==========================================================
// SCROLL REVEAL
// ==========================================================

const reveals=document.querySelectorAll(".project-card,.dash-card,.footer");

const observer=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("show");

observer.unobserve(entry.target);

}

});

},{threshold:.2});

reveals.forEach(el=>{

el.classList.add("hidden");

observer.observe(el);

});


// ==========================================================
// DASHBOARD COUNTER
// ==========================================================

document.querySelectorAll(".dash-card h3").forEach(counter=>{

const value=parseInt(counter.innerText);

if(isNaN(value)) return;

let current=0;

const speed=value/70;

function update(){

if(current<value){

current+=speed;

counter.innerText=Math.floor(current);

requestAnimationFrame(update);

}else{

counter.innerText=value;

}

}

update();

});


// ==========================================================
// PROJECT CARD TILT
// ==========================================================

document.querySelectorAll(".project-card").forEach(card=>{

card.addEventListener("mousemove",(e)=>{

const rect=card.getBoundingClientRect();

const x=e.clientX-rect.left;

const y=e.clientY-rect.top;

const rotateY=(x-rect.width/2)/35;

const rotateX=(rect.height/2-y)/35;

card.style.transform=

`perspective(1200px)
rotateX(${rotateX}deg)
rotateY(${rotateY}deg)
translateY(-10px)`;

});

card.addEventListener("mouseleave",()=>{

card.style.transform="perspective(1200px) rotateX(0) rotateY(0)";

});

});


// ==========================================================
// MAGNET BUTTON
// ==========================================================

document.querySelectorAll(".btn").forEach(btn=>{

btn.addEventListener("mousemove",(e)=>{

const rect=btn.getBoundingClientRect();

const x=e.clientX-rect.left-rect.width/2;

const y=e.clientY-rect.top-rect.height/2;

btn.style.transform=`translate(${x*.15}px,${y*.15}px)`;

});

btn.addEventListener("mouseleave",()=>{

btn.style.transform="translate(0,0)";

});

});


// ==========================================================
// ACTIVE NAV
// ==========================================================

const navLinks=document.querySelectorAll("nav a");

window.addEventListener("scroll",()=>{

let current="";

document.querySelectorAll("section").forEach(section=>{

if(scrollY>=section.offsetTop-180){

current=section.id;

}

});

navLinks.forEach(link=>{

link.classList.remove("active");

if(link.getAttribute("href")==="#"+current){

link.classList.add("active");

}

});

});


// ==========================================================
// PARALLAX HERO
// ==========================================================

window.addEventListener("scroll",()=>{

document.querySelector(".hero").style.transform=

`translateY(${scrollY*.15}px)`;

});


// ==========================================================
// RED SCANLINE
// ==========================================================

const scan=document.createElement("div");

scan.style.position="fixed";
scan.style.left="0";
scan.style.top="0";
scan.style.width="100%";
scan.style.height="2px";
scan.style.pointerEvents="none";
scan.style.zIndex="99999";
scan.style.background="rgba(255,60,60,.22)";
scan.style.boxShadow="0 0 20px #ff3b3b";
scan.style.animation="scan 6s linear infinite";

document.body.appendChild(scan);

const style=document.createElement("style");

style.innerHTML=`

@keyframes scan{

0%{

transform:translateY(-10px);

}

100%{

transform:translateY(100vh);

}

}

`;

document.head.appendChild(style);


// ==========================================================
// CARD GLOW FOLLOW
// ==========================================================

document.querySelectorAll(".project-card").forEach(card=>{

card.addEventListener("mousemove",(e)=>{

const rect=card.getBoundingClientRect();

const x=e.clientX-rect.left;

const y=e.clientY-rect.top;

card.style.background=

`radial-gradient(circle at ${x}px ${y}px,
rgba(255,59,59,.12),
#0b0707 45%)`;

});

card.addEventListener("mouseleave",()=>{

card.style.background="#0b0707";

});

});
// ==========================================================
// DOSSIER
// ==========================================================

const modal=document.getElementById("dossierModal");
const content=document.getElementById("dossierContent");
const closeBtn=document.getElementById("closeDossier");

const dossiers={

obscura:`

<div class="dossier-header">

<div>

<div class="classified">CLASSIFIED</div>

<h1 class="dossier-title">OBSCURA</h1>

</div>

</div>

<div class="dossier-grid">

<div class="info-box">

<p>TYPE</p>

<h4>CTF MACHINE</h4>

</div>

<div class="info-box">

<p>YEAR</p>

<h4>2026</h4>

</div>

<div class="info-box">

<p>STATUS</p>

<h4>COMPLETED</h4>

</div>

<div class="info-box">

<p>CATEGORY</p>

<h4>WEB SECURITY</h4>

</div>

</div>

<div class="dossier-section">

<h3>MISSION OVERVIEW</h3>

<p>

OBSCURA is a realistic Capture The Flag machine focused on web application security. Built completely from scratch, it simulates a multi-stage penetration test beginning with enumeration and ending in privilege escalation through chained vulnerabilities.

</p>

</div>

<div class="dossier-section">

<h3>TECH STACK</h3>

<div class="tech-stack">

<span>STEGANOGRAPHY</span>

<span>Apache</span>

<span>Linux</span>

<span>Burp Suite</span>

<span>Gobuster</span>

</div>

</div>

<div class="dossier-section">

<h3>KEY OBJECTIVES</h3>

<ul class="objectives">

<li>✔ Enumeration</li>

<li>✔ Exploitation</li>

<li>✔ Steganography</li>

<li>✔ File Upload Abuse</li>

<li>✔ Reverse Shell</li>

<li>✔ Privilege Escalation</li>

</ul>

</div>

`,

hack20:`

<div class="dossier-header">

<div>

<div class="classified">RESTRICTED</div>

<h1 class="dossier-title">HACK 20</h1>

</div>

</div>

<div class="dossier-grid">

<div class="info-box">

<p>TYPE</p>

<h4>CTF PLATFORM</h4>

</div>

<div class="info-box">

<p>YEAR</p>

<h4>2026</h4>

</div>

<div class="info-box">

<p>STATUS</p>

<h4>COMPLETED</h4>

</div>

<div class="info-box">

<p>CATEGORY</p>

<h4>OFFENSIVE SECURITY</h4>

</div>

</div>

<div class="dossier-section">

<h3>MISSION OVERVIEW</h3>

<p>

HACK 20 is a custom Capture The Flag platform created to provide realistic offensive security challenges, combining web exploitation, enumeration and practical attack simulations.

</p>

</div>

<div class="dossier-section">

<h3>TECH STACK</h3>

<div class="tech-stack">

<span>METASPLOIT</span>

<span>MySQL</span>

<span>Apache</span>

<span>DRUPAL</span>

<span>Nmap</span>

<span>Gobuster</span>

</div>

</div>

<div class="dossier-section">

<h3>FEATURES</h3>

<ul class="objectives">

<li>✔ Multiple Challenges</li>

<li>✔ Leaderboard</li>

<li>✔ Custom Flag Validation</li>

<li>✔ Responsive UI</li>

<li>✔ Cyberpunk Design</li>

</ul>

</div>

`,

college:`

<div class="dossier-header">

<div>

<div class="classified">DOCUMENTATION</div>

<h1 class="dossier-title">FINDLAND - REAL ESTATE PLATFORM</h1>

</div>

</div>

<div class="dossier-grid">

<div class="info-box">

<p>TYPE</p>

<h4>FULL STACK</h4>

</div>

<div class="info-box">

<p>YEAR</p>

<h4>2025</h4>

</div>

<div class="info-box">

<p>STATUS</p>

<h4>COMPLETED</h4>

</div>

<div class="info-box">

<p>CATEGORY</p>

<h4>WEB DEVELOPMENT</h4>

</div>

</div>

<div class="dossier-section">

<h3>PROJECT OVERVIEW</h3>

<p>

A real estate platform developed as a final-year academic project to simplify the process of finding and buying plots, land, and houses.
</p>

</div>

<div class="dossier-section">

<h3>TECH STACK</h3>

<div class="tech-stack">

<span>HTML</span>

<span>CSS</span>

<span>JavaScript</span>

<span>PYTHON</span>

<span>MySQL</span>

</div>

</div>

<div class="dossier-section">

<h3>FEATURES</h3>

<ul class="objectives">

<li>✔ Android Application for Users</li>

<li>✔Broker Registration & Property Listing</li>

<li>✔ Categorized Property Listings</li>

<li>✔ Direct Broker–User Communication</li>

<li>✔ Database Management</li>

</ul>

</div>

`

};

document.querySelectorAll(".dossier-btn").forEach(button=>{

button.addEventListener("click",(e)=>{

    e.preventDefault();

    const project=button.dataset.project;

    modal.className="dossier active "+project;

    content.innerHTML=dossiers[project];

    document.body.style.overflow="hidden";

});

});

closeBtn.addEventListener("click",()=>{

    modal.className="dossier";

    document.body.style.overflow="";

});

modal.addEventListener("click",(e)=>{

    if(e.target===modal){

        modal.className="dossier";

        document.body.style.overflow="";

    }

});

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        modal.className="dossier";

        document.body.style.overflow="";

    }

});
