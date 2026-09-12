const viewport = document.getElementById('viewport');
const track = document.getElementById('track');
const panels = [...document.querySelectorAll('.panel')];
const currentPanel = document.getElementById('currentPanel');
const totalPanels = document.getElementById('totalPanels');
const progressBar = document.getElementById('progressBar');
const galleryOverlay = document.getElementById('galleryOverlay');
const galleryGrid = document.getElementById('galleryGrid');
const galleryTitle = document.getElementById('galleryTitle');
const closeGallery = document.getElementById('closeGallery');
const imageViewer = document.getElementById('imageViewer');
const viewerImage = document.getElementById('viewerImage');
const viewerCaption = document.getElementById('viewerCaption');
const closeViewer = document.getElementById('closeViewer');
const themeToggle = document.getElementById('themeToggle');
const themeColorMeta = document.getElementById('themeColorMeta');
const typedFirst = document.getElementById('typedFirst');
const typedLast = document.getElementById('typedLast');

const desktopQuery = window.matchMedia('(min-width: 901px)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let activeIndex = 0;
let desktopTween = null;
let desktopTrigger = null;
let mobileScrollHandler = null;
let fallbackCleanup = null;
let resizeTimer = null;
let scrollRaf = 0;
let lenis = null;
let lenisTicker = null;

// Idle-snap settings. Free scrolling is untouched while the user is moving.
// Only after wheel/trackpad input settles do we check which slide owns >50%
// of the viewport and gently finish the move to that slide.
const IDLE_SNAP_DELAY = 180;
const IDLE_SNAP_DURATION = 0.42;
const IDLE_SNAP_DEAD_ZONE = 10;
let idleSnapTimer = null;
let isIdleSnapping = false;

const galleries = {
  frolic: {
    title: 'Frolic Waterways',
    files: ['frolic-01.webp','frolic-02.webp','frolic-03.webp','frolic-04.webp','frolic-05.webp']
  },
  savvy: {
    title: 'Savvy.shop',
    files: ['savvy-01.webp','savvy-02.webp','savvy-03.webp','savvy-04.webp','savvy-05.webp','savvy-06.webp','savvy-07.webp','savvy-08.webp','savvy-09.webp','savvy-10.webp','savvy-11.webp','savvy-12.webp','savvy-13.webp','savvy-14.webp','savvy-15.webp','savvy-16.webp','savvy-17.webp','savvy-18.webp','savvy-19.webp','savvy-20.webp','savvy-21.webp','savvy-22.webp','savvy-23.webp','savvy-24.webp','savvy-25.webp','savvy-26.webp']
  },
  skroll: {
    title: 'Skroll',
    files: ['skroll-01.webp','skroll-02.webp','skroll-03.webp','skroll-04.webp','skroll-05.webp','skroll-06.webp','skroll-07.webp','skroll-08.webp','skroll-09.webp','skroll-10.webp','skroll-11.webp','skroll-12.webp','skroll-13.webp','skroll-14.webp','skroll-15.webp','skroll-16.webp','skroll-17.webp','skroll-18.webp','skroll-19.webp']
  },
  stint: {
    title: 'Stint22',
    files: ['stint-01.webp','stint-02.webp','stint-03.webp','stint-04.webp','stint-05.webp','stint-06.webp','stint-07.webp','stint-08.webp','stint-09.webp','stint-10.webp','stint-11.webp','stint-12.webp','stint-13.webp','stint-14.webp']
  },
  space: {
    title: 'Space22',
    files: ['space-01.webp','space-02.webp','space-03.webp','space-04.webp','space-05.webp']
  }
};

totalPanels.textContent = String(panels.length).padStart(2, '0');

function clampIndex(index) {
  return Math.max(0, Math.min(panels.length - 1, Number(index) || 0));
}

function setActive(index) {
  index = clampIndex(index);
  activeIndex = index;

  panels.forEach((panel, i) => panel.classList.toggle('active', i === index));
  currentPanel.textContent = String(index + 1).padStart(2, '0');
}

function updateCounter(index) {
  currentPanel.textContent = String(clampIndex(index) + 1).padStart(2, '0');
}

function updateSceneProgress(progress) {
  const safeProgress = Math.max(0, Math.min(1, Number(progress) || 0));

  if (desktopQuery.matches && !reducedMotion.matches) {
    // Deliberately restrained: the background drifts left only a little while
    // the separate SUV advances a little to the right.
  } else {
  }
}

function updateDesktopUI(progress) {
  const safeProgress = Math.max(0, Math.min(1, progress || 0));
  progressBar.style.width = `${safeProgress * 100}%`;
  updateSceneProgress(safeProgress);
  const nearestIndex = Math.round(safeProgress * (panels.length - 1));
  updateCounter(nearestIndex);
  setActive(nearestIndex);
}

function updateMobileUI() {
  updateSceneProgress(0);
  const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
  const limit = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  progressBar.style.width = `${Math.max(0, Math.min(1, scrollTop / limit)) * 100}%`;

  const viewportCenter = window.innerHeight * 0.5;
  let closest = activeIndex;
  let bestDistance = Infinity;

  panels.forEach((panel, index) => {
    const rect = panel.getBoundingClientRect();
    const center = rect.top + rect.height * 0.5;
    const distance = Math.abs(center - viewportCenter);
    if (distance < bestDistance) {
      bestDistance = distance;
      closest = index;
    }
  });

  setActive(closest);
}

function initLenis() {
  if (reducedMotion.matches || !window.Lenis || lenis) return;

  lenis = new Lenis({
    lerp: 0.18,
    smoothWheel: true,
    wheelMultiplier: 1.22,
    touchMultiplier: 1,
    syncTouch: false,
    autoResize: true
  });

  // Lenis owns the smoothing; ScrollTrigger only reads the smoothed scroll position.
  lenis.on('scroll', () => {
    if (window.ScrollTrigger) ScrollTrigger.update();

    if (desktopQuery.matches) {
      queueIdleSnap();
    } else {
      updateMobileUI();
    }
  });

  if (window.gsap) {
    lenisTicker = time => lenis?.raf(time * 1000);
    gsap.ticker.add(lenisTicker);
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = time => {
      if (!lenis) return;
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }
}

function smoothScrollTo(target, immediate = false) {
  if (lenis && !reducedMotion.matches) {
    lenis.scrollTo(target, {
      lerp: 0.11,
      immediate,
      lock: false,
      force: true
    });
    return;
  }

  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: immediate || reducedMotion.matches ? 'auto' : 'smooth' });
  } else {
    target?.scrollIntoView({ behavior: immediate || reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
  }
}


function cancelIdleSnapTimer() {
  if (!idleSnapTimer) return;
  clearTimeout(idleSnapTimer);
  idleSnapTimer = null;
}

function queueIdleSnap() {
  if (!desktopQuery.matches || !desktopTrigger || isIdleSnapping) return;
  if (document.body.classList.contains('modal-open')) return;

  cancelIdleSnapTimer();
  idleSnapTimer = setTimeout(() => {
    idleSnapTimer = null;
    snapDominantPanelAfterIdle();
  }, IDLE_SNAP_DELAY);
}

function getDominantVisiblePanelIndex() {
  const viewportWidth = window.innerWidth;
  let bestIndex = activeIndex;
  let bestVisibleWidth = -1;

  panels.forEach((panel, index) => {
    const rect = panel.getBoundingClientRect();
    const visibleWidth = Math.max(0, Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0));
    if (visibleWidth > bestVisibleWidth) {
      bestVisibleWidth = visibleWidth;
      bestIndex = index;
    }
  });

  return bestIndex;
}

function snapDominantPanelAfterIdle() {
  if (!desktopQuery.matches || !desktopTrigger) return;
  if (document.body.classList.contains('modal-open')) return;

  const count = panels.length;
  if (count < 2) return;

  // Wait until ScrollTrigger's scrub tween has finished catching up. This keeps
  // the idle snap from fighting the normal horizontal easing while it settles.
  const scrubTween = desktopTrigger.getTween?.();
  if (scrubTween?.isActive?.()) {
    idleSnapTimer = setTimeout(() => {
      idleSnapTimer = null;
      snapDominantPanelAfterIdle();
    }, 45);
    return;
  }

  // Measure the ACTUAL visible panels, not just raw scroll progress. Because
  // each desktop panel is 100vw, the panel with the greatest visible width is
  // exactly the one occupying more than half of the screen (ties keep the
  // earlier panel because the comparison is strict >).
  const targetIndex = getDominantVisiblePanelIndex();
  const targetProgress = targetIndex / (count - 1);
  const targetY = desktopTrigger.start +
    (desktopTrigger.end - desktopTrigger.start) * targetProgress;

  const currentY = lenis?.scroll ?? window.scrollY ?? 0;
  if (Math.abs(currentY - targetY) <= IDLE_SNAP_DEAD_ZONE) {
    setActive(targetIndex);
    return;
  }

  if (!lenis || reducedMotion.matches) {
    isIdleSnapping = true;
    window.scrollTo({ top: targetY, behavior: 'auto' });
    setActive(targetIndex);
    requestAnimationFrame(() => { isIdleSnapping = false; });
    return;
  }

  isIdleSnapping = true;
  setActive(targetIndex);

  lenis.scrollTo(targetY, {
    duration: IDLE_SNAP_DURATION,
    easing: t => 1 - Math.pow(1 - t, 3),
    lock: false,
    force: true,
    onComplete: () => {
      isIdleSnapping = false;
      setActive(targetIndex);
    }
  });
}

function interruptIdleSnap() {
  cancelIdleSnapTimer();
  if (!isIdleSnapping || !lenis) return;

  // New user input wins immediately over the automatic settle.
  lenis.scrollTo(lenis.scroll, { immediate: true, force: true });
  isIdleSnapping = false;
}

window.addEventListener('wheel', interruptIdleSnap, { passive: true });
window.addEventListener('touchstart', interruptIdleSnap, { passive: true });
window.addEventListener('pointerdown', interruptIdleSnap, { passive: true });


function cleanupScrolling() {
  cancelIdleSnapTimer();
  isIdleSnapping = false;

  if (desktopTrigger) {
    desktopTrigger.kill();
    desktopTrigger = null;
  }

  if (desktopTween) {
    desktopTween.kill();
    desktopTween = null;
  }

  if (mobileScrollHandler) {
    window.removeEventListener('scroll', mobileScrollHandler);
    mobileScrollHandler = null;
  }

  if (fallbackCleanup) {
    fallbackCleanup();
    fallbackCleanup = null;
  }

  if (scrollRaf) {
    cancelAnimationFrame(scrollRaf);
    scrollRaf = 0;
  }

  if (window.gsap) {
    gsap.set(track, { clearProps: 'transform' });
  } else {
    track.style.transform = '';
  }

  document.documentElement.classList.remove('gsap-horizontal');
}

function getDesktopScrollPerPanel() {
  // Short enough for mouse-wheel use; Lenis smooths the input without adding distance.
  return Math.min(500, Math.max(340, window.innerHeight * 0.44));
}

function initDesktopScrolling() {
  if (!window.gsap || !window.ScrollTrigger) {
    console.warn('GSAP/ScrollTrigger did not load. Falling back to native horizontal scrolling.');
    document.documentElement.classList.add('native-horizontal');
    viewport.scrollLeft = activeIndex * window.innerWidth;

    const onNativeScroll = () => {
      const limit = Math.max(1, viewport.scrollWidth - viewport.clientWidth);
      updateDesktopUI(viewport.scrollLeft / limit);
    };

    viewport.addEventListener('scroll', onNativeScroll, { passive: true });
    fallbackCleanup = () => viewport.removeEventListener('scroll', onNativeScroll);
    onNativeScroll();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.remove('native-horizontal');
  document.documentElement.classList.add('gsap-horizontal');

  const maxX = () => Math.max(0, track.scrollWidth - window.innerWidth);
  const scrollDistance = () => getDesktopScrollPerPanel() * (panels.length - 1);

  desktopTween = gsap.to(track, {
    x: () => -maxX(),
    ease: 'none',
    overwrite: true,
    scrollTrigger: {
      id: 'portfolio-horizontal',
      trigger: viewport,
      start: 'top top',
      end: () => `+=${scrollDistance()}`,
      pin: true,
      pinSpacing: true,
      // Lenis smooths the wheel input and GSAP gently follows it horizontally.
      // There is no continuous ScrollTrigger snap. A separate idle-only routine
      // settles to the dominant (>50% visible) slide after scrolling stops.
      scrub: reducedMotion.matches ? true : 0.55,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: self => updateDesktopUI(self.progress)
    }
  });

  desktopTrigger = desktopTween.scrollTrigger;
  ScrollTrigger.refresh();
  lenis?.resize();

  const initialProgress = panels.length > 1 ? activeIndex / (panels.length - 1) : 0;
  const targetScroll = desktopTrigger.start + (desktopTrigger.end - desktopTrigger.start) * initialProgress;
  smoothScrollTo(targetScroll, true);
  updateDesktopUI(initialProgress);
}

function initMobileScrolling() {
  document.documentElement.classList.remove('native-horizontal');

  // If Lenis is available its scroll event updates the UI. Keep a native fallback
  // so the mobile layout still works offline if the Lenis CDN fails.
  if (!lenis) {
    mobileScrollHandler = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        updateMobileUI();
      });
    };
    window.addEventListener('scroll', mobileScrollHandler, { passive: true });
  }

  const top = panels[activeIndex]?.offsetTop || 0;
  smoothScrollTo(top, true);
  updateMobileUI();
}

function initScrolling() {
  cleanupScrolling();
  if (desktopQuery.matches) initDesktopScrolling();
  else initMobileScrolling();
}

function goToPanel(index) {
  index = clampIndex(index);

  if (desktopQuery.matches && desktopTrigger) {
    const progress = panels.length > 1 ? index / (panels.length - 1) : 0;
    const target = desktopTrigger.start + (desktopTrigger.end - desktopTrigger.start) * progress;
    smoothScrollTo(target, reducedMotion.matches);
    return;
  }

  if (desktopQuery.matches && document.documentElement.classList.contains('native-horizontal')) {
    viewport.scrollTo({ left: index * viewport.clientWidth, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    return;
  }

  smoothScrollTo(panels[index], reducedMotion.matches);
}

document.querySelectorAll('[data-panel]').forEach(element => {
  element.addEventListener('click', () => goToPanel(element.dataset.panel));
});

let modalScrollY = 0;

function pausePageScroll() {
  // Do not stop Lenis here. The gallery itself is a nested scroll container
  // marked with data-lenis-prevent, so wheel/touch input inside the modal is
  // handed back to the browser while the underlying page stays locked.
  modalScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  document.body.classList.add('modal-open');
  document.documentElement.classList.add('modal-open');
}

function resumePageScroll() {
  if (galleryOverlay.classList.contains('open') || imageViewer.classList.contains('open')) return;
  document.body.classList.remove('modal-open');
  document.documentElement.classList.remove('modal-open');
  lenis?.resize();
  if (window.ScrollTrigger) ScrollTrigger.update();
}

function openGallery(key) {
  const gallery = galleries[key];
  if (!gallery) return;

  galleryTitle.textContent = gallery.title;
  galleryGrid.innerHTML = '';

  gallery.files.forEach((file, index) => {
    const button = document.createElement('button');
    button.className = 'gallery-thumb';
    button.type = 'button';
    button.innerHTML = `
      <img src="assets/screenshots/${file}" alt="${gallery.title} screenshot ${index + 1}" loading="lazy" decoding="async">
      <span>${String(index + 1).padStart(2, '0')} / ${String(gallery.files.length).padStart(2, '0')}</span>`;
    button.addEventListener('click', () => openViewer(
      `assets/screenshots/${file}`,
      `${gallery.title} — screenshot ${index + 1}`
    ));
    galleryGrid.appendChild(button);
  });

  galleryOverlay.classList.add('open');
  galleryOverlay.setAttribute('aria-hidden', 'false');
  pausePageScroll();
  const shell = galleryOverlay.querySelector('.gallery-shell');
  if (shell) shell.scrollTop = 0;
  closeGallery.focus();
}

function closeGalleryModal() {
  galleryOverlay.classList.remove('open');
  galleryOverlay.setAttribute('aria-hidden', 'true');
  resumePageScroll();
}

function openViewer(src, caption) {
  viewerImage.src = src;
  viewerImage.alt = caption;
  viewerCaption.textContent = caption;
  imageViewer.classList.add('open');
  imageViewer.setAttribute('aria-hidden', 'false');
  pausePageScroll();
  closeViewer.focus();
}

function closeImageViewer() {
  imageViewer.classList.remove('open');
  imageViewer.setAttribute('aria-hidden', 'true');
  viewerImage.src = '';
  resumePageScroll();
}

const THEME_STORAGE_KEY = 'dhruvil-portfolio-theme';

function getTheme() {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

function applyTheme(theme, persist = true) {
  const nextTheme = theme === 'dark' ? 'dark' : 'light';
  if (nextTheme === 'dark') document.documentElement.dataset.theme = 'dark';
  else delete document.documentElement.dataset.theme;

  themeColorMeta?.setAttribute('content', nextTheme === 'dark' ? '#282828' : '#f3efe6');

  if (themeToggle) {
    const dark = nextTheme === 'dark';
    themeToggle.setAttribute('aria-label', dark ? 'Switch to light appearance' : 'Switch to dark appearance');
    themeToggle.setAttribute('title', dark ? 'Switch to light appearance' : 'Switch to dark appearance');
    themeToggle.setAttribute('aria-pressed', String(dark));
  }

  if (persist) {
    try { localStorage.setItem(THEME_STORAGE_KEY, nextTheme); } catch (_) {}
  }
}

applyTheme(getTheme(), false);
themeToggle?.addEventListener('click', () => {
  applyTheme(getTheme() === 'dark' ? 'light' : 'dark');
});

document.querySelectorAll('.gallery-trigger').forEach(button => {
  button.addEventListener('click', () => openGallery(button.dataset.gallery));
});

closeGallery.addEventListener('click', closeGalleryModal);
closeViewer.addEventListener('click', closeImageViewer);

galleryOverlay.addEventListener('click', event => {
  if (event.target === galleryOverlay) closeGalleryModal();
});

imageViewer.addEventListener('click', event => {
  if (event.target === imageViewer) closeImageViewer();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    if (imageViewer.classList.contains('open')) closeImageViewer();
    else if (galleryOverlay.classList.contains('open')) closeGalleryModal();
    return;
  }

  if (!desktopQuery.matches || document.body.classList.contains('modal-open')) return;
  if (event.key === 'ArrowRight' || event.key === 'PageDown') {
    event.preventDefault();
    goToPanel(activeIndex + 1);
  }
  if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
    event.preventDefault();
    goToPanel(activeIndex - 1);
  }
});

function typeName() {
  if (!typedFirst || !typedLast) return;

  const first = 'Dhruvil';
  const last = 'Rana.';

  if (reducedMotion.matches) {
    typedFirst.textContent = first;
    typedLast.textContent = last;
    return;
  }

  typedFirst.textContent = '';
  typedLast.textContent = '';
  typedFirst.classList.add('typing');
  let firstIndex = 0;

  const typeFirst = () => {
    if (firstIndex < first.length) {
      typedFirst.textContent += first[firstIndex++];
      setTimeout(typeFirst, 72 + Math.random() * 28);
      return;
    }

    typedFirst.classList.remove('typing');
    typedLast.classList.add('typing');
    let lastIndex = 0;

    const typeLast = () => {
      if (lastIndex < last.length) {
        typedLast.textContent += last[lastIndex++];
        setTimeout(typeLast, 78 + Math.random() * 30);
        return;
      }
      setTimeout(() => typedLast.classList.remove('typing'), 950);
    };

    setTimeout(typeLast, 130);
  };

  setTimeout(typeFirst, 320);
}

window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    lenis?.resize();
    if (desktopQuery.matches && window.ScrollTrigger) ScrollTrigger.refresh();
    else updateMobileUI();
  }, 140);
});

desktopQuery.addEventListener('change', () => {
  // Let Lenis keep the current vertical position while the layout switches modes.
  initScrolling();
});

// Initialize the smooth-scroll layer first, then let ScrollTrigger read it.
initLenis();
typeName();
initScrolling();
