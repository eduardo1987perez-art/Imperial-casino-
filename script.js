// --- ESTADO INICIAL ---
let balance = parseFloat(localStorage.getItem('imperial_balance')) || 100.00;
let isFlying = false;
let autoEnabled = false;
let multiplier = 1.00;
let crashPoint = 0;
let animationFrame;

const balText = document.getElementById('user-balance');
const multText = document.getElementById('mult-display');
const plane = document.getElementById('plane-wrapper');
const mainBtn = document.getElementById('main-btn');
const canvas = document.getElementById('line-canvas');
const ctx = canvas.getContext('2d');
const historyBar = document.getElementById('history');
const gameViewport = document.querySelector('.game-container');

function saveBalance() {
    localStorage.setItem('imperial_balance', balance.toFixed(2));
    balText.innerText = "$" + balance.toFixed(2);
}

function init() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    saveBalance();
}
window.onload = init;

// --- PROBABILIDAD (45% GANA / 55% PIERDE) ---
function getCrashPoint() {
    const suerte = Math.random() * 100;
    if (suerte <= 55) return 1.00 + (Math.random() * 0.60); // Casa gana
    let p = 1.61 + (Math.random() * 8.00);
    if (Math.random() < 0.10) p = 10.01 + (Math.random() * 40.00); // Dorado
    return p;
}

function handleInteraction() {
    if (!isFlying) {
        let bet = parseFloat(document.getElementById('bet-amount').value);
        if (isNaN(bet) || bet <= 0 || balance < bet) return alert("¡Saldo insuficiente, Imperial!");
        balance -= bet; saveBalance();
        startFlight();
    } else { cashOut(); }
}

function startFlight() {
    isFlying = true; multiplier = 1.00;
    crashPoint = getCrashPoint();
    gameViewport.style.boxShadow = "none";
    mainBtn.innerText = "COBRAR"; mainBtn.className = "btn-main btn-red";
    multText.style.color = "white";

    function frame() {
        if (!isFlying) return;
        multiplier += 0.008 * Math.pow(multiplier, 0.5);
        multText.innerText = multiplier.toFixed(2) + "x";

        // FRENO DE PANTALLA (No se sale después de 8x)
        let x = Math.min((multiplier - 1) * 12, 78); 
        let y = Math.min((multiplier - 1) * 10, 60);

        plane.style.left = (10 + x) + "%";
        plane.style.bottom = (20 + y) + "%";
        multText.style.left = (10 + x) + "%"; 
        multText.style.bottom = (35 + y) + "%";

        drawTrail(x, y);

        if (autoEnabled && multiplier >= parseFloat(document.getElementById('auto-cash-val').value)) cashOut();
        if (multiplier >= crashPoint) crash();
        else animationFrame = requestAnimationFrame(frame);
    }
    frame();
}

function drawTrail(x, y) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let sX = canvas.width * 0.1, sY = canvas.height * 0.8;
    let eX = canvas.width * (0.1 + x/100), eY = canvas.height * (0.8 - y/100);
    ctx.beginPath(); ctx.strokeStyle = "red"; ctx.lineWidth = 6;
    ctx.shadowBlur = 15; ctx.shadowColor = "red";
    ctx.moveTo(sX, sY); ctx.quadraticCurveTo(sX + (eX-sX)/2, sY, eX, eY);
    ctx.stroke();
}

function cashOut() {
    isFlying = false; cancelAnimationFrame(animationFrame);
    let bet = parseFloat(document.getElementById('bet-amount').value);
    let win = bet * multiplier;
    balance += win; saveBalance();

    if (multiplier >= 10) {
        gameViewport.style.boxShadow = "inset 0 0 60px #ffd700";
        alert("¡PREMIO DORADO IMPERIAL! 👑\nGanaste: $" + win.toFixed(2));
    } else { alert("¡Felicidades! Ganaste: $" + win.toFixed(2)); }
    
    addHist(multiplier); resetGame();
}

function crash() {
    isFlying = false; cancelAnimationFrame(animationFrame);
    multText.innerText = "¡SE FUE!"; multText.style.color = "red";
    const frases = ["¡Perdiste todo!", "¡La casa gana!", "¡Mala suerte!", "¡Aposta de nuevo!"];
    setTimeout(() => alert(frases[Math.floor(Math.random()*frases.length)]), 500);
    addHist(multiplier); saveBalance(); resetGame();
}

function addHist(v) {
    const s = document.createElement('span'); s.className = 'hist-item';
    s.innerText = 'x'+v.toFixed(2);
    s.style.color = v>=10 ? "#ffd700" : (v>=2 ? "#00d1ff" : "#999");
    historyBar.prepend(s);
}

function resetGame() {
    mainBtn.innerText = "APOSTAR"; mainBtn.className = "btn-main btn-green";
    setTimeout(() => {
        if (!isFlying) {
            multiplier = 1.00; multText.innerText = "1.00x";
            multText.style.left = "50%"; multText.style.bottom = "40%";
            plane.style.left = "10%"; plane.style.bottom = "20%";
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            gameViewport.style.boxShadow = "none";
        }
    }, 2500);
}

function toggleAuto() {
    autoEnabled = !autoEnabled;
    const b = document.getElementById('auto-btn');
    b.classList.toggle('active'); b.innerText = autoEnabled ? "AUTO: ON" : "AUTO: OFF";
}

function goToMenu() {
    // Si está volando, preguntar antes de salir para no perder la apuesta
    if (isFlying) {
        if (confirm("¡Vuelo en curso! Si sales perderás tu apuesta. ¿Seguro?")) {
            window.location.href = "menu.html";
        }
    } else {
        window.location.href = "menu.html";
    }
}

