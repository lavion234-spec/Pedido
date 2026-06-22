const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const introCard = document.getElementById('introCard');
const celebrationSection = document.getElementById('celebrationSection');
const audioToggle = document.getElementById('audioToggle');
const canvas = document.getElementById('celebrationCanvas');
const ctx = canvas.getContext('2d');

let canvasWidth = 0;
let canvasHeight = 0;
let fireworks = [];
let confetti = [];
let hearts = [];
let particles = [];
let bgAudio = null;
let isAudioOn = false;
let moveAllowed = true;

function setCanvasSize() {
  canvasWidth = window.innerWidth * devicePixelRatio;
  canvasHeight = window.innerHeight * devicePixelRatio;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function moveNoButton() {
  if (!moveAllowed) return;
  const buttonRect = noBtn.getBoundingClientRect();
  const safeMargin = 24;
  const maxWidth = window.innerWidth - buttonRect.width - safeMargin;
  const maxHeight = window.innerHeight - buttonRect.height - safeMargin;
  const yesRect = yesBtn.getBoundingClientRect();

  let nextLeft = randomBetween(safeMargin, maxWidth);
  let nextTop = randomBetween(safeMargin, maxHeight);

  const distanceFromYes = Math.hypot(
    nextLeft - yesRect.left,
    nextTop - yesRect.top
  );

  if (distanceFromYes < 180) {
    nextLeft = clamp(nextLeft + 220, safeMargin, maxWidth);
    nextTop = clamp(nextTop + 120, safeMargin, maxHeight);
  }

  noBtn.style.transition = 'transform 0.22s ease, left 0.22s ease, top 0.22s ease';
  noBtn.style.position = 'fixed';
  noBtn.style.left = `${nextLeft}px`;
  noBtn.style.top = `${nextTop}px`;
}

function handlePointerAway(event) {
  const rect = noBtn.getBoundingClientRect();
  const pointerX = event.clientX ?? (event.touches && event.touches[0]?.clientX);
  const pointerY = event.clientY ?? (event.touches && event.touches[0]?.clientY);
  if (pointerX === undefined || pointerY === undefined) return;

  const horizontalDist = Math.abs(pointerX - (rect.left + rect.width / 2));
  const verticalDist = Math.abs(pointerY - (rect.top + rect.height / 2));
  const distance = Math.hypot(horizontalDist, verticalDist);
  const safetyDistance = Math.max(90, rect.width * 0.9);

  if (distance < safetyDistance) {
    moveNoButton();
  }
}

function preventNoButtonPress(event) {
  event.preventDefault();
  event.stopPropagation();
  moveNoButton();
}

function attachNoButtonEvents() {
  noBtn.addEventListener('pointerenter', moveNoButton, { passive: true });
  noBtn.addEventListener('pointermove', moveNoButton, { passive: true });
  noBtn.addEventListener('click', preventNoButtonPress);
  noBtn.addEventListener('touchstart', preventNoButtonPress, { passive: false });
  noBtn.addEventListener('touchmove', preventNoButtonPress, { passive: false });
  document.addEventListener('pointermove', handlePointerAway, { passive: true });
  document.addEventListener('touchmove', handlePointerAway, { passive: true });
}

function showCelebration() {
  introCard.style.display = 'none';
  celebrationSection.classList.remove('hidden');
  setCanvasSize();
  createCelebrationParticles();
  requestAnimationFrame(animateCelebration);
  playBackgroundAudio();
  isAudioOn = true;
  audioToggle.textContent = 'Desligar música';
}

function playBackgroundAudio() {
  if (!bgAudio) {
    bgAudio = document.getElementById('bgAudio');
  }
  if (!bgAudio) return;
  bgAudio.currentTime = 0;
  const playPromise = bgAudio.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(() => {
      // autoplay may be blocked until user interacts; the button still works after interaction
    });
  }
}

function pauseBackgroundAudio() {
  if (!bgAudio) {
    bgAudio = document.getElementById('bgAudio');
  }
  if (!bgAudio) return;
  bgAudio.pause();
}

function createCelebrationParticles() {
  fireworks = Array.from({ length: 5 }, () => createFirework());
  confetti = Array.from({ length: 60 }, () => createConfetto());
  hearts = Array.from({ length: 12 }, () => createHeartParticle());
  particles = Array.from({ length: 24 }, () => createGlowParticle());
}

function createFirework() {
  return {
    x: randomBetween(0.15, 0.85) * canvasWidth,
    y: canvasHeight + 10,
    targetY: randomBetween(0.25, 0.55) * canvasHeight,
    speed: randomBetween(12, 18),
    exploded: false,
    fragments: [],
    color: `hsl(${randomBetween(320, 360)}, 90%, 65%)`
  };
}

function createConfetto() {
  return {
    x: randomBetween(0, canvasWidth),
    y: randomBetween(-canvasHeight, 0),
    size: randomBetween(8, 14),
    rotation: randomBetween(0, Math.PI * 2),
    speedY: randomBetween(2, 5),
    speedX: randomBetween(-0.7, 0.7),
    color: `hsl(${randomBetween(330, 20)}, 85%, 65%)`
  };
}

function createHeartParticle() {
  return {
    x: randomBetween(0.05, 0.95) * canvasWidth,
    y: randomBetween(canvasHeight * 0.6, canvasHeight),
    size: randomBetween(16, 34),
    speed: randomBetween(0.5, 1.3),
    drift: randomBetween(-0.2, 0.2),
    alpha: randomBetween(0.45, 0.9)
  };
}

function createGlowParticle() {
  return {
    x: randomBetween(0, canvasWidth),
    y: randomBetween(0, canvasHeight),
    radius: randomBetween(2.2, 4.5),
    alpha: randomBetween(0.12, 0.28),
    pulse: randomBetween(0.01, 0.04),
    phase: randomBetween(0, Math.PI * 2)
  };
}

function drawFirework(firework) {
  if (!firework.exploded) {
    firework.y -= firework.speed;
    ctx.beginPath();
    ctx.moveTo(firework.x, firework.y + 16);
    ctx.lineTo(firework.x, firework.y + 32);
    ctx.strokeStyle = '#ffd9e6';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(firework.x, firework.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = firework.color;
    ctx.fill();
    if (firework.y <= firework.targetY) {
      firework.exploded = true;
      firework.fragments = Array.from({ length: 24 }, () => ({
        x: firework.x,
        y: firework.y,
        vx: randomBetween(-4.5, 4.5),
        vy: randomBetween(-6.5, 1.2),
        life: randomBetween(24, 38),
        hue: randomBetween(330, 360)
      }));
    }
  } else {
    firework.fragments.forEach(fragment => {
      fragment.vy += 0.12;
      fragment.x += fragment.vx;
      fragment.y += fragment.vy;
      fragment.life -= 1;
      ctx.beginPath();
      ctx.arc(fragment.x, fragment.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${fragment.hue}, 95%, 72%, ${fragment.life / 38})`;
      ctx.fill();
    });
    firework.fragments = firework.fragments.filter(p => p.life > 0);
    if (firework.fragments.length === 0) {
      Object.assign(firework, createFirework());
    }
  }
}

function drawConfetti(confetto) {
  confetto.x += confetto.speedX;
  confetto.y += confetto.speedY;
  confetto.rotation += 0.13;
  if (confetto.y > canvasHeight + 24) {
    Object.assign(confetto, createConfetto());
    confetto.y = -confetto.size - 10;
  }
  ctx.save();
  ctx.translate(confetto.x, confetto.y);
  ctx.rotate(confetto.rotation);
  ctx.fillStyle = confetto.color;
  ctx.fillRect(-confetto.size / 2, -confetto.size / 2, confetto.size, confetto.size * 0.5);
  ctx.restore();
}

function drawHeart(heart) {
  heart.y -= heart.speed;
  heart.x += heart.drift;
  heart.alpha = 0.55 + Math.sin(performance.now() * 0.002 + heart.size) * 0.18;
  if (heart.y < -40) {
    Object.assign(heart, createHeartParticle());
    heart.y = canvasHeight + 10;
  }
  const x = heart.x;
  const y = heart.y;
  const size = heart.size;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(-9, -12, -18, 5, 0, 17);
  ctx.bezierCurveTo(18, 5, 9, -12, 0, 0);
  ctx.fillStyle = `rgba(255, 117, 162, ${heart.alpha})`;
  ctx.fill();
  ctx.restore();
}

function drawGlow(glow) {
  glow.phase += glow.pulse;
  const radius = glow.radius + Math.sin(glow.phase) * 1.6;
  ctx.beginPath();
  ctx.arc(glow.x, glow.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 255, 255, ${glow.alpha})`;
  ctx.fill();
}

function animateCelebration() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  ctx.globalCompositeOperation = 'lighter';
  fireworks.forEach(drawFirework);
  confetti.forEach(drawConfetti);
  hearts.forEach(drawHeart);
  particles.forEach(drawGlow);
  ctx.globalCompositeOperation = 'source-over';
  requestAnimationFrame(animateCelebration);
}

function toggleAudio() {
  isAudioOn = !isAudioOn;
  if (isAudioOn) {
    playBackgroundAudio();
    audioToggle.textContent = 'Desligar música';
  } else {
    pauseBackgroundAudio();
    audioToggle.textContent = 'Ligar música';
  }
}

function preventScrollDuringTouch(event) {
  if (event.target === noBtn) {
    event.preventDefault();
  }
}

window.addEventListener('resize', setCanvasSize);
window.addEventListener('orientationchange', () => {
  setTimeout(setCanvasSize, 120);
});

yesBtn.addEventListener('click', showCelebration);
audioToggle.addEventListener('click', toggleAudio);
window.addEventListener('touchmove', preventScrollDuringTouch, { passive: false });

attachNoButtonEvents();
setCanvasSize();

// place the "Não" button into a good starting position on load
moveNoButton();
