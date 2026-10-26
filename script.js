/**
 * Romantic Interactive Birthday Website for Mansi 💗
 * From Kevin With Endless Love
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     1. ROMANTIC MUSIC PLAYER & SOUND EFFECTS
        Song: "Channa Ve - Bhoot (Karaoke Version)" (kV5tb0ftlQE)
        Fallback: Romantic Web Audio API Music Box Chimes
     ============================================================ */
  const YOUTUBE_VIDEO_ID = 'kV5tb0ftlQE'; // Channa Ve (Karaoke Version)
  let ytPlayer = null;
  let isYtReady = false;
  let isMusicPlaying = false;
  let userWantsMusic = false;
  let activeAudioMode = 'none'; // 'youtube' | 'local' | 'synth'
  let audioCtx = null;
  let musicTimer = null;

  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const bgMusicAudio = document.getElementById('bgMusic');

  // Initialize YouTube IFrame Player
  function setupYouTubePlayer() {
    const initPlayer = () => {
      if (ytPlayer || !document.getElementById('ytPlayer') || typeof window.YT === 'undefined' || !window.YT.Player) return;
      try {
        ytPlayer = new window.YT.Player('ytPlayer', {
          height: '200',
          width: '200',
          videoId: YOUTUBE_VIDEO_ID,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            fs: 0,
            iv_load_policy: 3,
            loop: 1,
            playlist: YOUTUBE_VIDEO_ID, // Required for loop in YouTube iframe API
            modestbranding: 1,
            playsinline: 1,
            rel: 0
          },
          events: {
            onReady: (event) => {
              isYtReady = true;
              try {
                event.target.setVolume(85);
              } catch (e) {}
              if (userWantsMusic && !isMusicPlaying) {
                startMusicPlayback();
              }
            },
            onStateChange: (event) => {
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED, 3 = BUFFERING
              if (event.data === 1) {
                isMusicPlaying = true;
                activeAudioMode = 'youtube';
                updateMusicButtonUI(true);
              } else if (event.data === 2) {
                if (activeAudioMode === 'youtube') {
                  isMusicPlaying = false;
                  updateMusicButtonUI(false);
                }
              } else if (event.data === 0) {
                if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
                  ytPlayer.playVideo();
                }
              }
            },
            onError: (event) => {
              console.warn('YouTube player error:', event.data, 'falling back to romantic synthesizer');
              if (userWantsMusic) {
                playSynthesizedFallback();
              }
            }
          }
        });
      } catch (err) {
        console.warn('Could not initialize YouTube Player:', err);
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const prevOnReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = function() {
        if (typeof prevOnReady === 'function') prevOnReady();
        initPlayer();
      };
    }
  }

  setupYouTubePlayer();

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function startMusicPlayback() {
    userWantsMusic = true;
    initAudioContext();

    // 1. Try local audio file first if provided
    if (bgMusicAudio && bgMusicAudio.getAttribute('src') && bgMusicAudio.getAttribute('src').trim() !== '') {
      bgMusicAudio.play().then(() => {
        isMusicPlaying = true;
        activeAudioMode = 'local';
        updateMusicButtonUI(true);
      }).catch(() => {
        playYouTubeOrFallback();
      });
      return;
    }

    playYouTubeOrFallback();
  }

  function playYouTubeOrFallback() {
    if (isYtReady && ytPlayer && typeof ytPlayer.playVideo === 'function') {
      try {
        ytPlayer.playVideo();
        activeAudioMode = 'youtube';
        isMusicPlaying = true;
        updateMusicButtonUI(true);
        return;
      } catch (e) {
        console.warn('ytPlayer.playVideo failed:', e);
      }
    }

    // If YouTube is still initializing, indicate connecting and timeout to fallback
    if (!isYtReady) {
      updateMusicButtonUI(true, 'Connecting 🎵...');
      setTimeout(() => {
        if (userWantsMusic && !isMusicPlaying) {
          playSynthesizedFallback();
        }
      }, 2600);
      return;
    }

    playSynthesizedFallback();
  }

  function playSynthesizedFallback() {
    activeAudioMode = 'synth';
    isMusicPlaying = true;
    startSynthesizedMelody();
    updateMusicButtonUI(true);
  }

  function stopMusicPlayback() {
    userWantsMusic = false;
    isMusicPlaying = false;

    if (ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
      try {
        ytPlayer.pauseVideo();
      } catch (e) {}
    }

    if (bgMusicAudio && !bgMusicAudio.paused) {
      bgMusicAudio.pause();
    }

    stopSynthesizedMelody();
    activeAudioMode = 'none';
    updateMusicButtonUI(false);
  }

  function toggleMusicPlayback() {
    if (!isMusicPlaying && !userWantsMusic) {
      startMusicPlayback();
    } else {
      stopMusicPlayback();
    }
  }

  // Romantic gentle music-box notes (Hz)
  const MUSIC_BOX_NOTES = [
    523.25, // C5
    659.25, // E5
    783.99, // G5
    1046.50, // C6
    587.33, // D5
    698.46, // F5
    880.00, // A5
    659.25, // E5
    783.99, // G5
    523.25, // C5
    440.00, // A4
    523.25, // C5
    659.25, // E5
    587.33, // D5
    783.99  // G5
  ];

  let currentNoteIdx = 0;

  function playMusicBoxChime(freq, duration = 1.2, volume = 0.08) {
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio error handled silently
    }
  }

  function startSynthesizedMelody() {
    if (!audioCtx) initAudioContext();
    if (!audioCtx) return;

    if (musicTimer) clearInterval(musicTimer);

    // Play initial note
    playMusicBoxChime(MUSIC_BOX_NOTES[currentNoteIdx]);
    currentNoteIdx = (currentNoteIdx + 1) % MUSIC_BOX_NOTES.length;

    musicTimer = setInterval(() => {
      if (!isMusicPlaying) return;
      playMusicBoxChime(MUSIC_BOX_NOTES[currentNoteIdx], 1.5, 0.09);
      if (currentNoteIdx % 3 === 0) {
        setTimeout(() => {
          if (isMusicPlaying) {
            playMusicBoxChime(MUSIC_BOX_NOTES[(currentNoteIdx + 2) % MUSIC_BOX_NOTES.length] * 0.5, 1.8, 0.04);
          }
        }, 180);
      }
      currentNoteIdx = (currentNoteIdx + 1) % MUSIC_BOX_NOTES.length;
    }, 450);
  }

  function stopSynthesizedMelody() {
    if (musicTimer) {
      clearInterval(musicTimer);
      musicTimer = null;
    }
  }

  // Sound effects
  function playPuffSound() {
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(280, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {}
  }

  function playSparkleSound() {
    if (!audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      [880, 1174.66, 1396.91, 1760].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.04, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    } catch (e) {}
  }

  // Music toggle button click listener
  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', () => {
      toggleMusicPlayback();
    });
  }

  function updateMusicButtonUI(playing, customText) {
    if (!musicToggleBtn) return;
    const label = musicToggleBtn.querySelector('.music-label');
    if (playing) {
      musicToggleBtn.classList.add('is-playing');
      musicToggleBtn.setAttribute('title', 'Playing: Channa Ve (Bhoot) - Click to Pause');
      if (label) {
        label.textContent = customText || 'Channa Ve 💗';
      }
    } else {
      musicToggleBtn.classList.remove('is-playing');
      musicToggleBtn.setAttribute('title', 'Play Channa Ve (Bhoot)');
      if (label) {
        label.textContent = 'Channa Ve: Off';
      }
    }
  }

  /* ============================================================
     2. FLOATING BACKGROUND HEARTS & SPARKLES CANVAS
     ============================================================ */
  const canvas = document.getElementById('heartsCanvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const symbols = ['♡', '♥', '✨', '🌸', '💗'];
    const colors = ['#F8BBD0', '#FFD6E7', '#F48FB1', '#E75480', '#FFE5D9'];
    const particles = [];
    const maxParticles = window.innerWidth < 768 ? 22 : 40;

    class FloatingHeart {
      constructor() {
        this.reset(true);
      }
      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : height + 20;
        this.size = Math.random() * 16 + 12;
        this.speedY = Math.random() * 0.8 + 0.4;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.symbol = symbols[Math.floor(Math.random() * symbols.length)];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.angle = Math.random() * Math.PI * 2;
        this.angularSpeed = (Math.random() - 0.5) * 0.02;
      }
      update() {
        this.y -= this.speedY;
        this.x += Math.sin(this.angle) * 0.6 + this.speedX;
        this.angle += this.angularSpeed;

        if (this.y < -30) {
          this.reset();
        }
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.font = `${this.size}px 'DM Sans', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.symbol, this.x, this.y);
        ctx.restore();
      }
    }

    for (let i = 0; i < maxParticles; i++) {
      particles.push(new FloatingHeart());
    }

    function animateHearts() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animateHearts);
    }
    animateHearts();
  }

  /* ============================================================
     3. CANDLE TAP INTERACTION & UNLOCK LOGIC
     ============================================================ */
  const candleBtns = [
    document.getElementById('candleBtn1'),
    document.getElementById('candleBtn2'),
    document.getElementById('candleBtn3')
  ];
  const candlesCountDisplay = document.getElementById('candlesExtinguishedCount');
  const instructionText = document.getElementById('instructionText');
  const wishInstructionBox = document.getElementById('wishInstructionBox');
  const unlockContainer = document.getElementById('unlockContainer');
  const cakeTapHint = document.getElementById('cakeTapHint');
  const unlockSurpriseBtn = document.getElementById('unlockSurpriseBtn');
  const scrollLockedToast = document.getElementById('scrollLockedToast');

  let extinguishedCandles = new Set();
  let isScrollLocked = true;
  let toastTimer = null;

  /* ============================================================
     SCROLL LOCK SYSTEM (DO NOT SCROLL UNTIL ALL 3 CANDLES ARE BLOWN)
     ============================================================ */
  function lockPageScroll() {
    isScrollLocked = true;
    document.documentElement.classList.add('initial-lock');
    document.body.classList.add('initial-lock');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }

  function unlockPageScroll() {
    isScrollLocked = false;
    document.documentElement.classList.remove('initial-lock');
    document.body.classList.remove('initial-lock');
  }

  function showLockedScrollHint() {
    if (!isScrollLocked) return;

    // Shake instruction box to draw visual attention to candles
    if (wishInstructionBox) {
      wishInstructionBox.classList.remove('shake-hint');
      void wishInstructionBox.offsetWidth; // Force CSS reflow
      wishInstructionBox.classList.add('shake-hint');
    }

    // Show floating reminder toast
    if (scrollLockedToast) {
      scrollLockedToast.classList.add('is-active');
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        scrollLockedToast.classList.remove('is-active');
      }, 2500);
    }
  }

  // Intercept wheel / trackpad scrolling while locked
  window.addEventListener('wheel', (e) => {
    if (isScrollLocked) {
      e.preventDefault();
      showLockedScrollHint();
    }
  }, { passive: false });

  // Intercept touch swiping on mobile / tablet devices while locked
  window.addEventListener('touchmove', (e) => {
    if (isScrollLocked) {
      e.preventDefault();
      showLockedScrollHint();
    }
  }, { passive: false });

  // Intercept keyboard scrolling keys while locked
  const SCROLL_KEYS = ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ', 'Spacebar'];
  window.addEventListener('keydown', (e) => {
    if (isScrollLocked && SCROLL_KEYS.includes(e.key)) {
      // Allow spacebar if activating a candle button directly
      if (e.target && e.target.classList && e.target.classList.contains('candle-hitbox') && (e.key === ' ' || e.key === 'Spacebar')) {
        return;
      }
      e.preventDefault();
      showLockedScrollHint();
    }
  });

  // Secondary safety: keep scroll position locked at top
  window.addEventListener('scroll', () => {
    if (isScrollLocked && window.scrollY > 0) {
      window.scrollTo(0, 0);
    }
  });

  // Intercept header navigation link clicks while locked
  const headerNavLinks = document.querySelectorAll('.header-nav a');
  headerNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (isScrollLocked && href && href !== '#cakeSection') {
        e.preventDefault();
        showLockedScrollHint();
      }
    });
  });

  // Initialize locked state and prevent browser scroll restoration
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);
  lockPageScroll();

  candleBtns.forEach((btn, index) => {
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      initAudioContext();

      // If already blown, do nothing
      if (extinguishedCandles.has(index)) return;

      // Extinguish this candle
      extinguishedCandles.add(index);
      btn.classList.add('is-extinguished');
      btn.setAttribute('aria-pressed', 'true');

      // Visual and auditory feedback
      playPuffSound();
      burstCandleParticles(btn);

      // Update count
      const count = extinguishedCandles.size;
      if (candlesCountDisplay) {
        candlesCountDisplay.textContent = count;
      }

      // Check if all 3 are extinguished
      if (count === 3) {
        handleAllCandlesExtinguished();
      }
    });

    // Keyboard support (Enter / Space)
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  function burstCandleParticles(candleBtn) {
    if (prefersReducedMotion) return;
    const rect = candleBtn.getBoundingClientRect();
    const spawnX = rect.left + rect.width / 2;
    const spawnY = rect.top + 20;

    for (let i = 0; i < 8; i++) {
      const heart = document.createElement('div');
      heart.textContent = Math.random() > 0.5 ? '💗' : '✨';
      heart.style.position = 'fixed';
      heart.style.left = `${spawnX}px`;
      heart.style.top = `${spawnY}px`;
      heart.style.fontSize = `${Math.random() * 12 + 10}px`;
      heart.style.pointerEvents = 'none';
      heart.style.zIndex = '9999';
      heart.style.transition = 'all 0.9s cubic-bezier(0.25, 1, 0.5, 1)';
      document.body.appendChild(heart);

      const destX = spawnX + (Math.random() - 0.5) * 90;
      const destY = spawnY - Math.random() * 70 - 20;

      requestAnimationFrame(() => {
        heart.style.transform = `translate(${destX - spawnX}px, ${destY - spawnY}px) scale(0.6)`;
        heart.style.opacity = '0';
      });

      setTimeout(() => {
        heart.remove();
      }, 950);
    }
  }

  function handleAllCandlesExtinguished() {
    playSparkleSound();

    // Auto-start "Channa Ve" romantic song for birthday celebration!
    if (!isMusicPlaying) {
      startMusicPlayback();
    }

    // 1. Display: "Yayyy, birthday wish time, Mansi! 💗"
    if (instructionText) {
      instructionText.textContent = "Yayyy, birthday wish time, Mansi! 💗";
      instructionText.style.color = "var(--deep-pink)";
    }

    if (cakeTapHint) {
      cakeTapHint.style.opacity = "0";
      setTimeout(() => { cakeTapHint.style.display = "none"; }, 300);
    }

    // 2. Trigger subtle pink heart-confetti animation
    triggerRomanticConfetti();

    // 3. Reveal glowing button: "Open Your Birthday Surprise 💌"
    if (unlockContainer) {
      unlockContainer.classList.add('is-unlocked');
    }

    // 4. UNLOCK SCROLLING (now all 3 candles are blown!)
    unlockPageScroll();
  }

  // Smooth scroll button
  if (unlockSurpriseBtn) {
    unlockSurpriseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('welcomeSection');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  /* ============================================================
     4. ROMANTIC CONFETTI EFFECT
     ============================================================ */
  function triggerRomanticConfetti(count = 45) {
    if (prefersReducedMotion) return;

    const shapes = ['💗', '♡', '🌸', '✨', '💕', '🎀'];
    const colors = ['#F48FB1', '#FFD6E7', '#F8BBD0', '#E75480', '#EDE7F6'];

    for (let i = 0; i < count; i++) {
      const confetti = document.createElement('div');
      const isEmoji = Math.random() > 0.35;
      
      if (isEmoji) {
        confetti.textContent = shapes[Math.floor(Math.random() * shapes.length)];
        confetti.style.fontSize = `${Math.random() * 16 + 12}px`;
      } else {
        confetti.style.width = `${Math.random() * 10 + 6}px`;
        confetti.style.height = `${Math.random() * 10 + 6}px`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '3px';
      }

      confetti.style.position = 'fixed';
      confetti.style.left = `${Math.random() * 96 + 2}vw`;
      confetti.style.top = '-20px';
      confetti.style.zIndex = '9999';
      confetti.style.pointerEvents = 'none';
      confetti.style.transition = `transform ${Math.random() * 2 + 2}s cubic-bezier(0.25, 1, 0.5, 1), opacity ${Math.random() * 2 + 2}s ease`;
      
      document.body.appendChild(confetti);

      const driftX = (Math.random() - 0.5) * 200;
      const targetY = window.innerHeight + 50;
      const rotate = (Math.random() - 0.5) * 720;

      setTimeout(() => {
        confetti.style.transform = `translate(${driftX}px, ${targetY}px) rotate(${rotate}deg)`;
        confetti.style.opacity = '0';
      }, 50);

      setTimeout(() => {
        confetti.remove();
      }, 4200);
    }
  }

  /* ============================================================
     5. INTERACTIVE ENVELOPE & LOVE LETTER TOGGLE
     ============================================================ */
  const envelopeBox = document.getElementById('envelopeBox');
  const parchmentLetter = document.getElementById('parchmentLetter');
  const envelopePrompt = document.getElementById('envelopePrompt');

  if (envelopeBox && parchmentLetter) {
    function toggleEnvelope() {
      initAudioContext();
      const isOpen = envelopeBox.classList.contains('is-open');

      if (!isOpen) {
        // Open envelope
        envelopeBox.classList.add('is-open');
        envelopeBox.setAttribute('aria-expanded', 'true');
        parchmentLetter.classList.add('is-visible');
        if (envelopePrompt) {
          envelopePrompt.innerHTML = '<span>Letter opened with love ♡</span>';
        }

        playSparkleSound();
        triggerRomanticConfetti(20);

        // Smoothly scroll letter into comfortable reading view
        setTimeout(() => {
          parchmentLetter.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 300);
      } else {
        // Close envelope
        envelopeBox.classList.remove('is-open');
        envelopeBox.setAttribute('aria-expanded', 'false');
        parchmentLetter.classList.remove('is-visible');
        if (envelopePrompt) {
          envelopePrompt.innerHTML = '<span>Tap to open your letter ✉️</span>';
        }
      }
    }

    envelopeBox.addEventListener('click', toggleEnvelope);
    envelopeBox.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleEnvelope();
      }
    });
  }

  /* ============================================================
     6. FINAL SURPRISE SECTION INTERACTION
     ============================================================ */
  const moreLoveBtn = document.getElementById('moreLoveBtn');
  const finalLoveReveal = document.getElementById('finalLoveReveal');
  const relightCakeBtn = document.getElementById('relightCakeBtn');

  if (moreLoveBtn && finalLoveReveal) {
    moreLoveBtn.addEventListener('click', () => {
      initAudioContext();
      playSparkleSound();
      triggerRomanticConfetti(55);

      finalLoveReveal.classList.add('is-active');
      moreLoveBtn.style.display = 'none';

      // Gentle scroll to revealed message
      setTimeout(() => {
        finalLoveReveal.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 250);
    });
  }

  // Relight cake interaction
  if (relightCakeBtn) {
    relightCakeBtn.addEventListener('click', () => {
      extinguishedCandles.clear();
      candleBtns.forEach(btn => {
        if (btn) {
          btn.classList.remove('is-extinguished');
          btn.setAttribute('aria-pressed', 'false');
        }
      });

      if (candlesCountDisplay) {
        candlesCountDisplay.textContent = '0';
      }

      if (instructionText) {
        instructionText.textContent = 'Tap all 3 candles to make your birthday wish ✨';
        instructionText.style.color = 'var(--text-dark)';
      }

      if (unlockContainer) {
        unlockContainer.classList.remove('is-unlocked');
      }

      if (cakeTapHint) {
        cakeTapHint.style.display = 'block';
        cakeTapHint.style.opacity = '1';
      }

      if (moreLoveBtn) {
        moreLoveBtn.style.display = 'inline-flex';
      }
      if (finalLoveReveal) {
        finalLoveReveal.classList.remove('is-active');
      }

      // Smooth scroll back to cake
      const cakeSection = document.getElementById('cakeSection');
      if (cakeSection) {
        cakeSection.scrollIntoView({ behavior: 'smooth' });
      }

      // Re-lock scrolling once back at the top
      setTimeout(() => {
        lockPageScroll();
      }, 700);
    });
  }

  /* ============================================================
     7. STAGGERED SCROLL ENTRANCE ANIMATIONS
     ============================================================ */
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    const animatedElements = document.querySelectorAll('.letter-card, .romantic-glass-card, .surprise-content-box');
    animatedElements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = `opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1) ${index * 0.08}s, transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) ${index * 0.08}s`;
      observer.observe(el);
    });
  }

});
