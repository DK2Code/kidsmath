/* ============================================================
   NUMLAND - Main Application JavaScript
   ============================================================ */

'use strict';

// ============================================================
// NAVIGATION
// ============================================================
const initNav = () => {
  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.nav-mobile');

  // Scroll effect
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  // Mobile menu toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close on link click
    mobileMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
  }

  // Active link detection
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
};

// ============================================================
// SCROLL REVEAL ANIMATIONS
// ============================================================
const initScrollReveal = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
};

// ============================================================
// PROGRESS & LOCAL STORAGE
// ============================================================
const Progress = {
  KEY: 'numland_progress',

  get() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || {
        stars: 0,
        level1: { completed: [], score: 0 },
        level2: { completed: [], score: 0 },
        level3: { completed: [], score: 0 },
        level4: { completed: [], score: 0 },
        badges: [],
        activitiesCompleted: 0,
        gamesPlayed: 0,
      };
    } catch { return {}; }
  },

  save(data) {
    try { localStorage.setItem(this.KEY, JSON.stringify(data)); } catch {}
  },

  addStars(n) {
    const data = this.get();
    data.stars = (data.stars || 0) + n;
    data.activitiesCompleted = (data.activitiesCompleted || 0) + 1;
    this.save(data);
    this.updateStarDisplays(data.stars);
    this.checkBadges(data);
    return data.stars;
  },

  updateStarDisplays(stars) {
    document.querySelectorAll('[data-star-count]').forEach(el => {
      el.textContent = stars;
    });
  },

  checkBadges(data) {
    const earned = [];
    if (data.stars >= 1 && !data.badges.includes('first_star')) earned.push('first_star');
    if (data.stars >= 10 && !data.badges.includes('star_collector')) earned.push('star_collector');
    if (data.stars >= 50 && !data.badges.includes('star_master')) earned.push('star_master');
    if (data.activitiesCompleted >= 5 && !data.badges.includes('explorer')) earned.push('explorer');
    if (data.activitiesCompleted >= 20 && !data.badges.includes('adventurer')) earned.push('adventurer');

    earned.forEach(badge => {
      data.badges.push(badge);
      this.showBadgeEarned(badge);
    });

    if (earned.length) this.save(data);
  },

  showBadgeEarned(badgeId) {
    const badges = {
      first_star: { icon: '⭐', name: 'First Star!' },
      star_collector: { icon: '🌟', name: 'Star Collector!' },
      star_master: { icon: '✨', name: 'Star Master!' },
      explorer: { icon: '🔭', name: 'Explorer!' },
      adventurer: { icon: '🧭', name: 'Adventurer!' },
    };
    const b = badges[badgeId];
    if (b) showToast(`${b.icon} Badge Earned: ${b.name}`, 'success');
  },
};

// ============================================================
// CONFETTI CELEBRATION
// ============================================================
const launchConfetti = (count = 60) => {
  let container = document.getElementById('confetti-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'confetti-container';
    document.body.appendChild(container);
  }
  container.innerHTML = '';

  const colors = ['#FFD93D', '#FF6B6B', '#6BCB77', '#4D96FF', '#C77DFF', '#FF9E4F', '#FF8FAB'];
  const shapes = ['●', '■', '▲', '◆', '★'];

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.textContent = shapes[Math.floor(Math.random() * shapes.length)];
    piece.style.cssText = `
      left: ${Math.random() * 100}%;
      top: -30px;
      color: ${colors[Math.floor(Math.random() * colors.length)]};
      font-size: ${8 + Math.random() * 14}px;
      animation-delay: ${Math.random() * 1.5}s;
      animation-duration: ${2 + Math.random() * 2}s;
    `;
    container.appendChild(piece);
  }

  setTimeout(() => { container.innerHTML = ''; }, 5000);
};

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
const showToast = (message, type = 'success', duration = 3000) => {
  let toastWrap = document.getElementById('toast-wrap');
  if (!toastWrap) {
    toastWrap = document.createElement('div');
    toastWrap.id = 'toast-wrap';
    toastWrap.style.cssText = `
      position: fixed; bottom: 24px; right: 24px; z-index: 999;
      display: flex; flex-direction: column; gap: 8px;
      pointer-events: none;
    `;
    document.body.appendChild(toastWrap);
  }

  const toast = document.createElement('div');
  const colors = {
    success: { bg: '#6BCB77', border: '#3DA84B' },
    error: { bg: '#FF6B6B', border: '#E84040' },
    info: { bg: '#4D96FF', border: '#1A6FD4' },
  };
  const c = colors[type] || colors.success;

  toast.style.cssText = `
    background: ${c.bg}; border: 2px solid ${c.border};
    color: white; padding: 12px 20px; border-radius: 50px;
    font-family: 'Nunito', sans-serif; font-weight: 700; font-size: 0.95rem;
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    animation: fadeSlideIn 0.3s ease;
    pointer-events: none;
  `;
  toast.textContent = message;
  toastWrap.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

// ============================================================
// CELEBRATION EFFECT
// ============================================================
const celebrate = (message = '🎉 Amazing!') => {
  launchConfetti(80);
  showToast(message, 'success', 3000);
  playSound('success');
};

const gentleEncourage = (message = '😊 Try again — you\'re learning!') => {
  showToast(message, 'error', 2500);
  playSound('try');
};

// ============================================================
// SIMPLE AUDIO FEEDBACK (Web Audio API)
// ============================================================
let audioCtx = null;

const getAudioCtx = () => {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
  }
  return audioCtx;
};

const playTone = (frequency, duration = 0.2, type = 'sine', volume = 0.3) => {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch {}
};

const playSound = (type) => {
  switch (type) {
    case 'click':
      playTone(880, 0.08, 'square', 0.1);
      break;
    case 'correct':
      playTone(523, 0.12); // C5
      setTimeout(() => playTone(659, 0.12), 120); // E5
      setTimeout(() => playTone(784, 0.2), 240);  // G5
      break;
    case 'success':
      playTone(523, 0.1);
      setTimeout(() => playTone(659, 0.1), 100);
      setTimeout(() => playTone(784, 0.1), 200);
      setTimeout(() => playTone(1047, 0.3), 300);
      break;
    case 'try':
      playTone(392, 0.15, 'square', 0.15); // G4
      setTimeout(() => playTone(349, 0.25, 'square', 0.12), 150);
      break;
    case 'count':
      playTone(440 + Math.random() * 200, 0.1, 'sine', 0.15);
      break;
    case 'select':
      playTone(660, 0.08, 'sine', 0.12);
      break;
    case 'complete':
      [523, 659, 784, 1047, 1319].forEach((f, i) => {
        setTimeout(() => playTone(f, 0.15), i * 80);
      });
      break;
  }
};

// ============================================================
// ACTIVITY TAB SWITCHER
// ============================================================
const initActivityTabs = () => {
  const tabs = document.querySelectorAll('.activity-tab');
  const panels = document.querySelectorAll('.activity-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const panel = document.getElementById(target);
      if (panel) panel.classList.add('active');

      playSound('click');
    });
  });
};

// ============================================================
// COUNTING ACTIVITY
// ============================================================
const initCountingActivity = (containerId, total, emoji = '⭐') => {
  const container = document.getElementById(containerId);
  if (!container) return;

  const area = container.querySelector('.counting-area');
  const numDisplay = container.querySelector('.count-number');
  const resetBtn = container.querySelector('.reset-btn');

  let counted = 0;
  area.innerHTML = '';

  for (let i = 0; i < total; i++) {
    const obj = document.createElement('div');
    obj.className = 'count-obj';
    obj.textContent = emoji;
    obj.setAttribute('aria-label', `Item ${i + 1}`);
    obj.addEventListener('click', function () {
      if (this.classList.contains('counted')) return;
      this.classList.add('counted');
      counted++;
      numDisplay.textContent = counted;
      numDisplay.classList.remove('update');
      void numDisplay.offsetWidth;
      numDisplay.classList.add('update');
      playSound('count');
      if (counted === total) {
        setTimeout(() => {
          celebrate(`🎉 You counted ${total}! Fantastic!`);
          Progress.addStars(1);
        }, 300);
      }
    });
    area.appendChild(obj);
  }

  if (numDisplay) numDisplay.textContent = '0';

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      counted = 0;
      numDisplay.textContent = '0';
      area.querySelectorAll('.count-obj').forEach(o => o.classList.remove('counted'));
      playSound('click');
    });
  }
};

// ============================================================
// NUMBER MATCHING GAME
// ============================================================
const initNumberMatch = (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const emojis = ['🍎', '🐝', '🌟', '🐱', '🦋', '🌈', '🍕', '🎈', '🌺', '🐠'];

  let selectedNum = null;
  let matched = 0;
  const total = 5;
  const chosen = numbers.slice(0, total);

  const shuffled = [...chosen].sort(() => Math.random() - 0.5);
  const shuffledItems = [...chosen].sort(() => Math.random() - 0.5);

  // Accept both class-based and id-based columns so Level 1 markup stays compatible.
  const numCol = container.querySelector('.match-numbers') || container.querySelector('#match-numbers');
  const itemCol = container.querySelector('.match-items') || container.querySelector('#match-items');
  const feedback = container.querySelector('.feedback') || document.getElementById('matching-feedback');

  if (!numCol || !itemCol) return;

  numCol.innerHTML = '';
  itemCol.innerHTML = '';

  shuffled.forEach(n => {
    const el = document.createElement('div');
    el.className = 'match-item';
    el.dataset.value = n;
    el.dataset.type = 'num';
    const span = document.createElement('span');
    span.className = 'match-number';
    span.textContent = n;
    el.appendChild(span);
    el.addEventListener('click', () => handleMatchClick(el, 'num', n));
    numCol.appendChild(el);
  });

  shuffledItems.forEach(n => {
    const el = document.createElement('div');
    el.className = 'match-item';
    el.dataset.value = n;
    el.dataset.type = 'item';
    el.style.flexWrap = 'wrap';
    el.style.gap = '4px';
    for (let i = 0; i < n; i++) {
      const dot = document.createElement('span');
      dot.style.cssText = 'font-size:1.2rem;';
      dot.textContent = emojis[n - 1];
      el.appendChild(dot);
    }
    el.addEventListener('click', () => handleMatchClick(el, 'item', n));
    itemCol.appendChild(el);
  });

  let selectedItem = null;

  function handleMatchClick(el, type, value) {
    if (el.classList.contains('matched')) return;
    playSound('select');

    if (type === 'num') {
      container.querySelectorAll('.match-item[data-type="num"]').forEach(e => e.classList.remove('selected'));
      el.classList.add('selected');
      selectedNum = { el, value };
    } else {
      selectedItem = { el, value };
    }

    if (selectedNum && selectedItem) {
      if (selectedNum.value === selectedItem.value) {
        selectedNum.el.classList.remove('selected');
        selectedNum.el.classList.add('matched');
        selectedItem.el.classList.add('matched');
        matched++;
        playSound('correct');
        if (feedback) {
          feedback.className = 'feedback show success';
          feedback.innerHTML = '<span class="feedback-icon">🌟</span> Great match! Keep going!';
        }
        if (matched === total) {
          setTimeout(() => {
            celebrate('🎉 All matched! You\'re amazing!');
            Progress.addStars(2);
          }, 400);
        }
      } else {
        const wrongNumEl = selectedNum.el;
        const wrongItemEl = selectedItem.el;
        wrongNumEl.classList.remove('selected');
        wrongNumEl.classList.add('wrong');
        wrongItemEl.classList.add('wrong');
        setTimeout(() => {
          wrongNumEl.classList.remove('wrong');
          wrongItemEl.classList.remove('wrong');
        }, 600);
        if (feedback) {
          feedback.className = 'feedback show error';
          feedback.innerHTML = '<span class="feedback-icon">😊</span> Try again, you\'re learning!';
        }
        gentleEncourage();
      }
      selectedNum = null;
      selectedItem = null;

      setTimeout(() => {
        if (feedback) feedback.className = 'feedback';
      }, 2000);
    }
  }
};

// ============================================================
// BEAD COUNTER
// ============================================================
const initBeadCounter = (containerId, rodConfig) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  const rodsArea = container.querySelector('.bead-rods');
  const totalDisplay = container.querySelector('.bead-total');
  if (!rodsArea) return;

  rodsArea.innerHTML = '';
  let grandTotal = 0;

  rodConfig.forEach((rod, ri) => {
    const rodDiv = document.createElement('div');
    rodDiv.className = 'bead-rod';

    const line = document.createElement('div');
    line.className = 'bead-rod-line';
    rodDiv.appendChild(line);

    const label = document.createElement('span');
    label.textContent = `Rod ${ri + 1}:`;
    label.style.cssText = 'font-family: var(--font-fun); font-weight:700; font-size:0.85rem; color: var(--text-light); margin-right:8px; position:relative; z-index:1;';
    rodDiv.appendChild(label);

    let rodCount = 0;

    for (let i = 0; i < rod.count; i++) {
      const bead = document.createElement('div');
      bead.className = `bead inactive`;
      bead.dataset.index = i;
      bead.dataset.rod = ri;
      bead.addEventListener('click', function () {
        const idx = parseInt(this.dataset.index);
        // Toggle sequentially from left
        const beads = rodDiv.querySelectorAll('.bead');
        let active = 0;
        beads.forEach(b => { if (!b.classList.contains('inactive')) active++; });

        if (idx < active) {
          // deactivate from right to this
          for (let j = active - 1; j >= idx; j--) {
            beads[j].className = 'bead inactive';
            rodCount--;
            grandTotal--;
          }
        } else {
          // activate up to this
          for (let j = active; j <= idx; j++) {
            beads[j].className = `bead active ${rod.color}`;
            rodCount++;
            grandTotal++;
          }
        }
        if (totalDisplay) totalDisplay.textContent = grandTotal;
        playSound('count');
      });
      rodDiv.appendChild(bead);
    }

    const countSpan = document.createElement('span');
    countSpan.style.cssText = 'font-family: var(--font-display); font-size:1.4rem; color:var(--text-dark); margin-left:8px; position:relative; z-index:1; min-width:28px; text-align:right;';
    countSpan.textContent = '0';

    // Watch clicks and update span
    rodDiv.addEventListener('click', () => {
      setTimeout(() => {
        const active = rodDiv.querySelectorAll('.bead:not(.inactive)').length;
        countSpan.textContent = active;
      }, 0);
    });

    rodDiv.appendChild(countSpan);
    rodsArea.appendChild(rodDiv);
  });
};

// ============================================================
// ADDITION VISUAL ACTIVITY
// ============================================================
const initAdditionActivity = (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  const emojis = ['🍎', '🍊', '🍋', '🍇', '🍓', '🥝', '🍑', '🍒'];
  const newProblemBtn = container.querySelector('.new-problem-btn');
  const checkBtn = container.querySelector('.check-btn');
  const input = container.querySelector('.math-input');
  const feedback = container.querySelector('.feedback');
  const group1 = container.querySelector('.math-group-1');
  const group2 = container.querySelector('.math-group-2');
  const numA = container.querySelector('.num-a');
  const numB = container.querySelector('.num-b');

  let currentAnswer = 0;
  let emoji = '';

  const generateProblem = () => {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 5) + 1;
    currentAnswer = a + b;
    emoji = emojis[Math.floor(Math.random() * emojis.length)];

    if (group1) {
      group1.innerHTML = '';
      for (let i = 0; i < a; i++) {
        const el = document.createElement('span');
        el.className = 'math-object';
        el.textContent = emoji;
        el.style.animationDelay = `${i * 0.1}s`;
        group1.appendChild(el);
      }
    }

    if (group2) {
      group2.innerHTML = '';
      for (let i = 0; i < b; i++) {
        const el = document.createElement('span');
        el.className = 'math-object';
        el.textContent = emoji;
        el.style.animationDelay = `${i * 0.1}s`;
        group2.appendChild(el);
      }
    }

    if (numA) numA.textContent = a;
    if (numB) numB.textContent = b;
    if (input) { input.value = ''; input.className = 'math-input'; }
    if (feedback) feedback.className = 'feedback';
  };

  if (checkBtn && input) {
    checkBtn.addEventListener('click', () => {
      const val = parseInt(input.value);
      if (isNaN(val)) {
        showToast('Type a number in the box!', 'info');
        return;
      }
      if (val === currentAnswer) {
        input.className = 'math-input correct';
        feedback.className = 'feedback show success';
        feedback.innerHTML = `<span class="feedback-icon">🌟</span> Correct! ${currentAnswer} is right!`;
        playSound('correct');
        Progress.addStars(1);
        setTimeout(() => launchConfetti(40), 300);
      } else {
        input.className = 'math-input wrong';
        feedback.className = 'feedback show error';
        feedback.innerHTML = `<span class="feedback-icon">😊</span> Try again — count all the ${emoji}!`;
        gentleEncourage();
      }
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') checkBtn.click();
    });
  }

  if (newProblemBtn) {
    newProblemBtn.addEventListener('click', () => {
      generateProblem();
      playSound('click');
    });
  }

  generateProblem();
};

// ============================================================
// PATTERN RECOGNITION GAME
// ============================================================
const initPatternGame = (containerId) => {
  const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  if (!container) return;

  const patterns = [
    { sequence: ['🔴', '🔵', '🔴', '🔵', '❓', '🔵'], answer: '🔴' },
    { sequence: ['⭐', '🌙', '⭐', '🌙', '⭐', '❓'], answer: '🌙' },
    { sequence: ['🐱', '🐶', '🐱', '❓', '🐱', '🐶'], answer: '🐶' },
    { sequence: ['🔺', '🔺', '⬛', '🔺', '🔺', '❓'], answer: '⬛' },
    { sequence: ['🌺', '🍀', '🌺', '🍀', '❓', '🍀'], answer: '🌺' },
  ];

  let current = null;
  let blankIdx = null;
  const display = container.querySelector('#pattern-display') || container.querySelector('.pattern-row');
  const choices = container.querySelector('#pattern-choices') || container.querySelector('.pattern-choices');
  const feedback = container.querySelector('.feedback');
  const nextBtn = container.querySelector('.next-pattern-btn');

  const loadPattern = () => {
    current = patterns[Math.floor(Math.random() * patterns.length)];
    blankIdx = current.sequence.indexOf('❓');
    const answer = current.answer;

    if (display) {
      display.innerHTML = '';
      current.sequence.forEach((item, i) => {
        const el = document.createElement('div');
        el.className = 'pattern-item' + (item === '❓' ? ' pattern-blank' : '');
        el.textContent = item === '❓' ? '?' : item;
        if (item === '❓') {
          el.title = 'What comes here?';
        }
        display.appendChild(el);
      });
    }

    if (choices) {
      choices.innerHTML = '';
      // Create wrong choices
      const allEmojis = ['🔴', '🔵', '⭐', '🌙', '🐱', '🐶', '🔺', '⬛', '🌺', '🍀'];
      const wrong = allEmojis.filter(e => e !== answer).sort(() => Math.random() - 0.5).slice(0, 3);
      const opts = [...wrong, answer].sort(() => Math.random() - 0.5);

      opts.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'btn btn-secondary';
        btn.style.fontSize = '1.5rem';
        btn.style.padding = '12px 20px';
        btn.textContent = opt;
        btn.addEventListener('click', () => {
          if (opt === answer) {
            // Update the blank
            if (display && display.children[blankIdx]) {
              display.children[blankIdx].textContent = answer;
              display.children[blankIdx].classList.remove('pattern-blank');
            }
            if (feedback) {
              feedback.className = 'feedback show success';
              feedback.innerHTML = '<span class="feedback-icon">🌟</span> Perfect pattern! You\'re a pattern expert!';
            }
            playSound('correct');
            Progress.addStars(1);
          } else {
            btn.style.background = 'var(--coral-light)';
            if (feedback) {
              feedback.className = 'feedback show error';
              feedback.innerHTML = '<span class="feedback-icon">😊</span> Look at the pattern carefully — try again!';
            }
            gentleEncourage();
            setTimeout(() => { btn.style.background = ''; }, 600);
          }
        });
        choices.appendChild(btn);
      });
    }

    if (feedback) feedback.className = 'feedback';
  };

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      loadPattern();
      playSound('click');
    });
  }

  loadPattern();
};

// ============================================================
// NUMBER TRACING (Canvas)
// ============================================================
const initNumberTracing = (canvasId, number) => {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let drawing = false;
  let strokes = 0;

  const guide = canvas.parentElement.querySelector('.trace-guide');
  if (guide) guide.textContent = number;

  ctx.strokeStyle = '#4D96FF';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  canvas.addEventListener('mousedown', (e) => { drawing = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); playSound('select'); });
  canvas.addEventListener('mousemove', (e) => { if (!drawing) return; const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); });
  canvas.addEventListener('mouseup', () => { drawing = false; strokes++; if (strokes === 1) showToast('Great tracing! Keep going!', 'success'); });
  canvas.addEventListener('touchstart', (e) => { e.preventDefault(); drawing = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); }, { passive: false });
  canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (!drawing) return; const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); }, { passive: false });
  canvas.addEventListener('touchend', () => { drawing = false; });

  // Clear button
  const clearBtn = canvas.closest('.activity-card')?.querySelector('.clear-trace-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      strokes = 0;
      playSound('click');
    });
  }
};

// ============================================================
// PLACE VALUE BUILDER
// ============================================================
const initPlaceValueBuilder = (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  const hundredsEl = container.querySelector('.pv-hundreds-count');
  const tensEl = container.querySelector('.pv-tens-count');
  const onesEl = container.querySelector('.pv-ones-count');
  const totalEl = container.querySelector('.pv-total');
  const hundredsBlocks = container.querySelector('.pv-hundreds-blocks');
  const tensBlocks = container.querySelector('.pv-tens-blocks');
  const onesBlocks = container.querySelector('.pv-ones-blocks');

  let h = 0, t = 0, o = 0;

  const updateDisplay = () => {
    if (hundredsEl) hundredsEl.textContent = h;
    if (tensEl) tensEl.textContent = t;
    if (onesEl) onesEl.textContent = o;
    const total = h * 100 + t * 10 + o;
    if (totalEl) totalEl.textContent = total;

    if (hundredsBlocks) {
      hundredsBlocks.innerHTML = '';
      for (let i = 0; i < h; i++) {
        const b = document.createElement('div');
        b.className = 'pv-block hundreds blue';
        hundredsBlocks.appendChild(b);
      }
    }

    if (tensBlocks) {
      tensBlocks.innerHTML = '';
      for (let i = 0; i < t; i++) {
        const b = document.createElement('div');
        b.className = 'pv-block tens green';
        tensBlocks.appendChild(b);
      }
    }

    if (onesBlocks) {
      onesBlocks.innerHTML = '';
      for (let i = 0; i < o; i++) {
        const b = document.createElement('div');
        b.className = 'pv-block ones coral';
        onesBlocks.appendChild(b);
      }
    }
  };

  container.querySelectorAll('.pv-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      const action = btn.dataset.action;
      playSound('count');

      if (type === 'hundreds') {
        if (action === 'add' && h < 9) h++;
        if (action === 'sub' && h > 0) h--;
      } else if (type === 'tens') {
        if (action === 'add' && t < 9) t++;
        if (action === 'sub' && t > 0) t--;
      } else if (type === 'ones') {
        if (action === 'add' && o < 9) o++;
        if (action === 'sub' && o > 0) o--;
      }

      updateDisplay();
    });
  });

  updateDisplay();
};

// ============================================================
// SKIP COUNTING ACTIVITY
// ============================================================
const initSkipCounting = (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  const skipByBtns = container.querySelectorAll('.skip-by-btn');
  const display = container.querySelector('.skip-count-display');
  let skipBy = 2;
  let max = 30;

  const render = () => {
    if (!display) return;
    display.innerHTML = '';
    for (let i = 0; i <= max; i++) {
      const el = document.createElement('div');
      el.className = 'skip-num' + (i % skipBy === 0 && i > 0 ? ' highlighted' : '');
      el.textContent = i;
      display.appendChild(el);
    }
  };

  skipByBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      skipBy = parseInt(btn.dataset.skip);
      skipByBtns.forEach(b => b.classList.toggle('active', b === btn));
      render();
      playSound('click');
    });
  });

  render();
};

// ============================================================
// FRACTION ACTIVITY
// ============================================================
const initFractionActivity = (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  const items = container.querySelectorAll('.frac-item');
  const info = container.querySelector('.frac-info');

  const fractions = {
    'half': { label: '1/2', desc: 'One half — 2 equal parts', color: '#FF6B6B' },
    'third': { label: '1/3', desc: 'One third — 3 equal parts', color: '#4D96FF' },
    'quarter': { label: '1/4', desc: 'One quarter — 4 equal parts', color: '#6BCB77' },
    'whole': { label: '1 Whole', desc: 'One whole — not divided', color: '#FFD93D' },
  };

  items.forEach(item => {
    item.addEventListener('click', () => {
      const type = item.dataset.fraction;
      const f = fractions[type];
      if (f && info) {
        info.innerHTML = `<strong style="color:${f.color};font-size:1.4rem;">${f.label}</strong><br>${f.desc}`;
        info.style.animation = 'none';
        void info.offsetWidth;
        info.style.animation = 'fadeSlideIn 0.3s ease';
      }
      items.forEach(i => i.style.transform = '');
      item.style.transform = 'scale(1.1)';
      playSound('correct');
    });
  });
};

// ============================================================
// MULTIPLICATION GRID
// ============================================================
const initMultiplicationGrid = (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  const size = 10;
  const grid = container.querySelector('.mult-grid');
  if (!grid) return;

  grid.innerHTML = '';
  grid.style.cssText = `display:grid;grid-template-columns:repeat(${size + 1},1fr);gap:3px;max-width:600px;margin:0 auto;`;

  for (let r = 0; r <= size; r++) {
    for (let c = 0; c <= size; c++) {
      const cell = document.createElement('div');
      cell.style.cssText = 'padding:6px 2px;text-align:center;border-radius:6px;font-family:var(--font-fun);font-weight:700;font-size:0.8rem;cursor:pointer;transition:all 0.2s;';

      if (r === 0 && c === 0) {
        cell.textContent = '×';
        cell.style.background = 'var(--yellow)';
        cell.style.color = 'var(--text-dark)';
      } else if (r === 0) {
        cell.textContent = c;
        cell.style.background = 'var(--blue-light)';
        cell.style.color = 'var(--blue-dark)';
        cell.dataset.col = c;
      } else if (c === 0) {
        cell.textContent = r;
        cell.style.background = 'var(--green-light)';
        cell.style.color = 'var(--green-dark)';
        cell.dataset.row = r;
      } else {
        cell.textContent = r * c;
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.style.background = 'white';
        cell.style.border = '1px solid #eee';

        cell.addEventListener('mouseenter', () => {
          grid.querySelectorAll(`[data-row="${r}"]`).forEach(e => e.style.background = 'var(--yellow-light)');
          grid.querySelectorAll(`[data-col="${c}"]`).forEach(e => e.style.background = 'var(--yellow-light)');
          cell.style.background = 'var(--yellow)';
          cell.style.transform = 'scale(1.15)';
          cell.style.zIndex = '1';
        });

        cell.addEventListener('mouseleave', () => {
          grid.querySelectorAll('[data-row]').forEach(e => {
            if (e.dataset.row && !e.dataset.col) e.style.background = 'var(--green-light)';
            else if (!e.dataset.row && e.dataset.col) e.style.background = 'var(--blue-light)';
            else e.style.background = 'white';
          });
          cell.style.transform = '';
          cell.style.zIndex = '';
        });
      }

      grid.appendChild(cell);
    }
  }
};

// ============================================================
// CLOCK ACTIVITY
// ============================================================
const initClockActivity = (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  const canvas = container.querySelector('.clock-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = cx - 10;

  let hour = Math.floor(Math.random() * 12) + 1;
  let minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];

  const drawClock = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Face
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF8F0';
    ctx.fill();
    ctx.strokeStyle = '#FFD93D';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Numbers
    ctx.fillStyle = '#3D2C1E';
    ctx.font = `bold 16px Nunito, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let n = 1; n <= 12; n++) {
      const angle = (n / 12) * Math.PI * 2 - Math.PI / 2;
      ctx.fillText(n, cx + (r - 24) * Math.cos(angle), cy + (r - 24) * Math.sin(angle));
    }

    // Hour ticks
    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
      const len = i % 5 === 0 ? 12 : 6;
      ctx.beginPath();
      ctx.moveTo(cx + (r - 8) * Math.cos(angle), cy + (r - 8) * Math.sin(angle));
      ctx.lineTo(cx + (r - 8 - len) * Math.cos(angle), cy + (r - 8 - len) * Math.sin(angle));
      ctx.strokeStyle = i % 5 === 0 ? '#5C4A35' : '#C8B8A8';
      ctx.lineWidth = i % 5 === 0 ? 2.5 : 1;
      ctx.stroke();
    }

    // Hour hand
    const hourAngle = ((hour % 12 + minute / 60) / 12) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + (r * 0.55) * Math.cos(hourAngle), cy + (r * 0.55) * Math.sin(hourAngle));
    ctx.strokeStyle = '#3D2C1E';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Minute hand
    const minAngle = (minute / 60) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + (r * 0.8) * Math.cos(minAngle), cy + (r * 0.8) * Math.sin(minAngle));
    ctx.strokeStyle = '#FF6B6B';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD93D';
    ctx.fill();
    ctx.strokeStyle = '#F5B900';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  drawClock();

  const question = container.querySelector('.clock-question');
  const hoursInput = container.querySelector('.clock-hours');
  const minutesInput = container.querySelector('.clock-minutes');
  const checkBtn = container.querySelector('.check-clock-btn');
  const newBtn = container.querySelector('.new-clock-btn');
  const feedback = container.querySelector('.feedback');

  const setQuestion = () => {
    if (question) question.textContent = `What time does the clock show?`;
    if (hoursInput) hoursInput.value = '';
    if (minutesInput) minutesInput.value = '';
    if (feedback) feedback.className = 'feedback';
  };

  if (checkBtn) {
    checkBtn.addEventListener('click', () => {
      const h = parseInt(hoursInput?.value);
      const m = parseInt(minutesInput?.value);
      if (h === hour && m === minute) {
        if (feedback) {
          feedback.className = 'feedback show success';
          feedback.innerHTML = `<span class="feedback-icon">⏰</span> Yes! It's ${hour}:${String(minute).padStart(2,'0')}!`;
        }
        playSound('correct');
        Progress.addStars(1);
      } else {
        if (feedback) {
          feedback.className = 'feedback show error';
          feedback.innerHTML = `<span class="feedback-icon">😊</span> Look at the short hand (hours) and long hand (minutes)!`;
        }
        gentleEncourage();
      }
    });
  }

  if (newBtn) {
    newBtn.addEventListener('click', () => {
      hour = Math.floor(Math.random() * 12) + 1;
      minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
      drawClock();
      setQuestion();
      playSound('click');
    });
  }

  setQuestion();
};

// ============================================================
// GEOMETRY EXPLORER
// ============================================================
const initGeometryExplorer = (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  const shapes = container.querySelectorAll('.geo-shape');
  const infoBox = container.querySelector('.geo-info');

  const shapeData = {
    circle: { name: 'Circle', sides: 0, desc: 'A perfectly round shape with no corners. Like a wheel or the sun!', emoji: '⭕' },
    triangle: { name: 'Triangle', sides: 3, desc: 'A shape with 3 sides and 3 corners. Like a slice of pizza!', emoji: '🔺' },
    square: { name: 'Square', sides: 4, desc: 'A shape with 4 equal sides. Like a chessboard tile!', emoji: '⬛' },
    rectangle: { name: 'Rectangle', sides: 4, desc: 'A shape with 4 sides — two long and two short. Like a door!', emoji: '▬' },
    pentagon: { name: 'Pentagon', sides: 5, desc: 'A shape with 5 sides. Like a home plate in baseball!', emoji: '⬠' },
    hexagon: { name: 'Hexagon', sides: 6, desc: 'A shape with 6 sides. Like a honeycomb cell!', emoji: '⬡' },
  };

  shapes.forEach(shape => {
    shape.addEventListener('click', () => {
      const type = shape.dataset.shape;
      const data = shapeData[type];
      if (data && infoBox) {
        infoBox.innerHTML = `
          <div style="font-size:3rem;margin-bottom:8px;">${data.emoji}</div>
          <strong style="font-family:var(--font-display);font-size:1.4rem;color:var(--text-dark);">${data.name}</strong>
          <div style="color:var(--blue);font-weight:700;margin:6px 0;">${data.sides === 0 ? 'No sides' : `${data.sides} sides`}</div>
          <p style="font-size:0.9rem;color:var(--text-body);">${data.desc}</p>
        `;
        infoBox.style.animation = 'none';
        void infoBox.offsetWidth;
        infoBox.style.animation = 'fadeSlideIn 0.3s ease';
      }
      shapes.forEach(s => s.classList.remove('selected'));
      shape.classList.add('selected');
      playSound('select');
    });
  });
};

// ============================================================
// COMPARISON GAME (More, Less, Equal)
// ============================================================
const initComparisonGame = (containerId) => {
  const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  if (!container) return;

  const left = container.querySelector('#compare-left') || container.querySelector('.compare-left');
  const right = container.querySelector('#compare-right') || container.querySelector('.compare-right');
  const feedback = container.querySelector('.feedback');
  const btns = container.querySelectorAll('.compare-btn');
  const newBtn = container.querySelector('.new-compare-btn');

  let a = 0, b = 0;
  const emoji = '🍎';

  const generatePair = () => {
    a = Math.floor(Math.random() * 9) + 1;
    b = Math.floor(Math.random() * 9) + 1;
    // Make equal sometimes
    if (Math.random() < 0.25) b = a;

    if (left) {
      left.innerHTML = '';
      for (let i = 0; i < a; i++) {
        const s = document.createElement('span');
        s.textContent = emoji;
        s.style.fontSize = '2rem';
        left.appendChild(s);
      }
      const n = document.createElement('div');
      n.style.cssText = 'font-family:var(--font-display);font-size:2rem;color:var(--text-dark);margin-top:8px;';
      n.textContent = a;
      left.appendChild(n);
    }

    if (right) {
      right.innerHTML = '';
      for (let i = 0; i < b; i++) {
        const s = document.createElement('span');
        s.textContent = emoji;
        s.style.fontSize = '2rem';
        right.appendChild(s);
      }
      const n = document.createElement('div');
      n.style.cssText = 'font-family:var(--font-display);font-size:2rem;color:var(--text-dark);margin-top:8px;';
      n.textContent = b;
      right.appendChild(n);
    }

    if (feedback) feedback.className = 'feedback';
    btns.forEach(btn => btn.disabled = false);
  };

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const answer = btn.dataset.answer;
      let correct = false;
      if (answer === 'more' && a > b) correct = true;
      if (answer === 'less' && a < b) correct = true;
      if (answer === 'equal' && a === b) correct = true;

      if (correct) {
        if (feedback) {
          feedback.className = 'feedback show success';
          feedback.innerHTML = `<span class="feedback-icon">🌟</span> Correct! ${a} ${answer === 'more' ? '>' : answer === 'less' ? '<' : '='} ${b}!`;
        }
        playSound('correct');
        Progress.addStars(1);
        btns.forEach(btn => btn.disabled = true);
      } else {
        if (feedback) {
          feedback.className = 'feedback show error';
          feedback.innerHTML = `<span class="feedback-icon">😊</span> Look again! Count both sides carefully.`;
        }
        gentleEncourage();
        btn.style.opacity = '0.5';
        setTimeout(() => { btn.style.opacity = ''; }, 800);
      }
    });
  });

  if (newBtn) newBtn.addEventListener('click', () => { generatePair(); playSound('click'); });

  generatePair();
};

// ============================================================
// WORD PROBLEM SOLVER
// ============================================================
const initWordProblem = (containerId) => {
  const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  if (!container) return;

  const problems = [
    { text: "Sam has 3 red apples 🍎🍎🍎 and 4 green apples 🍏🍏🍏🍏. How many apples does Sam have in total?", answer: 7, emoji: '🍎', hint: 'Add the red and green apples together!' },
    { text: "There are 8 birds 🐦 on a branch. 3 birds fly away. How many birds are left?", answer: 5, emoji: '🐦', hint: 'Subtract the birds that flew away!' },
    { text: "Maya has 5 balloons 🎈. Jake gives her 4 more. How many balloons does Maya have now?", answer: 9, emoji: '🎈', hint: 'Count all the balloons together!' },
    { text: "A cookie jar has 10 cookies 🍪. The kids eat 6. How many cookies are left?", answer: 4, emoji: '🍪', hint: 'Take away the eaten cookies!' },
    { text: "There are 2 cats 🐱 and 5 dogs 🐶 in the park. How many animals are there altogether?", answer: 7, emoji: '🐾', hint: 'Count all the animals!' },
  ];

  let current = null;
  const textEl = document.getElementById('word-problem-text');
  const input = container.querySelector('.math-input');
  const checkBtn = container.querySelector('.check-btn');
  const hintBtn = container.querySelector('.hint-btn');
  const nextBtn = container.querySelector('.next-problem-btn');
  const feedback = container.querySelector('.feedback');
  const hintEl = document.getElementById('hint-text');

  const load = () => {
    current = problems[Math.floor(Math.random() * problems.length)];
    if (textEl) textEl.textContent = current.text;
    if (input) { input.value = ''; input.className = 'math-input'; }
    if (feedback) feedback.className = 'feedback';
    if (hintEl) hintEl.style.display = 'none';
  };

  if (checkBtn && input) {
    checkBtn.addEventListener('click', () => {
      const val = parseInt(input.value);
      if (isNaN(val)) { showToast('Write your answer in the box!', 'info'); return; }
      if (val === current.answer) {
        input.className = 'math-input correct';
        if (feedback) {
          feedback.className = 'feedback show success';
          feedback.innerHTML = `<span class="feedback-icon">🧠</span> Amazing thinking! The answer is ${current.answer}!`;
        }
        playSound('correct');
        Progress.addStars(2);
      } else {
        input.className = 'math-input wrong';
        if (feedback) {
          feedback.className = 'feedback show error';
          feedback.innerHTML = `<span class="feedback-icon">😊</span> Not quite! Read the problem again — you've got this!`;
        }
        gentleEncourage();
      }
    });
  }

  if (hintBtn && hintEl) {
    hintBtn.addEventListener('click', () => {
      hintEl.textContent = `💡 Hint: ${current?.hint}`;
      hintEl.style.display = 'block';
      hintEl.style.animation = 'fadeSlideIn 0.3s ease';
      playSound('click');
    });
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { load(); playSound('click'); });

  load();
};

// ============================================================
// MATH PUZZLE (Number Bonds)
// ============================================================
const initNumberBonds = (containerId, total = 10) => {
  const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  if (!container) return;

  const pairs = [];
  for (let i = 0; i <= total; i++) {
    pairs.push([i, total - i]);
  }

  const targetDisplay = container.querySelector('#bond-target') || container.querySelector('#bond-display-target') || container.querySelector('.bond-target');
  const input1 = container.querySelector('.bond-input-1');
  const input2 = container.querySelector('.bond-input-2');
  const checkBtn = container.querySelector('.check-bond-btn');
  const feedback = container.querySelector('.feedback');

  let currentPair = null;

  const loadBond = () => {
    currentPair = pairs[Math.floor(Math.random() * pairs.length)];
    if (targetDisplay) targetDisplay.textContent = total;
    // Randomly show one
    if (input1) input1.value = Math.random() < 0.5 ? currentPair[0] : '';
    if (input2) input2.value = '';
    if (feedback) feedback.className = 'feedback';
  };

  if (checkBtn) {
    checkBtn.addEventListener('click', () => {
      const raw1 = input1?.value?.trim() ?? '';
      const raw2 = input2?.value?.trim() ?? '';
      if (!raw1 || !raw2) { showToast('Fill in both boxes!', 'info'); return; }
      const v1 = parseInt(raw1, 10);
      const v2 = parseInt(raw2, 10);
      if (Number.isNaN(v1) || Number.isNaN(v2)) { showToast('Fill in both boxes with numbers!', 'info'); return; }
      if (v1 + v2 === total) {
        if (feedback) {
          feedback.className = 'feedback show success';
          feedback.innerHTML = `<span class="feedback-icon">🌟</span> ${v1} + ${v2} = ${total}! Perfect!`;
        }
        playSound('correct');
        Progress.addStars(1);
      } else {
        if (feedback) {
          feedback.className = 'feedback show error';
          feedback.innerHTML = `<span class="feedback-icon">😊</span> ${v1} + ${v2} = ${v1+v2}, not ${total}. Try again!`;
        }
        gentleEncourage();
      }
    });
  }

  const newBtn = container.querySelector('.new-bond-btn');
  if (newBtn) newBtn.addEventListener('click', () => { loadBond(); playSound('click'); });

  loadBond();
};

// ============================================================
// DRAG AND DROP SORTING
// ============================================================
const initDragSort = (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  const items = container.querySelectorAll('.draggable');
  const zones = container.querySelectorAll('.drop-zone');

  let dragged = null;

  items.forEach(item => {
    item.setAttribute('draggable', 'true');

    item.addEventListener('dragstart', function (e) {
      dragged = this;
      this.classList.add('dragging');
      e.dataTransfer.setData('text/plain', this.dataset.value);
      playSound('click');
    });

    item.addEventListener('dragend', function () {
      this.classList.remove('dragging');
    });

    // Touch support
    let touchStartX, touchStartY;
    item.addEventListener('touchstart', function (e) {
      dragged = this;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      this.classList.add('dragging');
    }, { passive: true });

    item.addEventListener('touchend', function (e) {
      this.classList.remove('dragging');
      const touch = e.changedTouches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      const zone = target?.closest('.drop-zone');
      if (zone && dragged) {
        handleDrop(zone, dragged);
      }
      dragged = null;
    });
  });

  zones.forEach(zone => {
    zone.addEventListener('dragover', function (e) {
      e.preventDefault();
      this.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', function () {
      this.classList.remove('drag-over');
    });

    zone.addEventListener('drop', function (e) {
      e.preventDefault();
      this.classList.remove('drag-over');
      if (dragged) handleDrop(this, dragged);
    });
  });

  function handleDrop(zone, item) {
    const expected = zone.dataset.accepts;
    const value = item.dataset.value;

    if (expected === value || expected === 'any') {
      zone.appendChild(item);
      zone.classList.add('correct');
      playSound('correct');
      showToast('🌟 Great sorting!', 'success');
      Progress.addStars(1);
    } else {
      zone.classList.add('wrong');
      gentleEncourage('😊 Try a different group!');
      setTimeout(() => zone.classList.remove('wrong'), 600);
    }

    setTimeout(() => zone.classList.remove('correct'), 1500);
  }
};

// ============================================================
// SUBTRACTION VISUAL
// ============================================================
const initSubtractionActivity = (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  const emojis = ['🍓', '🫐', '🍊', '🍋', '🍇', '🥭', '🍍', '🥝'];
  const group = container.querySelector('.sub-group');
  const numA = container.querySelector('.num-a');
  const numB = container.querySelector('.num-b');
  const input = container.querySelector('.math-input');
  const checkBtn = container.querySelector('.check-btn');
  const newBtn = container.querySelector('.new-problem-btn');
  const feedback = container.querySelector('.feedback');

  let a = 0, b = 0, emoji = '';

  const generateProblem = () => {
    a = Math.floor(Math.random() * 7) + 3;
    b = Math.floor(Math.random() * (a - 1)) + 1;
    emoji = emojis[Math.floor(Math.random() * emojis.length)];

    if (group) {
      group.innerHTML = '';
      for (let i = 0; i < a; i++) {
        const el = document.createElement('span');
        el.className = 'math-object';
        el.textContent = emoji;
        if (i >= a - b) {
          el.style.opacity = '0.3';
          el.style.textDecoration = 'line-through';
          el.title = 'Being taken away';
        }
        group.appendChild(el);
      }
    }
    if (numA) numA.textContent = a;
    if (numB) numB.textContent = b;
    if (input) { input.value = ''; input.className = 'math-input'; }
    if (feedback) feedback.className = 'feedback';
  };

  if (checkBtn && input) {
    checkBtn.addEventListener('click', () => {
      const val = parseInt(input.value);
      if (isNaN(val)) { showToast('Type your answer!', 'info'); return; }
      if (val === a - b) {
        input.className = 'math-input correct';
        if (feedback) {
          feedback.className = 'feedback show success';
          feedback.innerHTML = `<span class="feedback-icon">🌟</span> ${a} - ${b} = ${a-b}! Brilliant!`;
        }
        playSound('correct');
        Progress.addStars(1);
      } else {
        input.className = 'math-input wrong';
        if (feedback) {
          feedback.className = 'feedback show error';
          feedback.innerHTML = `<span class="feedback-icon">😊</span> Count the ${emoji} that are NOT crossed out!`;
        }
        gentleEncourage();
      }
    });

    input.addEventListener('keydown', e => { if (e.key === 'Enter') checkBtn.click(); });
  }

  if (newBtn) newBtn.addEventListener('click', () => { generateProblem(); playSound('click'); });

  generateProblem();
};

// ============================================================
// LEVEL HELPERS + CATALOG RENDERING
// ============================================================
const getUnlockedLevel = () => {
  const saved = parseInt(localStorage.getItem('numland_unlocked_level') || '0', 10);
  if (!Number.isNaN(saved) && saved >= 1 && saved <= 4) return saved;

  const stars = Progress.get().stars || 0;
  if (stars >= 40) return 4;
  if (stars >= 20) return 3;
  if (stars >= 8) return 2;
  return 1;
};

const getSelectedLevel = () => {
  const level = parseInt(localStorage.getItem('numland_selected_level') || '1', 10);
  const safeLevel = Number.isNaN(level) ? 1 : Math.max(1, Math.min(4, level));
  return Math.min(safeLevel, getUnlockedLevel());
};

const setSelectedLevel = (level) => {
  const safeLevel = Math.max(1, Math.min(4, Number(level) || 1));
  const unlocked = getUnlockedLevel();
  const applied = Math.min(safeLevel, unlocked);
  localStorage.setItem('numland_selected_level', String(applied));
  return applied;
};

const renderExtraActivities = (containerId, level, startIndex = 0, maxCards = 8) => {
  const mount = document.getElementById(containerId);
  if (!mount || !window.getActivitiesForLevel) return;

  const items = window.getActivitiesForLevel(level).slice(startIndex, startIndex + maxCards);
  if (!items.length) return;

  mount.innerHTML = '';
  const grid = document.createElement('div');
  grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;';

  items.forEach(item => {
    const card = document.createElement('article');
    card.className = 'feature-card';
    card.style.padding = '16px';
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:8px;">
        <strong style="font-family:var(--font-fun);font-size:0.95rem;color:var(--text-dark);">${item.title}</strong>
        <span style="font-family:var(--font-fun);font-size:0.7rem;padding:4px 8px;border-radius:20px;background:var(--bg-cream);color:var(--text-light);text-transform:capitalize;">${item.difficulty}</span>
      </div>
      <p style="font-size:0.82rem;color:var(--text-body);line-height:1.5;margin-bottom:8px;">${item.instructions}</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <span style="font-family:var(--font-fun);font-size:0.72rem;padding:4px 8px;border-radius:20px;background:var(--blue-light);color:var(--blue-dark);">${item.mathConcept}</span>
        <span style="font-family:var(--font-fun);font-size:0.72rem;padding:4px 8px;border-radius:20px;background:var(--green-light);color:var(--green-dark);">${item.rewardType}</span>
      </div>
    `;
    grid.appendChild(card);
  });

  mount.appendChild(grid);
};

window.getUnlockedLevel = getUnlockedLevel;
window.getSelectedLevel = getSelectedLevel;
window.setSelectedLevel = setSelectedLevel;
window.renderExtraActivities = renderExtraActivities;

// ============================================================
// STAR DISPLAY UPDATE FROM STORAGE
// ============================================================
const initStarDisplay = () => {
  const data = Progress.get();
  Progress.updateStarDisplays(data.stars || 0);
};

// ============================================================
// THEME SWITCHER  (Default <-> Pokemon)
// ============================================================
const THEME_KEY = 'numland-theme';

const getSavedTheme = () => {
  try { return localStorage.getItem(THEME_KEY) === 'pokemon' ? 'pokemon' : 'default'; }
  catch (e) { return 'default'; }
};

const saveTheme = (theme) => {
  try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* storage unavailable */ }
};

// --- Mascot mapping: Default theme = Owl, Pokemon theme = Pikachu ---------
// Centralized so future theme-specific mascots are easy to add.
const OWL_EMOJI = '🦉';
const PIKACHU_SVG =
  '<svg class="pika-mascot" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pikachu mascot" focusable="false">' +
  '<path d="M15 24 L4 3 L21 15 Z" fill="#FFCB05" stroke="#6b4e00" stroke-width="2" stroke-linejoin="round"/>' +
  '<path d="M49 24 L60 3 L43 15 Z" fill="#FFCB05" stroke="#6b4e00" stroke-width="2" stroke-linejoin="round"/>' +
  '<path d="M9 9 L4 3 L13 8 Z" fill="#3a2b00"/>' +
  '<path d="M55 9 L60 3 L51 8 Z" fill="#3a2b00"/>' +
  '<circle cx="32" cy="37" r="22" fill="#FFCB05" stroke="#6b4e00" stroke-width="2"/>' +
  '<circle cx="19" cy="43" r="5" fill="#EE1515"/>' +
  '<circle cx="45" cy="43" r="5" fill="#EE1515"/>' +
  '<circle cx="24" cy="33" r="4.2" fill="#1a1a1a"/>' +
  '<circle cx="40" cy="33" r="4.2" fill="#1a1a1a"/>' +
  '<circle cx="25.6" cy="31.4" r="1.5" fill="#fff"/>' +
  '<circle cx="41.6" cy="31.4" r="1.5" fill="#fff"/>' +
  '<path d="M29 39 Q32 42 35 39" fill="none" stroke="#1a1a1a" stroke-width="1.8" stroke-linecap="round"/>' +
  '</svg>';

// Inner artwork for the large hero mascot SVG (shares the owl's 0 0 260 260 viewBox).
const PIKACHU_HERO_INNER =
  '<path d="M88 70 L60 8 L112 52 Z" fill="#FFCB05" stroke="#6b4e00" stroke-width="4" stroke-linejoin="round"/>' +
  '<path d="M172 70 L200 8 L148 52 Z" fill="#FFCB05" stroke="#6b4e00" stroke-width="4" stroke-linejoin="round"/>' +
  '<path d="M74 32 L60 8 L88 26 Z" fill="#3a2b00"/>' +
  '<path d="M186 32 L200 8 L172 26 Z" fill="#3a2b00"/>' +
  '<ellipse cx="130" cy="182" rx="72" ry="62" fill="#FFCB05" stroke="#6b4e00" stroke-width="4"/>' +
  '<circle cx="130" cy="120" r="78" fill="#FFCB05" stroke="#6b4e00" stroke-width="4"/>' +
  '<ellipse cx="100" cy="238" rx="22" ry="12" fill="#e0a800" stroke="#6b4e00" stroke-width="3"/>' +
  '<ellipse cx="160" cy="238" rx="22" ry="12" fill="#e0a800" stroke="#6b4e00" stroke-width="3"/>' +
  '<circle cx="84" cy="140" r="17" fill="#EE1515"/>' +
  '<circle cx="176" cy="140" r="17" fill="#EE1515"/>' +
  '<circle cx="106" cy="112" r="13" fill="#1a1a1a"/>' +
  '<circle cx="154" cy="112" r="13" fill="#1a1a1a"/>' +
  '<circle cx="110.5" cy="107" r="4.5" fill="#fff"/>' +
  '<circle cx="158.5" cy="107" r="4.5" fill="#fff"/>' +
  '<path d="M124 130 Q130 135 136 130 Z" fill="#1a1a1a"/>' +
  '<path d="M116 140 Q130 154 144 140" fill="none" stroke="#1a1a1a" stroke-width="4" stroke-linecap="round"/>';

// Tag every leaf element that is purely an owl mascot so it can be swapped.
const tagMascotElements = () => {
  document.querySelectorAll('.nav-logo-icon, .level-welcome-icon, .guide-intro-icon, .activity-instruction span, span, div').forEach(el => {
    if (el.childElementCount === 0 &&
        el.textContent.trim() === OWL_EMOJI &&
        !el.hasAttribute('data-mascot')) {
      el.setAttribute('data-mascot', '');
      el.setAttribute('data-mascot-original', el.innerHTML);
    }
  });
  // The large hero illustration is swapped by replacing its inner artwork.
  document.querySelectorAll('.hero-owl').forEach(el => {
    if (!el.hasAttribute('data-mascot-hero')) {
      el.setAttribute('data-mascot-hero', '');
      el.setAttribute('data-mascot-hero-original', el.innerHTML);
    }
  });
};

// Swap mascots to match the active theme (decorative only — no content/text changed).
const applyMascots = (theme) => {
  document.querySelectorAll('[data-mascot]').forEach(el => {
    if (theme === 'pokemon') {
      el.innerHTML = PIKACHU_SVG;
      el.classList.add('has-pika');
    } else {
      const original = el.getAttribute('data-mascot-original');
      if (original !== null) el.innerHTML = original;
      el.classList.remove('has-pika');
    }
  });
  document.querySelectorAll('[data-mascot-hero]').forEach(el => {
    if (theme === 'pokemon') {
      el.innerHTML = PIKACHU_HERO_INNER;
      el.setAttribute('aria-label', 'Pikachu mascot');
    } else {
      const original = el.getAttribute('data-mascot-hero-original');
      if (original !== null) el.innerHTML = original;
      el.setAttribute('aria-label', 'Ollie the Owl mascot');
    }
  });
};

const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === 'pokemon') {
    root.setAttribute('data-theme', 'pokemon');
  } else {
    root.removeAttribute('data-theme');
  }
  applyMascots(theme);
};

const themeButtonMarkup = (theme) => theme === 'pokemon'
  ? '<span class="theme-switch-icon" aria-hidden="true">🔴</span> Pokémon'
  : '<span class="theme-switch-icon" aria-hidden="true">🎨</span> Classic';

const initThemeSwitcher = () => {
  let current = getSavedTheme();

  // Tag all owl mascots once, then apply the saved theme (owl ↔ Pikachu).
  tagMascotElements();
  applyTheme(current);

  const buttons = [];
  const refreshButtons = () => {
    const nextName = current === 'pokemon' ? 'Classic' : 'Pokémon';
    buttons.forEach(btn => {
      btn.innerHTML = themeButtonMarkup(current);
      btn.setAttribute('aria-label',
        `Switch theme. Current theme: ${current === 'pokemon' ? 'Pokémon' : 'Classic'}. Activate to switch to ${nextName}.`);
    });
  };

  const toggleTheme = () => {
    current = current === 'pokemon' ? 'default' : 'pokemon';
    applyTheme(current);
    saveTheme(current);
    refreshButtons();
  };

  // Desktop button — inserted before the Stars button / hamburger in the nav.
  const nav = document.querySelector('.nav');
  if (nav) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-switch';
    btn.addEventListener('click', toggleTheme);
    const anchor = nav.querySelector('.nav-btn') || nav.querySelector('.nav-hamburger');
    nav.insertBefore(btn, anchor || null);
    buttons.push(btn);
  }

  // Mobile menu entry — appended to the collapsible mobile nav.
  const mobileNav = document.querySelector('.nav-mobile');
  if (mobileNav) {
    const mbtn = document.createElement('button');
    mbtn.type = 'button';
    mbtn.className = 'nav-link theme-switch-mobile';
    mbtn.addEventListener('click', toggleTheme);
    mobileNav.appendChild(mbtn);
    buttons.push(mbtn);
  }

  refreshButtons();
};

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initThemeSwitcher();
  initScrollReveal();
  initStarDisplay();
  initActivityTabs();

  // Unlock audio on first interaction
  document.addEventListener('click', () => getAudioCtx(), { once: true });
});
