const loadingMessages = [
  'Initializing Friendship.exe...',
  'Collecting hugs...',
  'Finding happy memories...',
  'Planting tulips...',
  'Summoning smiles...'
];

const screens = document.querySelectorAll('.screen');
const loader = document.getElementById('loader');
const loadingFill = document.getElementById('loading-bar-fill');
const loadingMessage = document.getElementById('loading-message');
const startJourneyButton = document.getElementById('start-journey');
const speechBubble = document.getElementById('speech-bubble');
const mascot = document.getElementById('mascot-blob');
const letterButton = document.getElementById('open-envelope');
const letterContent = document.getElementById('letter-content');
const letterBody = document.getElementById('letter-body');
const letterNextButton = document.getElementById('letter-next-btn');
const achievement = document.getElementById('achievement');
const giftModal = document.getElementById('gift-modal');
const giftModalTitle = document.getElementById('gift-modal-title');
const giftModalCopy = document.getElementById('gift-modal-copy');
const closeGiftModal = document.getElementById('close-gift-modal');
const infiniteHug = document.getElementById('infinite-hug');
const nextSceneButtons = document.querySelectorAll('.next-scene');
const giftCards = document.querySelectorAll('.gift-card');
const memoryCards = document.querySelectorAll('.memory-card');
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let activeScreen = 'loader';
let messageIndex = 0;
let typingIndex = 0;
let showAchievementTimer;
let animationFrameId;
let audioContext;
let ambientGain;
let ambientOscillators = [];

const particleSets = {
  stars: [],
  petals: [],
  hearts: [],
  fireworks: []
};

function showScreen(id) {
  screens.forEach((screen) => screen.classList.toggle('active', screen.id === id));
  activeScreen = id;
}

function startAmbientMusic() {
  if (audioContext) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  audioContext = new AudioCtx();
  ambientGain = audioContext.createGain();
  ambientGain.gain.value = 0.0001;
  ambientGain.connect(audioContext.destination);

  const baseFrequencies = [220, 330, 440];
  baseFrequencies.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    oscillator.type = index % 2 === 0 ? 'sine' : 'triangle';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    gainNode.gain.value = 0.015;
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ambientGain);
    oscillator.start();
    ambientOscillators.push({ oscillator, gainNode, filter });
  });

  ambientGain.gain.linearRampToValueAtTime(0.04, audioContext.currentTime + 1.2);
}

function updateLoader() {
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 11 + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      loadingFill.style.width = '100%';
      loadingMessage.textContent = 'Softening the room...';
      setTimeout(() => showScreen('intro'), 850);
      return;
    }
    loadingFill.style.width = `${progress}%`;
    loadingMessage.textContent = loadingMessages[messageIndex % loadingMessages.length];
    messageIndex += 1;
  }, 280);
}

function typeLetter() {
  const letterText = `My Silly boy,\n\nI know things have been really hard lately. I can see how much you're carrying, even when you don't say it out loud. I wish I could take away every bit of your stress and replace it with peace, but until then, I'll stay right here beside you.\n\nYou don't have to pretend to be okay with me. You don't have to be strong every second or have everything figured out. It's okay to be tired. It's okay to have difficult days. And it's okay to lean on me whenever you need to.\n\nPlease don't forget how incredible you are. Even on the days when you doubt yourself, I never will. You are so much stronger than you realize, and I'm endlessly proud of you—not because you keep going, but simply because you're you.\n\nI hope you know that no matter how chaotic life gets, you will always have a safe place in my heart. I'll celebrate your happiest moments, and I'll sit quietly with you through the hardest ones. You never have to face anything alone.\n\nSo, take one deep breath at a time. Be gentle with yourself. Rest when you need to. And whenever you feel like the world is becoming too much, remember this:\n\nYou are loved more than words can ever express. You are enough, exactly as you are. And I believe, with all my heart, that brighter days are waiting for you.\n\nAnd I am not going to leave you.\n\nUntil then, let me hold hope for both of us.\n\nAlways yours,\n\nRutvi❤️`;
  letterBody.textContent = letterText;
}

function cycleMascotSpeech() {
  const phrases = [
    'You are loved, even on hard days.',
    'Breathe. I am still here.',
    'Your heart can rest a little.',
    'A soft day is still a worthy day.'
  ];
  let phraseIndex = 0;
  setInterval(() => {
    speechBubble.textContent = phrases[phraseIndex % phrases.length];
    phraseIndex += 1;
  }, 2600);
}

function attachSceneNavigation() {
  nextSceneButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.getAttribute('data-target');
      showScreen(target);
    });
  });
}

function showAchievement(message) {
  achievement.textContent = message;
  achievement.classList.add('show');
  clearTimeout(showAchievementTimer);
  showAchievementTimer = setTimeout(() => achievement.classList.remove('show'), 1800);
}

function createBurst(kind, count, x, y) {
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = 1.8 + Math.random() * 2.1;
    if (kind === 'petals') {
      particleSets.petals.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.8,
        size: 4 + Math.random() * 4,
        opacity: 0.8,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.12
      });
    } else if (kind === 'hearts') {
      particleSets.hearts.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.4,
        size: 6 + Math.random() * 4,
        opacity: 0.9,
        life: 1
      });
    } else {
      particleSets.stars.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.8,
        size: 2 + Math.random() * 3,
        opacity: 0.9,
        rotation: Math.random() * Math.PI * 2
      });
    }
  }
}

function createFireworks(count) {
  for (let i = 0; i < count; i += 1) {
    particleSets.fireworks.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight * 0.4 + 40,
      color: `hsla(${Math.random() * 360}, 100%, 70%, 1)`,
      particles: Array.from({ length: 20 }, () => ({
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        life: 1
      }))
    });
  }
}

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const star of particleSets.stars) {
    star.x += star.vx;
    star.y += star.vy;
    star.vy += 0.005;
    star.opacity -= 0.008;
    if (star.opacity <= 0) continue;
    ctx.save();
    ctx.translate(star.x, star.y);
    ctx.rotate(star.rotation);
    ctx.fillStyle = `rgba(255, 232, 138, ${star.opacity})`;
    ctx.beginPath();
    ctx.moveTo(0, -star.size * 2);
    ctx.lineTo(star.size * 0.6, -star.size * 0.6);
    ctx.lineTo(star.size * 2, 0);
    ctx.lineTo(star.size * 0.6, star.size * 0.6);
    ctx.lineTo(0, star.size * 2);
    ctx.lineTo(-star.size * 0.6, star.size * 0.6);
    ctx.lineTo(-star.size * 2, 0);
    ctx.lineTo(-star.size * 0.6, -star.size * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  particleSets.stars = particleSets.stars.filter((item) => item.opacity > 0);

  for (const petal of particleSets.petals) {
    petal.x += petal.vx;
    petal.y += petal.vy;
    petal.vy += 0.01;
    petal.rotation += petal.spin;
    petal.opacity -= 0.008;
    if (petal.opacity <= 0) continue;
    ctx.save();
    ctx.translate(petal.x, petal.y);
    ctx.rotate(petal.rotation);
    ctx.fillStyle = `rgba(255, 144, 197, ${petal.opacity})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, petal.size * 1.2, petal.size, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  particleSets.petals = particleSets.petals.filter((item) => item.opacity > 0);

  for (const heart of particleSets.hearts) {
    heart.x += heart.vx;
    heart.y += heart.vy;
    heart.vy += 0.01;
    heart.life -= 0.008;
    if (heart.life <= 0) continue;
    ctx.save();
    ctx.translate(heart.x, heart.y);
    ctx.scale(heart.size / 8, heart.size / 8);
    ctx.fillStyle = `rgba(255, 118, 173, ${heart.life})`;
    ctx.beginPath();
    ctx.moveTo(0, 4);
    ctx.bezierCurveTo(0, 0, 5, -2, 6, 2);
    ctx.bezierCurveTo(8, 6, 5, 8, 0, 12);
    ctx.bezierCurveTo(-5, 8, -8, 6, -6, 2);
    ctx.bezierCurveTo(-5, -2, 0, 0, 0, 4);
    ctx.fill();
    ctx.restore();
  }
  particleSets.hearts = particleSets.hearts.filter((item) => item.life > 0);

  for (const firework of particleSets.fireworks) {
    firework.particles.forEach((particle) => {
      particle.vx *= 0.97;
      particle.vy *= 0.97;
      particle.vy += 0.004;
      particle.life -= 0.008;
      ctx.save();
      ctx.globalAlpha = particle.life;
      ctx.fillStyle = firework.color;
      ctx.fillRect(firework.x + particle.vx * 6, firework.y + particle.vy * 6, 3, 3);
      ctx.restore();
    });
    firework.particles = firework.particles.filter((particle) => particle.life > 0);
  }
  particleSets.fireworks = particleSets.fireworks.filter((firework) => firework.particles.length > 0);
}

function animate() {
  drawParticles();
  animationFrameId = window.requestAnimationFrame(animate);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function trackCursor() {
  document.addEventListener('mousemove', (event) => {
    const x = event.clientX;
    const y = event.clientY;
    if (mascot) {
      mascot.style.transform = `translate(${(x / window.innerWidth - 0.5) * 12}px, ${(y / window.innerHeight - 0.5) * 10}px)`;
    }
    if (Math.random() > 0.92) {
      createBurst('stars', 3, x, y);
    }
  });
}

function attachGiftModal() {
  giftCards.forEach((card) => {
    card.addEventListener('click', () => {
      giftModalTitle.textContent = card.getAttribute('data-title');
      giftModalCopy.textContent = card.getAttribute('data-copy');
      giftModal.classList.add('active');
    });
  });

  closeGiftModal.addEventListener('click', () => {
    giftModal.classList.remove('active');
  });

  giftModal.addEventListener('click', (event) => {
    if (event.target === giftModal) {
      giftModal.classList.remove('active');
    }
  });
}

function attachMemoryFlips() {
  memoryCards.forEach((card) => {
    card.addEventListener('click', () => card.classList.toggle('flipped'));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        card.classList.toggle('flipped');
      }
    });
  });
}

function makeDoubleClickFireworks() {
  document.addEventListener('dblclick', () => {
    createFireworks(12);
    showAchievement('Sparkle burst unlocked');
  });
}

function attachInfiniteHug() {
  infiniteHug.addEventListener('click', () => {
    for (let i = 0; i < 1200; i += 1) {
      const kind = i % 3 === 0 ? 'hearts' : i % 3 === 1 ? 'petals' : 'stars';
      createBurst(kind, 1, Math.random() * window.innerWidth, Math.random() * window.innerHeight * 0.6);
    }
    createFireworks(24);
    showAchievement('Infinite hug received');
  });
}

function init() {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  document.addEventListener('pointerdown', startAmbientMusic, { once: true });
  updateLoader();
  startJourneyButton.addEventListener('click', () => {
    startAmbientMusic();
    showScreen('mascot');
  });
  letterButton.addEventListener('click', () => {
    if (letterButton.classList.contains('opened')) return;
    letterButton.classList.add('opened');
    letterContent.classList.add('revealed');
    letterNextButton.hidden = false;
    letterNextButton.classList.add('visible');
    typeLetter();
  });
  attachSceneNavigation();
  attachMemoryFlips();
  attachGiftModal();
  cycleMascotSpeech();
  trackCursor();
  makeDoubleClickFireworks();
  attachInfiniteHug();
  animate();
}

init();
