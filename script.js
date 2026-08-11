// ======================================================
// LOADER
// ======================================================

const bootBody=document.getElementById("bootBody");

const bootLines=[

["info","> Booting Secure Research Environment"],

["info","> Loading security modules..."],

["success","✓ Firewall initialized"],

["success","✓ Threat intelligence database loaded"],

["success","✓ TLS session established"],

["success","✓ Integrity verification complete"],

["info","> Opening researcher profile..."],

["warning","> ACCESS LEVEL : PUBLIC"],

["success","✓ Welcome."]

];

let line=0;

// At the top of script.js inside addLine():
function addLine(){

    if(line>=bootLines.length){

        return;

    }

    if(bootBody){

        const div=document.createElement("div");
        div.className="boot-line boot-"+bootLines[line][0];
        div.innerHTML=bootLines[line][1];
        bootBody.appendChild(div);
        bootBody.scrollTop=bootBody.scrollHeight;

    }

    line++;
    setTimeout(addLine,320);

}


// ======================================================
// SCROLL REVEAL
// ======================================================

const revealItems=document.querySelectorAll(".reveal");

const revealObserver=new IntersectionObserver((entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("active");

}

});

},{threshold:.18});

revealItems.forEach(item=>{

revealObserver.observe(item);

});


// ======================================================
// SCRAMBLE EFFECT
// ======================================================

function scramble(el,text,speed=18){

    const chars="01";

    let iteration=0;

    clearInterval(el.scramble);

    el.scramble=setInterval(()=>{

        let output="";

        for(let i=0;i<text.length;i++){

            if(text[i]===" "){

                output+=" ";

                continue;

            }

            if(i<iteration){

                output+=text[i];

            }else{

                output+=chars[Math.floor(Math.random()*2)];

            }

        }

        el.textContent=output;

        if(iteration>=text.length){

            clearInterval(el.scramble);
            el.textContent=text;

        }

        iteration+=0.7;

    },speed);

}


// ======================================================
// ABOUT TEXT
// ======================================================

const binary=document.querySelectorAll(".binary");

const binaryObserver=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

scramble(entry.target,entry.target.innerText,12);

binaryObserver.unobserve(entry.target);

}

});

},{threshold:.45});

binary.forEach(item=>{

binaryObserver.observe(item);

});


// ======================================================
// TERMINAL INFO
// ======================================================

const terminalItems = document.querySelectorAll(".decode");

function typeWriter(el, text, speed = 35) {

    let i = 0;

    function type() {

        if (i < text.length) {

            el.textContent += text.charAt(i);

            i++;

            setTimeout(type, speed);

        }

    }

    type();

}

const terminalObserver = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            const items = document.querySelectorAll(".decode");

            items.forEach((item, index) => {

                setTimeout(() => {

                    typeWriter(item, item.dataset.text, 35);

                }, index * 600);

            });

            terminalObserver.disconnect();

        }

    });

}, { threshold: 0.5 });

const termCard = document.querySelector(".terminal-card");
if(termCard){
    terminalObserver.observe(termCard);
}


// ======================================================
// EXPERTISE
// ======================================================

const percents=document.querySelectorAll(".percent");

const fills=document.querySelectorAll(".progress-fill");

const skillObserver=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

const fill=entry.target.querySelector(".progress-fill");

const percent=entry.target.querySelector(".percent");

const target=parseInt(fill.dataset.width);

fill.style.width=target+"%";

let count=0;

const counter=setInterval(()=>{

count++;

percent.innerText=count+"%";

if(count>=target){

clearInterval(counter);

}

},18);

skillObserver.unobserve(entry.target);

}

});

},{threshold:.4});

document.querySelectorAll(".skill-card").forEach(card=>{

skillObserver.observe(card);

});


// ======================================================
// HERO FLOATING CYBER TERMS
// ======================================================

const cyberWords=[

"TLS_1.3",

"0x2AF44",

"10100110",

"SCAN_COMPLETE",

"443 OPEN",

"SHA256",

"ACCESS_GRANTED",

"JWT",

"PORT_80",

"0xDEADBEEF",

"NODE_SECURE",

"BURP_SUITE",

"METASPLOIT",

"ACTIVE_DIRECTORY",

"SQLI",

"XSS",

"AES256",

"NMAP",

"PRIV_ESC",

"SSH"

];

const overlay=document.getElementById("heroCyberOverlay");

if(overlay){

cyberWords.forEach((word,i)=>{

const span=document.createElement("span");

span.innerText=word;

span.style.left=Math.random()*100+"%";

span.style.animationDuration=(10+Math.random()*10)+"s";

span.style.animationDelay=(Math.random()*6)+"s";

overlay.appendChild(span);

});

}


// ======================================================
// CERTIFICATE COVERFLOW
// ======================================================

const cards = [...document.querySelectorAll(".certificate")];

let active = 0;

const prevBtn=document.getElementById("certPrev");
const nextBtn=document.getElementById("certNext");
const counter=document.getElementById("certCounter");

function updateCards(){

if(window.innerWidth<=768){

    cards.forEach(card=>{

        card.className = "certificate";
        card.style.display = "block";

    });

    return;

}
    const total = cards.length;

    cards.forEach((card,index)=>{

        card.className="certificate";

        let diff=index-active;

        if(diff>total/2) diff-=total;
        if(diff<-total/2) diff+=total;

        if(diff===0){

            card.classList.add("active");

        }

        else if(diff===-1){

            card.classList.add("left1");

        }

        else if(diff===1){

            card.classList.add("right1");

        }

        else if(diff===-2){

            card.classList.add("left2");

        }

        else if(diff===2){

            card.classList.add("right2");

        }

        else if(diff===-3){

            card.classList.add("left3");

        }

        else if(diff===3){

            card.classList.add("right3");

        }

        else{

            card.classList.add("hidden");

        }

    });
    if(counter){

    counter.innerText=`MISSION FILE ${String(active+1).padStart(2,"0")} / ${String(cards.length).padStart(2,"0")}`;

}

}

cards.forEach((card,index)=>{

    card.addEventListener("click",()=>{

        active=index;

        updateCards();

    });

});

document.addEventListener("keydown",(e)=>{

    if(e.key==="ArrowRight"){

        active=(active+1)%cards.length;

        updateCards();

    }

    if(e.key==="ArrowLeft"){

        active=(active-1+cards.length)%cards.length;

        updateCards();

    }

});



let startX = 0;
let startY = 0;

const coverflow = document.querySelector(".coverflow");

if(coverflow){
    coverflow.addEventListener("touchstart",(e)=>{

        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;

    },{passive:true});

    coverflow.addEventListener("touchend",(e)=>{

        let endX = e.changedTouches[0].clientX;
        let endY = e.changedTouches[0].clientY;

        let deltaX = endX-startX;
        let deltaY = endY-startY;

        if(Math.abs(deltaY) > Math.abs(deltaX)) return;

        if(deltaX>60){

            active=(active-1+cards.length)%cards.length;
            updateCards();

        }

        if(deltaX<-60){

            active=(active+1)%cards.length;
            updateCards();

        }

    },{passive:true});
}

if(prevBtn){

    prevBtn.addEventListener("click",()=>{

        active=(active-1+cards.length)%cards.length;

        updateCards();

    });

}

if(nextBtn){

    nextBtn.addEventListener("click",()=>{

        active=(active+1)%cards.length;

        updateCards();

    });

}

function mobileView(){

    if(window.innerWidth>768) return;

    cards.forEach(card=>{

        card.className="certificate";
        card.style.display="block";

    });

}

window.addEventListener("resize",()=>{

    if(window.innerWidth<=768){

        mobileView();

    }else{

        updateCards();

    }

});

if(window.innerWidth<=768){

    mobileView();

}else{

    updateCards();

}

// ======================================================
// HEADER COLOR CHANGE
// ======================================================

const header=document.querySelector("header");

let lastScroll=0;

window.addEventListener("scroll",()=>{

    const current=window.pageYOffset;

    if(header){
        if(current>80){

            header.style.background="rgba(5,5,5,.88)";

        }else{

            header.style.background="rgba(5,5,5,.45)";

        }

        if(window.innerWidth<=768){

            if(current>lastScroll && current>120){

                header.classList.add("hide");

            }else{

                header.classList.remove("hide");

            }

        }
    }

    lastScroll=current;

});


// ======================================================
// PARALLAX HERO
// ======================================================

document.addEventListener("mousemove",(e)=>{

const hero=document.querySelector(".hero-content");

if(hero){
    const x=(window.innerWidth/2-e.clientX)/35;
    const y=(window.innerHeight/2-e.clientY)/35;
    hero.style.transform=`translate(${x}px,${y}px)`;
}

});

// ==========================================
// CERTIFICATE PREVIEW
// ==========================================

const preview=document.getElementById("certificatePreview");
const previewImg=document.getElementById("previewImage");
const closePreview=document.getElementById("closePreview");

document.querySelectorAll(".certificate").forEach(card=>{

    card.addEventListener("click",()=>{

        if(!card.classList.contains("active")) return;

        const img=card.querySelector("img");

        previewImg.src=img.src;

        preview.classList.add("active");

        document.body.style.overflow="hidden";
        document.body.classList.add("preview-open");

    });

});

function closeCertificate(){
    if(!preview) return;
    preview.classList.remove("active");

    document.body.style.overflow="";
    document.body.classList.remove("preview-open");

}

if(closePreview){
    closePreview.addEventListener("click",closeCertificate);
}

if(preview){
    preview.addEventListener("click",(e)=>{

        if(e.target===preview){

            closeCertificate();

        }

    });
}

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape" && preview && preview.classList.contains("active")){

        closeCertificate();

    }

});

// ==========================================
// RANDOM GLITCH EFFECT
// ==========================================

const floatingWords=document.querySelectorAll("#heroCyberOverlay span");

if(floatingWords.length > 0){
    setInterval(()=>{

        const word=floatingWords[Math.floor(Math.random()*floatingWords.length)];

        word.style.color="#ff2d2d";
        word.style.textShadow="0 0 18px #ff0000";
        word.style.transform="scale(1.25)";
        word.style.opacity=".9";

        setTimeout(()=>{

            word.style.color="";
            word.style.textShadow="";
            word.style.transform="";
            word.style.opacity=".28";

        },350);

    },1800);
}
// =========================================
// CINEMATIC BACKGROUND
// =========================================

const clips = document.querySelectorAll(".marvel-bg-clip");

if(clips.length){

    let current = 0;

    clips[current].classList.add("active");

    

}


window.addEventListener("message",(e)=>{

    if(e.data !== "INTRO_FINISHED") return;

    const loader = document.getElementById("loader");
    const page = document.getElementById("page");

    // Fade loader first
    loader.style.opacity = "0";

    // Fade page in slightly later
    setTimeout(() => {

        page.style.visibility = "visible";
        page.style.opacity = "1";

    },200);

    // Remove loader after fade
    setTimeout(() => {

        loader.remove();

    },1200);

});