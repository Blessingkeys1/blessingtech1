const hero = document.querySelector(".hero, .portfolio-page-hero");
const headerHero = document.querySelector(".hero, .portfolio-page-hero, .service-detail-hero");
const heroTitle = document.querySelector(".hero-title");
const siteHeader = document.querySelector(".site-header");
const stickyMenuButton = document.querySelector(".sticky-menu");
const stickyMenuPanel = document.querySelector(".sticky-menu-panel");
const whatIDoSection = document.querySelector(".what-i-do");
const whatIDoTitle = document.querySelector(".what-i-do-title");
const introImage = document.querySelector(".intro-image");
const serviceItems = document.querySelectorAll(".service-item");
const servicesVisual = document.querySelector(".services-visual");
const servicesVisualImage = servicesVisual?.querySelector("img");
const skillsTagsWrap = document.querySelector(".skills-tags");
const skillTags = document.querySelectorAll(".skill-tag");
const experienceSection = document.querySelector(".experience-section");
const experienceCards = document.querySelectorAll(".experience-item");
const portfolioSection = document.querySelector(".portfolio-section");
const portfolioRevealSquare = document.querySelector(".portfolio-reveal-square");
const portfolioGrid = document.querySelector(".portfolio-grid");
const portfolioPreviewImages = document.querySelectorAll(".portfolio-preview img");
const archivePreviewImages = document.querySelectorAll(".archive-project-media img");
const navLinks = document.querySelectorAll(".nav-links a");
const faqSection = document.querySelector(".faq-section");
const faqVisual = document.querySelector(".faq-visual");
const faqVisualImage = faqVisual?.querySelector("img");
const faqQuestions = document.querySelectorAll(".faq-question");
const projectPopup = document.querySelector(".project-popup");
const projectPopupOpenButtons = document.querySelectorAll("[data-project-popup-open]");
const projectPopupCloseButtons = document.querySelectorAll("[data-project-popup-close]");
const projectPopupForm = document.querySelector(".project-popup-form");
const contactCta = document.querySelector(".contact-cta");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const supportsFinePointer = window.matchMedia("(pointer: fine)");
const cursorShaderCanvases = [...document.querySelectorAll(".cursor-shader")];
const sitePreloader = document.querySelector(".site-preloader");
const sitePreloaderCounter = document.querySelector(".site-preloader-counter");
let introImageFrame = null;
let isIntroImageTicking = false;
let whatIDoWords = [];
let lastProjectPopupTrigger = null;
let lenis = null;

function initSitePreloader() {
  if (!sitePreloader) {
    document.documentElement.classList.remove("is-loading");
    return;
  }

  const startedAt = window.sitePreloaderStartedAt || performance.now();
  const minimumDuration = prefersReducedMotion.matches ? 0 : 850;
  let progress = 0;
  let isPageLoaded = false;
  let isFinished = false;

  const markPageLoaded = () => {
    isPageLoaded = true;
  };

  // Reveal when the opening view is ready, without waiting for offscreen assets.
  const primaryImage = document.querySelector(".hero-portrait, .service-detail-image img");
  const primaryImageReady = primaryImage ? primaryImage.decode().catch(() => {}) : Promise.resolve();
  Promise.all([primaryImageReady, document.fonts?.ready || Promise.resolve()]).then(markPageLoaded);

  window.setTimeout(markPageLoaded, 3200);

  function renderProgress(value) {
    const roundedValue = Math.min(Math.round(value), 100);
    sitePreloader.style.setProperty("--preloader-progress", (roundedValue / 100).toFixed(2));
    sitePreloader.style.setProperty("--preloader-reveal", `${100 - roundedValue}%`);

    if (sitePreloaderCounter) {
      sitePreloaderCounter.textContent = `${String(roundedValue).padStart(2, "0")}%`;
    }
  }

  function finishPreloader() {
    if (isFinished) {
      return;
    }

    isFinished = true;
    renderProgress(100);
    sitePreloader.classList.add("is-complete");
    sitePreloader.setAttribute("aria-hidden", "true");

    window.setTimeout(() => {
      document.documentElement.classList.remove("is-loading");
    }, prefersReducedMotion.matches ? 0 : 760);
  }

  function updatePreloader(now) {
    const elapsed = now - startedAt;
    const waitingProgress = Math.min(90, elapsed / 16);
    const canFinish = isPageLoaded && elapsed >= minimumDuration;
    const target = canFinish ? 100 : waitingProgress;
    const easing = canFinish ? 0.2 : 0.08;

    progress += (target - progress) * easing;
    renderProgress(progress);

    if (canFinish && progress >= 99.4) {
      finishPreloader();
      return;
    }

    window.requestAnimationFrame(updatePreloader);
  }

  window.requestAnimationFrame(updatePreloader);
}

function prepareNavLinkHover() {
  navLinks.forEach((link) => {
    const label = link.textContent.trim();
    const fragment = document.createDocumentFragment();

    link.setAttribute("aria-label", label);

    [...label].forEach((letter, index) => {
      const letterWrap = document.createElement("span");
      const letterInner = document.createElement("span");

      letterWrap.className = "nav-link-letter";
      letterWrap.setAttribute("aria-hidden", "true");
      letterWrap.style.setProperty("--nav-letter-index", index);
      letterInner.dataset.letter = letter;
      letterInner.textContent = letter;
      letterWrap.appendChild(letterInner);
      fragment.appendChild(letterWrap);
    });

    link.replaceChildren(fragment);
  });
}

function prepareContactCtaHover() {
  if (!contactCta) {
    return;
  }

  const label = contactCta.textContent.trim();
  const fragment = document.createDocumentFragment();

  contactCta.setAttribute("aria-label", label);

  [...label].forEach((character, index) => {
    const letterWrap = document.createElement("span");
    const letterInner = document.createElement("span");
    const visibleCharacter = character === " " ? "\u00a0" : character;

    letterWrap.className = "contact-cta-letter";
    letterWrap.setAttribute("aria-hidden", "true");
    letterWrap.style.setProperty("--contact-letter-index", index);
    letterInner.dataset.letter = visibleCharacter;
    letterInner.textContent = visibleCharacter;
    letterWrap.appendChild(letterInner);
    fragment.appendChild(letterWrap);
  });

  contactCta.replaceChildren(fragment);
}

function initServiceImageHover() {
  const activateService = (item) => {
    if (!servicesVisualImage || !item.dataset.serviceImage || item.classList.contains("is-active")) {
      return;
    }

    serviceItems.forEach((serviceItem) => serviceItem.classList.remove("is-active"));
    item.classList.add("is-active");
    servicesVisualImage.src = item.dataset.serviceImage;
    servicesVisual?.classList.remove("is-changing");
    void servicesVisual?.offsetWidth;
    servicesVisual?.classList.add("is-changing");
  };

  serviceItems.forEach((item) => {
    item.addEventListener("pointerenter", () => activateService(item));
    item.addEventListener("focusin", () => activateService(item));
    item.addEventListener("click", () => activateService(item));
  });
}

function prepareSkillsMarquee() {
  if (!skillsTagsWrap || !skillTags.length) {
    return;
  }

  const rowCount = 4;
  const itemsPerRow = Math.ceil(skillTags.length / rowCount);

  skillsTagsWrap.replaceChildren();

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const rowItems = [...skillTags].slice(
      rowIndex * itemsPerRow,
      (rowIndex + 1) * itemsPerRow
    );
    const row = document.createElement("div");
    const track = document.createElement("div");
    const group = document.createElement("div");

    row.className = `skills-row${rowIndex % 2 ? " is-reversed" : ""}`;
    track.className = "skills-track";
    group.className = "skills-group";

    rowItems.forEach((item) => group.appendChild(item));
    rowItems.forEach((item) => {
      const repeatedItem = item.cloneNode(true);
      repeatedItem.setAttribute("aria-hidden", "true");
      group.appendChild(repeatedItem);
    });

    const repeatedGroup = group.cloneNode(true);
    repeatedGroup.setAttribute("aria-hidden", "true");
    track.append(group, repeatedGroup);
    row.appendChild(track);
    skillsTagsWrap.appendChild(row);
  }
}

function initCursorShader() {
  if (
    !cursorShaderCanvases.length ||
    prefersReducedMotion.matches ||
    !supportsFinePointer.matches ||
    typeof window.WebGLFluid !== "function"
  ) {
    if (typeof window.WebGLFluid !== "function") {
      cursorShaderCanvases.forEach((canvas) => {
        canvas.hidden = true;
      });
    }
    return;
  }

  cursorShaderCanvases.forEach((canvas) => {
    window.WebGLFluid(canvas, {
      IMMEDIATE: true,
      TRIGGER: "hover",
      AUTO: false,
      SIM_RESOLUTION: 96,
      DYE_RESOLUTION: 384,
      DENSITY_DISSIPATION: 2.2,
      VELOCITY_DISSIPATION: 0.8,
      PRESSURE: 0.8,
      PRESSURE_ITERATIONS: 12,
      CURL: 6,
      SPLAT_RADIUS: 0.08,
      SPLAT_FORCE: 4000,
      SPLAT_COLOR: { r: 0.94, g: 0.38, b: 0.06 },
      SHADING: true,
      COLORFUL: false,
      TRANSPARENT: true,
      BLOOM: false,
      SUNRAYS: false,
    });
  });

  document.addEventListener("pointermove", (event) => {
    cursorShaderCanvases.forEach((canvas) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width ? canvas.clientWidth / rect.width : 1;
      const scaleY = rect.height ? canvas.clientHeight / rect.height : 1;
      const offsetX = (event.clientX - rect.left) * scaleX;
      const offsetY = (event.clientY - rect.top) * scaleY;
      const fluidEvent = new MouseEvent("mousemove", {
        clientX: event.clientX,
        clientY: event.clientY,
      });

      try {
        Object.defineProperties(fluidEvent, {
          offsetX: { value: offsetX },
          offsetY: { value: offsetY },
        });
      } catch {
        // Chromium derives these coordinates from clientX/clientY automatically.
      }

      canvas.dispatchEvent(fluidEvent);
    });
  });

  cursorShaderCanvases.forEach((canvas) => {
    canvas.dataset.shaderReady = "true";
  });
}


function prepareWhatIDoHighlight() {
  if (!whatIDoTitle) {
    return;
  }

  const fragment = document.createDocumentFragment();
  let wordIndex = 0;

  function appendWord(text, extraClass = "") {
    const word = document.createElement("span");
    word.className = `what-i-do-word${extraClass}`;
    word.style.setProperty("--highlight-index", wordIndex);
    word.textContent = text;
    fragment.appendChild(word);
    wordIndex += 1;
  }

  function appendTextWords(text) {
    text.split(/(\s+)/).forEach((part) => {
      if (!part) {
        return;
      }

      if (/\s+/.test(part)) {
        fragment.appendChild(document.createTextNode(" "));
        return;
      }

      appendWord(part);
    });
  }

  Array.from(whatIDoTitle.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      appendTextWords(node.textContent);
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const highlightedElement = node.cloneNode(true);
      highlightedElement.classList.add("what-i-do-word", "what-i-do-accent-word");
      highlightedElement.style.setProperty("--highlight-index", wordIndex);
      fragment.appendChild(highlightedElement);
      wordIndex += 1;
    }
  });

  whatIDoTitle.replaceChildren(fragment);
  whatIDoWords = Array.from(whatIDoTitle.querySelectorAll(".what-i-do-word"));
  whatIDoTitle.classList.add("is-highlight-ready");
}

function getBackgroundLuminanceAtPoint(x, y) {
  const elementsAtPoint = document
    .elementsFromPoint(x, y)
    .filter((element) => !siteHeader.contains(element));

  for (const element of elementsAtPoint) {
    const elementStyle = getComputedStyle(element);
    const elementOpacity = Number(elementStyle.opacity);

    if (elementStyle.visibility === "hidden" || elementOpacity < 0.75) {
      continue;
    }

    const backgroundColor = elementStyle.backgroundColor;
    const channels = backgroundColor.match(/[\d.]+/g)?.map(Number);

    if (!channels || channels.length < 3) {
      continue;
    }

    const alpha = channels[3] ?? 1;

    if (alpha < 0.75) {
      continue;
    }

    const [red, green, blue] = channels;
    return (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
  }

  return 0;
}

function getPortfolioHeaderLuminance(sampleY) {
  if (!portfolioSection) {
    return null;
  }

  const rect = portfolioSection.getBoundingClientRect();

  if (rect.top > sampleY || rect.bottom < sampleY) {
    return null;
  }

  if (prefersReducedMotion.matches) {
    return 1;
  }

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const scrollDistance = Math.max(rect.height - viewportHeight, 1);
  const progress = clampValue(-rect.top / scrollDistance, 0, 1);
  const isDarkGallery = progress >= 0.08 && progress < 0.92;

  return isDarkGallery ? 0 : 1;
}

function updateStickyHeader() {
  if (!siteHeader) {
    return;
  }

  const heroBottom = headerHero?.getBoundingClientRect().bottom ?? 0;
  const isSticky = headerHero ? heroBottom <= 0 : window.scrollY > 80;

  siteHeader.classList.toggle("is-sticky", isSticky);

  if (isSticky) {
    const headerRect = siteHeader.querySelector(".nav")?.getBoundingClientRect();
    const sampleX = headerRect ? headerRect.left + headerRect.width / 2 : window.innerWidth / 2;
    const sampleY = headerRect ? headerRect.top + headerRect.height / 2 : 40;
    const portfolioLuminance = getPortfolioHeaderLuminance(sampleY);
    const luminance = portfolioLuminance ?? getBackgroundLuminanceAtPoint(sampleX, sampleY);
    siteHeader.classList.toggle("is-on-light", luminance > 0.55);
  } else {
    siteHeader.classList.remove("is-on-light");
  }

  if (!isSticky) {
    closeStickyMenu();
  }
}

function openStickyMenu() {
  if (!siteHeader || !stickyMenuButton || !stickyMenuPanel) {
    return;
  }

  siteHeader.classList.add("is-menu-open");
  stickyMenuPanel.hidden = false;
  stickyMenuButton.setAttribute("aria-expanded", "true");
}

function closeStickyMenu() {
  if (!siteHeader || !stickyMenuButton || !stickyMenuPanel) {
    return;
  }

  siteHeader.classList.remove("is-menu-open");
  stickyMenuPanel.hidden = true;
  stickyMenuButton.setAttribute("aria-expanded", "false");
}

function toggleStickyMenu() {
  if (!stickyMenuPanel || stickyMenuPanel.hidden) {
    openStickyMenu();
    return;
  }

  closeStickyMenu();
}

if (stickyMenuButton) {
  stickyMenuButton.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleStickyMenu();
  });
}

if (stickyMenuPanel) {
  stickyMenuPanel.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeStickyMenu();
    }
  });
}

document.addEventListener("click", (event) => {
  if (!siteHeader || !siteHeader.classList.contains("is-menu-open")) {
    return;
  }

  if (!event.target.closest(".site-header")) {
    closeStickyMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeStickyMenu();
  }
});

prepareSkillsMarquee();

function openProjectPopup(trigger) {
  if (!projectPopup) {
    return;
  }

  lastProjectPopupTrigger = trigger || document.activeElement;
  projectPopup.hidden = false;

  const firstField = projectPopup.querySelector(".project-popup-form input, .project-popup-form select, .project-popup-form textarea");
  if (firstField) {
    firstField.focus();
  }
}

function closeProjectPopup() {
  if (!projectPopup || projectPopup.hidden) {
    return;
  }

  projectPopup.hidden = true;

  if (lastProjectPopupTrigger && typeof lastProjectPopupTrigger.focus === "function") {
    lastProjectPopupTrigger.focus();
  }
}

projectPopupOpenButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    openProjectPopup(button);
  });
});

projectPopupCloseButtons.forEach((button) => {
  button.addEventListener("click", closeProjectPopup);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeProjectPopup();
  }
});

if (hero && heroTitle) {
  hero.addEventListener("pointermove", (event) => {
    const rect = heroTitle.getBoundingClientRect();
    const isOverTitle =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (!isOverTitle) {
      hero.classList.remove("is-reading");
      heroTitle.classList.remove("is-reading");
      heroTitle.style.setProperty("--title-shift-x", "0px");
      heroTitle.style.setProperty("--title-shift-y", "0px");
      return;
    }

    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    hero.classList.add("is-reading");
    heroTitle.classList.add("is-reading");
    heroTitle.style.setProperty("--title-shift-x", `${x * 14}px`);
    heroTitle.style.setProperty("--title-shift-y", `${y * 10}px`);
  });

  hero.addEventListener("pointerleave", () => {
    hero.classList.remove("is-reading");
    heroTitle.classList.remove("is-reading");
    heroTitle.style.setProperty("--title-shift-x", "0px");
    heroTitle.style.setProperty("--title-shift-y", "0px");
  });
}

function updateWhatIDoHighlight() {
  if (!whatIDoSection || !whatIDoWords.length) {
    return;
  }

  if (prefersReducedMotion.matches) {
    whatIDoWords.forEach((word) => {
      word.classList.add("is-highlighted");
    });
    return;
  }

  const rect = whatIDoSection.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const scrollDistance = Math.max(whatIDoSection.offsetHeight - viewportHeight, 1);
  const progress = clampValue(-rect.top / scrollDistance, 0, 1);
  const highlightedCount = Math.ceil(progress * (whatIDoWords.length + 1));

  whatIDoWords.forEach((word, index) => {
    word.classList.toggle("is-highlighted", index < highlightedCount);
  });
}

function updateIntroImage() {
  if (window.innerWidth <= 760) return;
  if (!introImage) {
    return;
  }

  introImageFrame = introImageFrame || introImage.querySelector(".intro-image-frame");

  const rect = introImage.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const zoomDistance = Math.max(rect.height - viewportHeight, 1);
  const zoomEnd = zoomDistance * 0.72;
  const rawProgress = -rect.top / zoomEnd;
  const progress = Math.min(Math.max(rawProgress, 0), 1);
  const detailsProgress = Math.min(Math.max((rawProgress - 0.84) / 0.16, 0), 1);
  const startScale = window.innerWidth <= 760 ? 0.58 : 0.38;
  const scale = startScale + progress * (1 - startScale);
  const radius = 10 - progress * 10;
  const noteOpacity = Math.max(1 - progress / 0.35, 0);
  const detailsY = 28 - detailsProgress * 28;

  introImage.style.setProperty("--image-scale", scale.toFixed(3));
  introImage.style.setProperty("--image-radius", `${radius.toFixed(1)}px`);
  introImage.style.setProperty("--note-opacity", noteOpacity.toFixed(3));
  introImage.style.setProperty("--details-opacity", detailsProgress.toFixed(3));
  introImage.style.setProperty("--details-y", `${detailsY.toFixed(1)}px`);
  introImage.classList.toggle("is-details-visible", detailsProgress > 0.2);

  if (introImageFrame) {
    introImageFrame.toggleAttribute("data-zoom-complete", detailsProgress >= 0.995);
  }
}

function clampValue(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateExperienceCards() {
  if (!experienceSection || !experienceCards.length) {
    return;
  }

  const rect = experienceSection.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const scrollDistance = Math.max(experienceSection.offsetHeight - viewportHeight, 1);
  const progress = clampValue(-rect.top / scrollDistance, 0, 1);
  const activePosition = progress * (experienceCards.length - 1);
  const isSmallScreen = window.innerWidth <= 760;
  const firstCardHeight = experienceCards[0].offsetHeight || (isSmallScreen ? 244 : 172);
  if (isSmallScreen) {
    const cardHeight = Math.max(...Array.from(experienceCards, (card) => card.offsetHeight));
    experienceSection.style.setProperty("--mobile-experience-height", `${cardHeight + 32}px`);
  }
  const pastOffset = isSmallScreen ? 14 : 18;
  const futureOffset = Math.max(firstCardHeight + (isSmallScreen ? 36 : 58), isSmallScreen ? 280 : 230);

  experienceCards.forEach((card, index) => {
    const distance = index - activePosition;
    const past = clampValue(-distance, 0, 2);
    const future = clampValue(distance, 0, 2);
    const direction = index % 2 === 0 ? -1 : 1;
    let y;
    let z;
    let rotateX;
    let rotateZ;
    let scale;
    let opacity;

    if (distance > 0) {
      const farFuture = clampValue(future - 1, 0, 1);

      y = futureOffset * clampValue(future, 0, 1) + farFuture * 48;
      z = 40 - future * 28;
      rotateX = 0;
      rotateZ = direction * (1.5 + future * 1.6);
      scale = 1 - clampValue(future, 0, 1) * 0.035;
      opacity = future > 1.08 ? 0 : 1;
    } else {
      y = -past * pastOffset;
      z = -past * 90;
      rotateX = 0;
      rotateZ = direction * past * 1.4;
      scale = 1 - past * 0.035;
      opacity = past > 1.02 ? 0 : clampValue(1 - past * 0.58, 0.34, 1);
    }

    card.style.setProperty("--experience-card-y", `${y.toFixed(1)}px`);
    card.style.setProperty("--experience-card-z", `${z.toFixed(1)}px`);
    card.style.setProperty("--experience-card-rotate-x", `${rotateX.toFixed(2)}deg`);
    card.style.setProperty("--experience-card-rotate-z", `${rotateZ.toFixed(2)}deg`);
    card.style.setProperty("--experience-card-scale", scale.toFixed(3));
    card.style.setProperty("--experience-card-opacity", opacity.toFixed(3));
    card.style.setProperty("--experience-card-layer", String(20 + index));
    card.style.pointerEvents = Math.abs(distance) < 0.7 ? "auto" : "none";
  });
}

function updatePortfolioReveal() {
  if (!portfolioSection || !portfolioRevealSquare) {
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    portfolioSection.style.setProperty("--portfolio-square-opacity", "0");
    portfolioSection.style.setProperty("--portfolio-square-rotate", "0deg");
    portfolioSection.style.setProperty("--portfolio-note-opacity", "0");
    portfolioSection.style.setProperty("--portfolio-content-opacity", "1");
    portfolioSection.style.setProperty("--portfolio-content-y", "0px");
    portfolioSection.style.setProperty("--portfolio-track-x", "0px");
    return;
  }

  const rect = portfolioSection.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  if (rect.top > 0) {
    portfolioSection.style.setProperty("--portfolio-square-scale", "1");
    portfolioSection.style.setProperty("--portfolio-square-rotate", "45deg");
    portfolioSection.style.setProperty("--portfolio-square-opacity", "1");
    portfolioSection.style.setProperty("--portfolio-note-opacity", "1");
    portfolioSection.style.setProperty("--portfolio-content-opacity", "0");
    portfolioSection.style.setProperty("--portfolio-content-y", "56px");
    portfolioSection.style.setProperty("--portfolio-track-x", "0px");
    return;
  }

  const zoomDistance = Math.max(rect.height - viewportHeight, 1);
  const scrollProgress = clampValue(-rect.top / zoomDistance, 0, 1);
  const rawProgress = scrollProgress / 0.14;
  const progress = clampValue(rawProgress, 0, 1);
  const contentProgress = clampValue((rawProgress - 0.86) / 0.04, 0, 1);
  const squareSize = Math.max(portfolioRevealSquare.offsetWidth, 1);
  const coverScale = (Math.hypot(window.innerWidth, viewportHeight) / squareSize) * 1.05;
  const scale = 1 + progress * (coverScale - 1);
  const noteOpacity = Math.max(1 - progress / 0.35, 0);
  const contentOpacity = contentProgress;
  const contentY = 56 - contentProgress * 56;
  const horizontalProgress = clampValue((scrollProgress - 0.18) / 0.82, 0, 1);
  const maxTrackX = portfolioGrid ? Math.max(portfolioGrid.scrollWidth - portfolioGrid.clientWidth, 0) : 0;
  const trackX = -maxTrackX * horizontalProgress;

  portfolioSection.style.setProperty("--portfolio-track-x", `${trackX.toFixed(1)}px`);

  portfolioSection.style.setProperty("--portfolio-square-scale", scale.toFixed(3));
  portfolioSection.style.setProperty("--portfolio-square-rotate", `${(45 + progress * 360).toFixed(2)}deg`);
  portfolioSection.style.setProperty("--portfolio-square-opacity", "1");
  portfolioSection.style.setProperty("--portfolio-note-opacity", noteOpacity.toFixed(3));
  portfolioSection.style.setProperty("--portfolio-content-opacity", contentOpacity.toFixed(3));
  portfolioSection.style.setProperty("--portfolio-content-y", `${contentY.toFixed(1)}px`);
}

function updatePortfolioImageScroll() {
  portfolioPreviewImages.forEach((image) => {
    const preview = image.closest(".portfolio-preview");

    if (!preview) {
      return;
    }

    const scrollDistance = Math.max(image.offsetHeight - preview.clientHeight, 0);
    image.style.setProperty("--portfolio-image-scroll", `${scrollDistance.toFixed(1)}px`);
  });
}

function updateArchiveImageScroll() {
  archivePreviewImages.forEach((image) => {
    const preview = image.closest(".archive-project-media");

    if (!preview) {
      return;
    }

    const previewHeight = Math.max(preview.clientHeight - 37, 0);
    const renderedImageHeight = image.naturalWidth
      ? image.clientWidth * (image.naturalHeight / image.naturalWidth)
      : previewHeight;
    const scrollDistance = Math.max(renderedImageHeight - previewHeight, 0);
    const scrollDuration = clampValue(scrollDistance / 260, 5, 14);

    image.style.setProperty("--archive-scroll-duration", `${scrollDuration.toFixed(2)}s`);
  });
}

portfolioPreviewImages.forEach((image) => {
  if (image.complete) {
    updatePortfolioImageScroll();
  } else {
    image.addEventListener("load", updatePortfolioImageScroll, { once: true });
  }
});

archivePreviewImages.forEach((image) => {
  if (image.complete) {
    updateArchiveImageScroll();
  } else {
    image.addEventListener("load", updateArchiveImageScroll, { once: true });
  }
});

function requestIntroImageUpdate() {
  if (isIntroImageTicking) {
    return;
  }

  isIntroImageTicking = true;
  window.requestAnimationFrame(() => {
    updateStickyHeader();
    updateWhatIDoHighlight();
    updateIntroImage();
    updateExperienceCards();
    updatePortfolioReveal();
    updatePortfolioImageScroll();
    isIntroImageTicking = false;
  });
}

function initSmoothScroll() {
  if (!window.Lenis || prefersReducedMotion.matches) {
    return;
  }

  lenis = new Lenis({
    anchors: true,
    autoRaf: false,
    duration: 1.12,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.2,
  });

  lenis.on("scroll", requestIntroImageUpdate);

  function raf(time) {
    lenis.raf(time);
    window.requestAnimationFrame(raf);
  }

  window.requestAnimationFrame(raf);
}

function initFaqAccordion() {
  faqQuestions.forEach((question) => {
    question.addEventListener("click", () => {
      const shouldOpen = question.getAttribute("aria-expanded") !== "true";

      faqQuestions.forEach((otherQuestion) => {
        otherQuestion.setAttribute("aria-expanded", "false");
        otherQuestion.closest(".faq-item")?.classList.remove("is-open");
      });

      if (shouldOpen) {
        question.setAttribute("aria-expanded", "true");
        question.closest(".faq-item")?.classList.add("is-open");

        if (faqVisualImage && question.dataset.faqImage) {
          faqVisualImage.src = question.dataset.faqImage;
          faqVisual?.classList.remove("is-changing");
          void faqVisual?.offsetWidth;
          faqVisual?.classList.add("is-changing");
        }
      }

      faqSection?.classList.toggle("has-open", shouldOpen);
    });
  });
}

// Subtle depth on service artwork, with touch and reduced motion respected.
document.querySelectorAll(".service-detail-image").forEach((artwork) => {
  const resetTilt = () => {
    artwork.style.removeProperty("--service-tilt-x");
    artwork.style.removeProperty("--service-tilt-y");
  };
  artwork.addEventListener("pointermove", (event) => {
    if (prefersReducedMotion.matches || !supportsFinePointer.matches) {
      resetTilt();
      return;
    }
    const bounds = artwork.getBoundingClientRect();
    artwork.style.setProperty("--service-tilt-x", `${(0.5 - (event.clientY - bounds.top) / bounds.height) * 6}deg`);
    artwork.style.setProperty("--service-tilt-y", `${((event.clientX - bounds.left) / bounds.width - 0.5) * 6}deg`);
  });
  artwork.addEventListener("pointerleave", resetTilt);
  prefersReducedMotion.addEventListener("change", resetTilt);
});

initSitePreloader();
prepareNavLinkHover();
prepareContactCtaHover();
prepareWhatIDoHighlight();
initCursorShader();
initServiceImageHover();
initFaqAccordion();
window.addEventListener("scroll", requestIntroImageUpdate, { passive: true });
window.addEventListener("resize", () => {
  requestIntroImageUpdate();
  updatePortfolioImageScroll();
  updateArchiveImageScroll();
});

initSmoothScroll();
updateStickyHeader();
updateWhatIDoHighlight();
updateIntroImage();
updateExperienceCards();
updatePortfolioReveal();
updatePortfolioImageScroll();
updateArchiveImageScroll();

function initHeroPhotoSwitch() {
  const switchBtns = document.querySelectorAll(".hero-switch-btn");
  const heroPortrait = document.querySelector(".hero-portrait");
  if (!switchBtns.length || !heroPortrait) return;

  switchBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      switchBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const targetSrc = btn.dataset.photo;
      if (!targetSrc || heroPortrait.getAttribute("src") === targetSrc) return;

      heroPortrait.style.opacity = "0.2";
      heroPortrait.style.transform = "translateX(-50%) translateY(14px) scale(0.96)";
      setTimeout(() => {
        heroPortrait.src = targetSrc;
        heroPortrait.style.opacity = "1";
        heroPortrait.style.transform = "translateX(-50%) translateY(0) scale(1)";
      }, 160);
    });
  });
}

initHeroPhotoSwitch();

function initProjectPopupForm() {
  const forms = document.querySelectorAll(".project-popup-form");
  if (!forms.length) return;

  forms.forEach((form) => {
    // Intercept in the capturing phase so this executes before legacy WP scripts
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();

      const submitBtn = form.querySelector('input[type="submit"], button[type="submit"]');
      let responseOutput = form.querySelector(".wpcf7-response-output");
      if (!responseOutput) {
        responseOutput = document.createElement("div");
        responseOutput.className = "wpcf7-response-output";
        form.appendChild(responseOutput);
      }

      const nameInput = form.querySelector('[name="your-name"], [name="name"]');
      const emailInput = form.querySelector('[name="your-email"], [name="email"]');
      const projectSelect = form.querySelector('[name="project"], [name="project_type"]');
      const messageInput = form.querySelector('[name="your-message"], [name="message"]');

      const name = nameInput ? nameInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim() : "";
      const projectType = projectSelect ? projectSelect.value : "General Inquiry";
      const message = messageInput ? messageInput.value.trim() : "";

      if (!name || !email || !message) {
        responseOutput.className = "wpcf7-response-output is-error";
        responseOutput.textContent = "Please fill in your name, email, and project details.";
        responseOutput.style.display = "block";
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        responseOutput.className = "wpcf7-response-output is-error";
        responseOutput.textContent = "Please provide a valid email address.";
        responseOutput.style.display = "block";
        return;
      }

      const originalBtnValue = submitBtn ? (submitBtn.value || submitBtn.textContent) : "Send project brief";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.value = "Sending to blessingstechnologies4@gmail.com...";
      }

      responseOutput.className = "wpcf7-response-output is-submitting";
      responseOutput.textContent = "Delivering your brief to blessingstechnologies4@gmail.com...";
      responseOutput.style.display = "block";

      const payload = {
        name: name,
        email: email,
        project_type: projectType,
        message: message,
        _subject: `New Project Inquiry: ${projectType} from ${name}`,
        _replyto: email
      };

      try {
        const response = await fetch("https://shipmyform.com/to/blessingstechnologies4@gmail.com", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          responseOutput.className = "wpcf7-response-output is-success";
          responseOutput.innerHTML = `<strong>Inquiry Sent!</strong><br>Your project details have been successfully delivered to <strong>blessingstechnologies4@gmail.com</strong>.<br>Mwanje Blessing will review and reply to <em>${email}</em> promptly.`;
          form.reset();
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.value = "Sent Successfully \u2713";
            setTimeout(() => { submitBtn.value = originalBtnValue; }, 5000);
          }
        } else {
          throw new Error("HTTP " + response.status);
        }
      } catch (err) {
        console.warn("Direct form delivery warning:", err);
        const mailtoUrl = `mailto:blessingstechnologies4@gmail.com?subject=${encodeURIComponent("Project Inquiry: " + projectType)}&body=${encodeURIComponent("Name: " + name + "\nEmail: " + email + "\nProject Type: " + projectType + "\n\nDetails:\n" + message)}`;
        const whatsappUrl = `https://wa.me/256709344655?text=${encodeURIComponent("Hello Blessing Technologies,\nMy name is " + name + " (" + email + ").\nProject: " + projectType + "\nDetails: " + message)}`;

        responseOutput.className = "wpcf7-response-output is-warning";
        responseOutput.innerHTML = `Your message is ready! Click below to send directly:<br><br>
          <a href="${mailtoUrl}" style="color: #EF610F; font-weight: 800; text-decoration: underline; margin-right: 14px;">Open in Email App</a>
          <a href="${whatsappUrl}" target="_blank" rel="noopener" style="color: #25D366; font-weight: 800; text-decoration: underline;">Send via WhatsApp</a>`;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.value = originalBtnValue;
        }
      }
    }, true);
  });
}

initProjectPopupForm();



