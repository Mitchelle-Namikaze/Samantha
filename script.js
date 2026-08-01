const intro = document.getElementById("intro");
const app = document.getElementById("app");
const envelope = document.getElementById("openEnvelope");
const replayBtn = document.getElementById("replayBtn");
const bgMusic = document.getElementById("bgMusic");

const stepButtons = Array.from(document.querySelectorAll("[data-step-target]"));
const screens = Array.from(document.querySelectorAll(".screen"));
const dots = Array.from(document.querySelectorAll(".dot"));
const nextButtons = Array.from(document.querySelectorAll("[data-next-step]"));
const prevButtons = Array.from(document.querySelectorAll("[data-prev-step]"));
const photoCards = Array.from(document.querySelectorAll(".memory-card"));

const playlist = [
  "assets/song.mp4",
  "assets/song1.mp4",
  "assets/song2.mp4",
  "assets/song3.mp4",
  "assets/song4.mp4",
  "assets/song5.mp4"
];

let currentStep = 0;
let musicStarted = false;
let shuffledQueue = [];
let currentTrackIndex = -1;
let photoTimer = null;
let heartTimer = null;
let introOpen = false;
let photoIndex = 0;

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function nextTrack() {
  if (!shuffledQueue.length) {
    shuffledQueue = shuffle(playlist);
  }
  const source = shuffledQueue.shift();
  currentTrackIndex += 1;
  return source;
}

function prepareTrack() {
  if (!bgMusic) return;
  bgMusic.src = nextTrack();
  bgMusic.load();
}

async function startMusic() {
  if (!bgMusic) return;
  if (!musicStarted) {
    musicStarted = true;
    if (!bgMusic.src) prepareTrack();
  }

  try {
    await bgMusic.play();
  } catch (err) {
    // Browser playback policies can still block until the first user gesture resolves.
  }
}

bgMusic?.addEventListener("ended", () => {
  prepareTrack();
  bgMusic.play().catch(() => {});
});

function createHeart() {
  const heart = document.createElement("span");
  heart.className = "heart";
  const size = 8 + Math.random() * 18;
  heart.style.width = `${size}px`;
  heart.style.height = `${size}px`;
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.bottom = `-${20 + Math.random() * 20}px`;
  heart.style.opacity = `${0.35 + Math.random() * 0.55}`;
  heart.style.setProperty("--x", `${(Math.random() * 2 - 1) * 90}px`);
  heart.style.setProperty("--s", `${0.65 + Math.random() * 1.1}`);
  heart.style.animationDuration = `${8 + Math.random() * 8}s`;
  document.querySelector(".ambient")?.appendChild(heart);
  window.setTimeout(() => heart.remove(), 18000);
}

function startHearts(rate = 5) {
  stopHearts();
  heartTimer = window.setInterval(() => {
    const count = Math.random() < 0.72 ? 1 : 2;
    for (let i = 0; i < count; i += 1) createHeart();
  }, rate * 1000);
}

function stopHearts() {
  if (heartTimer) {
    clearInterval(heartTimer);
    heartTimer = null;
  }
}

function showStep(index) {
  currentStep = Math.max(0, Math.min(index, screens.length - 1));

  screens.forEach((screen, i) => {
    screen.classList.toggle("is-active", i === currentStep);
  });
  dots.forEach((dot, i) => {
    dot.classList.toggle("is-active", i === currentStep);
  });

  if (currentStep === 1) {
    startPhotoReel();
  } else {
    stopPhotoReel();
  }
}

function openApp() {
  if (introOpen) return;
  introOpen = true;

  envelope?.classList.add("is-open");
  startMusic();
  startHearts(3.4);

  window.setTimeout(() => {
    intro?.classList.add("is-hidden");
    app?.classList.add("is-visible");
    app?.setAttribute("aria-hidden", "false");
    showStep(0);
  }, 1100);
}

function startPhotoReel() {
  if (!photoCards.length) return;
  stopPhotoReel();
  photoIndex = 0;

  const revealNext = () => {
    photoCards.forEach((card, index) => {
      const isActive = index === photoIndex;
      card.classList.toggle("is-visible", isActive);
      card.style.transform = isActive ? "translateY(0) scale(1)" : "translateY(18px) scale(.985)";
      card.style.opacity = isActive ? "1" : "0";
    });
    photoIndex = (photoIndex + 1) % photoCards.length;
  };

  revealNext();
  photoTimer = window.setInterval(revealNext, 2300);
}

function stopPhotoReel() {
  if (photoTimer) {
    clearInterval(photoTimer);
    photoTimer = null;
  }
}

function init() {
  shuffledQueue = shuffle(playlist);
  prepareTrack();
  startHearts(6);

  envelope?.addEventListener("click", openApp, { once: true });

  replayBtn?.addEventListener("click", () => {
    if (!intro || !app) return;
    intro.classList.remove("is-hidden");
    app.classList.remove("is-visible");
    app.setAttribute("aria-hidden", "true");
    envelope?.classList.remove("is-open");
    introOpen = false;

    startHearts(6);
    showStep(0);
    stopPhotoReel();

    window.setTimeout(() => {
      intro.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  });

  stepButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = Number(btn.dataset.stepTarget);
      if (!Number.isNaN(target)) showStep(target);
    });
  });

  nextButtons.forEach(btn => {
    btn.addEventListener("click", () => showStep(currentStep + 1));
  });

  prevButtons.forEach(btn => {
    btn.addEventListener("click", () => showStep(currentStep - 1));
  });

  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      const target = Number(dot.dataset.stepTarget);
      if (!Number.isNaN(target)) showStep(target);
    });
  });

  window.addEventListener("keydown", (e) => {
    if (!app.classList.contains("is-visible")) return;
    if (e.key === "ArrowRight") showStep(currentStep + 1);
    if (e.key === "ArrowLeft") showStep(currentStep - 1);
    if (e.key === "Escape") openApp();
  });

  if (window.location.hash === "#app") {
    openApp();
  }
}

init();
