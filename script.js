/* ============================================================
   PORTFOLIO HERO JAVASCRIPT
   Inspired by landonorris.com
   ============================================================ */

(function () {
  'use strict';

  /* ── PRELOADER LOGIC ────────────────────────────────────── */
  const preloader = document.getElementById('preloader');
  const preloaderPercent = document.getElementById('preloader-percent');
  const preloaderBar = document.getElementById('preloader-bar');
  const preloaderMsg = document.getElementById('preloader-msg');

  if (preloader) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        finishPreloader();
      }
      updatePreloader(progress);
    }, 120);

    function updatePreloader(p) {
      const rounded = Math.floor(p);
      preloaderPercent.textContent = rounded < 10 ? `0${rounded}` : rounded;
      preloaderBar.style.width = `${p}%`;

      if (p > 30 && p < 60) preloaderMsg.textContent = 'CONNECTING TO CORE...';
      if (p > 60 && p < 90) preloaderMsg.textContent = 'PREPARING INTERFACE...';
      if (p >= 90) preloaderMsg.textContent = 'SYSTEM READY';
    }

    function finishPreloader() {
      setTimeout(() => {
        preloader.classList.add('loaded');
        // Re-enable scroll after preloader
        document.body.style.overflow = '';
      }, 500);
    }

    // Disable scroll while loading
    document.body.style.overflow = 'hidden';
  }
  // Ensure preloader finishes on full page load
  window.addEventListener('load', () => {
    if (preloader && !preloader.classList.contains('loaded')) {
      updatePreloader(100);
      finishPreloader();
    }
  });


  /* ── TOPOGRAPHIC CANVAS ────────────────────────────────── */
  const topoCanvas = document.getElementById('topo-canvas');
  const topoCtx = topoCanvas.getContext('2d');
  let topoW, topoH;

  function resizeTopo() {
    topoW = topoCanvas.width = window.innerWidth;
    topoH = topoCanvas.height = window.innerHeight;
    drawTopo();
  }

  function drawTopo() {
    topoCtx.clearRect(0, 0, topoW, topoH);

    const lines = 18;
    const amplitude = 80;
    const freq = 0.008;

    topoCtx.strokeStyle = 'rgba(0,0,0,0.06)';
    topoCtx.lineWidth = 1;

    for (let i = 0; i < lines; i++) {
      const y0 = (i / lines) * topoH * 1.3 - topoH * 0.15;
      topoCtx.beginPath();

      for (let x = 0; x <= topoW; x += 6) {
        // Multiple sine waves for organic look
        const y =
          y0 +
          Math.sin(x * freq + i * 0.7) * amplitude * 0.6 +
          Math.sin(x * freq * 1.7 + i * 1.3) * amplitude * 0.3 +
          Math.sin(x * freq * 0.4 + i * 2.1) * amplitude * 0.5;

        if (x === 0) topoCtx.moveTo(x, y);
        else topoCtx.lineTo(x, y);
      }
      topoCtx.stroke();
    }
  }

  window.addEventListener('resize', resizeTopo);
  resizeTopo();

  /* ── PARALLAX MOUSE EFFECT ─────────────────────────────── */
  const portraitWrap = document.getElementById('portrait-wrap');
  const meshOverlay = document.getElementById('mesh-overlay');
  const blob1 = document.querySelector('.blob-1');
  const blob2 = document.querySelector('.blob-2');
  const blob3 = document.querySelector('.blob-3');

  let mouseX = 0, mouseY = 0;
  let currentX = 0, currentY = 0;

  document.addEventListener('mousemove', (e) => {
    // Normalize -1 to 1
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animateParallax() {
    currentX = lerp(currentX, mouseX, 0.06);
    currentY = lerp(currentY, mouseY, 0.06);

    const px = currentX * 18;
    const py = currentY * 12;

    // Portrait subtle tilt
    if (portraitWrap) {
      portraitWrap.style.transform = `perspective(1000px) rotateY(${currentX * 4}deg) rotateX(${-currentY * 3}deg) translate(${px * 0.4}px, ${py * 0.3}px)`;
    }

    // Mesh shifts more dramatically (like the helmet)
    if (meshOverlay) {
      meshOverlay.style.transform = `translateX(calc(-50% + ${currentX * 22}px)) translateY(${currentY * 14}px)`;
    }

    // Blobs drift
    if (blob1) blob1.style.transform = `translate(${currentX * -25}px, ${currentY * -20}px)`;
    if (blob2) blob2.style.transform = `translate(calc(-50% + ${currentX * 15}px), calc(-50% + ${currentY * 10}px))`;
    if (blob3) blob3.style.transform = `translate(${currentX * -20}px, ${currentY * -15}px)`;

    requestAnimationFrame(animateParallax);
  }

  animateParallax();

  /* ── PREMIUM PORTRAIT REVEAL ───────────────────────────── */
  const portraitRobot = document.getElementById('portrait-robot');
  const scannerLine = document.getElementById('scanner-line');
  const scannerHud = document.getElementById('scanner-hud');

  let hovering = false;
  let cursorX = 0, cursorY = 0;
  let smoothCursorX = 0, smoothCursorY = 0;
  let revealOpacity = 0;
  let targetOpacity = 0;

  if (portraitWrap && portraitRobot) {
    // Enter hover state
    portraitWrap.addEventListener('mouseenter', () => {
      hovering = true;
      targetOpacity = 1;
    });

    // Exit hover state
    portraitWrap.addEventListener('mouseleave', () => {
      hovering = false;
      targetOpacity = 0;
    });

    // Track cursor position for progressive reveal
    portraitWrap.addEventListener('mousemove', (e) => {
      const rect = portraitWrap.getBoundingClientRect();
      
      // Get cursor position relative to portrait
      cursorX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      cursorY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

      // Calculate distance from center for progressive reveal
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const distX = (cursorX - centerX) / centerX;
      const distY = (cursorY - centerY) / centerY;
      const distance = Math.sqrt(distX * distX + distY * distY);
      
      // Progressive opacity based on distance (0.2 to 1.0)
      if (hovering) {
        targetOpacity = Math.max(0.15, 1 - distance * 0.45);
      }
    });

    // Smooth animation loop for cursor tracking and reveal
    function animateReveal() {
      // Smooth cursor position
      smoothCursorX += (cursorX - smoothCursorX) * 0.12;
      smoothCursorY += (cursorY - smoothCursorY) * 0.12;

      // Smooth reveal opacity with easing
      revealOpacity += (targetOpacity - revealOpacity) * 0.08;

      // Update CSS variables with smooth values
      portraitWrap.style.setProperty('--cursor-x', `${smoothCursorX}px`);
      portraitWrap.style.setProperty('--cursor-y', `${smoothCursorY}px`);
      portraitWrap.style.setProperty('--reveal-opacity', revealOpacity);

      requestAnimationFrame(animateReveal);
    }

    animateReveal();
  }

  /* ── SCROLL: redraw topo contours with offset ──────────── */
  let scrollY = 0;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    drawTopoScrolled(scrollY);
  });

  function drawTopoScrolled(offset) {
    topoCtx.clearRect(0, 0, topoW, topoH);
    const lines = 18;
    const amplitude = 80;
    const freq = 0.008;

    topoCtx.strokeStyle = 'rgba(0,0,0,0.06)';
    topoCtx.lineWidth = 1;

    for (let i = 0; i < lines; i++) {
      const y0 = (i / lines) * topoH * 1.3 - topoH * 0.15 - offset * 0.3;
      topoCtx.beginPath();

      for (let x = 0; x <= topoW; x += 6) {
        const y =
          y0 +
          Math.sin(x * freq + i * 0.7) * amplitude * 0.6 +
          Math.sin(x * freq * 1.7 + i * 1.3) * amplitude * 0.3 +
          Math.sin(x * freq * 0.4 + i * 2.1) * amplitude * 0.5;

        if (x === 0) topoCtx.moveTo(x, y);
        else topoCtx.lineTo(x, y);
      }
      topoCtx.stroke();
    }
  }

  /* ── CUSTOM CURSOR ─────────────────────────────────────── */
  const cursor = document.querySelector('.custom-cursor');
  const cursorFollower = document.querySelector('.custom-cursor-follower');

  if (cursor && cursorFollower) {
    let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    let fx = cx, fy = cy;

    window.addEventListener('mousemove', (e) => {
      cx = e.clientX;
      cy = e.clientY;
    });

    function animateCursorFollow() {
      fx += (cx - fx) * 0.15;
      fy += (cy - fy) * 0.15;

      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      cursorFollower.style.transform = `translate(${fx}px, ${fy}px) translate(-50%, -50%)`;

      requestAnimationFrame(animateCursorFollow);
    }
    animateCursorFollow();

    const clickables = document.querySelectorAll('a, button, input, textarea, canvas');
    clickables.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
        cursorFollower.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover');
        cursorFollower.classList.remove('hover');
      });
    });
  }

})();


/* ============================================================
   SCROLL REVEAL — About section
   ============================================================ */
(function () {
  'use strict';

  /* ── Reveal elements on scroll ────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  /* ── Goal bars — animate width on scroll-into-view ───── */
  const goalBars = document.querySelectorAll('.goal-bar-fill');

  const barObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Small delay so the reveal animation can start first
          setTimeout(() => {
            entry.target.classList.add('animate');
          }, 300);
          barObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  goalBars.forEach((bar) => barObserver.observe(bar));

})();


/* ============================================================
   SKILL BARS — Tech Stack section
   ============================================================ */
(function () {
  'use strict';

  const skillItems = document.querySelectorAll('.skill-item[data-level]');

  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const item = entry.target;
          const level = item.getAttribute('data-level') || '0';
          const fill = item.querySelector('.skill-bar-fill');
          if (fill) {
            fill.style.setProperty('--bar-w', level + '%');
            setTimeout(() => fill.classList.add('animate'), 200);
          }
          skillObserver.unobserve(item);
        }
      });
    },
    { threshold: 0.3 }
  );

  skillItems.forEach((item) => skillObserver.observe(item));

})();


/* ============================================================
   GITHUB API — Dynamic Data
   ============================================================ */
(function () {
  'use strict';

  const username = 'KvalixX';
  const repoCountEl = document.getElementById('gh-repo-count');

  if (!repoCountEl) return;

  async function fetchGitHubData() {
    try {
      // Fetch User Info for stats
      const userRes = await fetch(`https://api.github.com/users/${username}`);
      const userData = await userRes.json();

      if (userData.public_repos !== undefined) {
        repoCountEl.setAttribute('data-count', userData.public_repos);
        // Trigger counter animation
        if (typeof animateCounter === 'function') {
          animateCounter(repoCountEl);
        } else {
          repoCountEl.dispatchEvent(new CustomEvent('countUpdate'));
        }
      }
    } catch (err) {
      console.error('GitHub API Error:', err);
    }
  }

  // Load data when section is near
  const ghSection = document.querySelector('.github-stats');
  if (ghSection) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchGitHubData();
        observer.unobserve(ghSection);
      }
    }, { threshold: 0.1 });
    observer.observe(ghSection);
  }

})();


/* ============================================================
   GITHUB STAT COUNTERS — animate numbers on scroll
   ============================================================ */
(function () {
  'use strict';

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const duration = 1600;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(ease * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString();
    }

    requestAnimationFrame(tick);
  }

  const counters = document.querySelectorAll('.gh-stat-num[data-count]');
  if (!counters.length) return;

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      animateCounter(el);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach((el) => {
    counterObserver.observe(el);
    // Add listener for dynamic updates
    el.addEventListener('countUpdate', () => animateCounter(el));
  });

})();


/* ============================================================
   CONTACT FORM — Real Dynamic Submission (Formspree)
   ============================================================ */
(function () {
  'use strict';

  const form = document.getElementById('contact-form');
  if (!form) return;

  const success = document.getElementById('form-success');
  const btn = document.getElementById('form-submit-btn');
  // NOTE: This is your real Formspree endpoint.
  const formspreeEndpoint = 'https://formspree.io/f/mzdognpd';

  // Security: Input sanitization function to prevent XSS
  function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Security: Validate email format
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Security: Check for suspicious patterns
  function containsSuspiciousContent(text) {
    const suspiciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
      /expression\s*\(/gi
    ];
    return suspiciousPatterns.some(pattern => pattern.test(text));
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!btn || !success) return;

    // Security: Check honeypot field - if filled, likely a bot
    const honeypot = form.querySelector('input[name="website"]');
    if (honeypot && honeypot.value) {
      console.warn('Honeypot triggered - possible bot detected');
      return;
    }

    // Security: Get and sanitize form data
    const nameInput = form.querySelector('#contact-name');
    const emailInput = form.querySelector('#contact-mail');
    const subjectInput = form.querySelector('#contact-subject');
    const messageInput = form.querySelector('#contact-message');

    const name = sanitizeInput(nameInput.value.trim());
    const email = emailInput.value.trim().toLowerCase();
    const subject = sanitizeInput(subjectInput ? subjectInput.value.trim() : '');
    const message = sanitizeInput(messageInput.value.trim());

    // Security: Client-side validation
    if (!name || name.length < 2 || name.length > 100) {
      alert('Veuillez entrer un nom valide (2-100 caractères).');
      return;
    }

    if (!isValidEmail(email)) {
      alert('Veuillez entrer une adresse email valide.');
      return;
    }

    if (!message || message.length < 10 || message.length > 5000) {
      alert('Veuillez entrer un message valide (10-5000 caractères).');
      return;
    }

    // Security: Check for suspicious content
    const combinedText = name + ' ' + subject + ' ' + message;
    if (containsSuspiciousContent(combinedText)) {
      alert('Contenu non autorisé détecté. Veuillez retirer tout code ou script.');
      return;
    }

    // Loading state
    btn.disabled = true;
    btn.style.opacity = '0.6';
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<span>Envoi en cours…</span>';

    // Create sanitized form data
    const sanitizedFormData = new FormData();
    sanitizedFormData.append('name', name);
    sanitizedFormData.append('email', email);
    sanitizedFormData.append('subject', subject || 'Nouveau message du portfolio');
    sanitizedFormData.append('message', message);
    sanitizedFormData.append('_gotcha', ''); // Additional honeypot for Formspree

    try {
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        body: sanitizedFormData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Success
        form.reset();
        success.classList.add('visible');
        btn.style.display = 'none';

        setTimeout(() => {
          success.classList.remove('visible');
          btn.style.display = '';
          btn.disabled = false;
          btn.style.opacity = '';
          btn.innerHTML = originalContent;
        }, 5000);
      } else {
        const data = await response.json();
        if (Object.hasOwn(data, 'errors')) {
          alert(data["errors"].map(error => error["message"]).join(", "));
        } else {
          alert("Oups ! Un problème est survenu lors de l'envoi.");
        }
        resetBtn();
      }
    } catch (error) {
      alert("Erreur de connexion. Veuillez réessayer plus tard.");
      resetBtn();
    }

    function resetBtn() {
      btn.disabled = false;
      btn.style.opacity = '';
      btn.innerHTML = originalContent;
    }
  });


  /* ── HEADER INTERACTIONS ────────────────────────────────── */
  const header = document.getElementById('main-header');
  const mobileToggle = document.getElementById('mobile-toggle');
  const headerNav = document.getElementById('header-nav');
  const navLinks = document.querySelectorAll('.nav-link, .nav-cta');

  // Sticky Scroll Effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile Menu Toggle
  mobileToggle.addEventListener('click', () => {
    mobileToggle.classList.toggle('active');
    headerNav.classList.toggle('active');
    document.body.style.overflow = headerNav.classList.contains('active') ? 'hidden' : '';
  });

  // Close menu on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileToggle.classList.remove('active');
      headerNav.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

})();


/* ============================================================
   LANGUAGE SWITCHER
   ============================================================ */
(function() {
  'use strict';

  const translations = {
    en: {
      'nav.about': 'About',
      'nav.skills': 'Skills',
      'nav.projects': 'Projects',
      'nav.certifications': 'Certifications',
      'nav.contact': 'Contact Me',
      'nav.services': 'Services',
      'logo.top': 'LAKNIFLI',
      'logo.bottom': 'KHALIL',
      'hero.name1': 'Laknifli',
      'hero.name2': 'Khalil',
      'hero.sideText': 'LAKNIFLI KHALIL',
      'hero.description': 'Future Computer Science & Networks Engineer. Full-Stack Developer passionate about AI.',
      'hero.contactBtn': 'Contact Me',
      'hero.downloadCV': 'Download CV',
      'hero.scroll': 'SCROLL',
      'about.sectionTitle': 'ABOUT',
      'about.eyebrow': 'Who am I?',
      'about.heading.line1': 'Turning ideas',
      'about.heading.line2': 'into',
      'about.heading.line3': 'Realities.',
      'about.text1': 'Future <strong>Computer Science & Networks Engineer</strong> at EMSI, I am a Full-Stack Developer passionate about the intersection between code and <strong>Artificial Intelligence</strong>.',
      'about.text2': 'For over 2 years, I have been designing digital solutions that combine technical performance and refined aesthetics. My approach is based on insatiable curiosity and a constant desire to push the boundaries of what\'s possible.',
      'about.contactBtn': 'Contact Me',
      'about.journey.title': 'My Journey',
      'about.journey.present': 'Present',
      'about.journey.item1.title': 'Computer Science & Networks Engineering',
      'about.journey.item2.title': 'Full-Stack Digital Development',
      'about.journey.item3.title': 'Baccalaureate in Physical Sciences',
      'skills.sectionTitle': 'TECH STACK',
      'skills.heading1': 'Skills &',
      'skills.heading2': 'Technologies',
      'skills.subtitle': 'Versatile expertise covering development, infrastructure and AI.',
      'projects.sectionTitle': 'PROJECTS',
      'projects.heading1': 'My',
      'projects.heading2': 'Projects',
      'projects.subtitle': 'Concrete solutions I have designed, developed and deployed.',
      'projects.proj1.desc': 'AI-powered phishing simulation platform with human risk scoring: AI-generated phishing emails and sending, user behavior analysis, with AI-generated personalized training based on risk level.',
      'projects.proj2.desc': 'Travel agency: Online booking for tours, excursions & events with quote requests and admin space for managing offers and reservations.',
      'projects.proj3.desc': 'Private transport agency: Trip booking, ride and driver management, as well as service optimization via a statistical dashboard.',
      'projects.proj4.desc': 'Gym management platform with e-commerce section for supplements: member management, classes, subscriptions, purchases and trainer applications, with analytical admin dashboard.',
      'projects.proj5.desc': 'Travel agency: Online booking for tours, excursions & events with quote requests and admin space for managing offers and reservations.',
      'projects.proj6.desc': 'Web agency: Design and development of custom websites for various clients, integrating front-end, back-end and UX/UI optimization to ensure performance and user experience.',
      'projects.liveDemo': 'Live Demo',
      'projects.code': 'Code',
      'certifications.sectionTitle': 'CERTIFICATIONS',
      'certifications.heading1': 'Certifi',
      'certifications.heading2': 'cations',
      'certifications.subtitle': 'Certified training validating my technical skills.',
      'certifications.verified': 'Verified',
      'services.sectionTitle': 'SERVICES',
      'services.heading1': 'What I',
      'services.heading2': 'offer',
      'services.subtitle': 'Freelance services tailored to your digital needs.',
      'services.web.title': 'Web Development',
      'services.web.desc': 'Showcase sites, web applications and custom dashboards with the best modern frameworks.',
      'services.web.item1': 'React / Next.js / Vue.js',
      'services.web.item2': 'Responsive & animated UI',
      'services.web.item3': 'Performance & SEO',
      'services.api.title': 'API Development',
      'services.api.desc': 'Design and development of robust, documented and secure RESTful APIs for your applications.',
      'services.perf.title': 'Performance Optimization',
      'services.perf.desc': 'Audit and optimization of your applications for ultra-fast loading times and better UX.',
      'services.ai.title': 'AI & Data Science',
      'services.ai.desc': 'Integration of AI models into your products: classification, prediction, NLP and computer vision.',
      'services.cta': 'Contact Me',
      'testimonials.sectionTitle': 'TESTIMONIALS',
      'testimonials.heading1': 'What they',
      'testimonials.heading2': 'say',
      'testimonials.t1.text': 'Khalil delivered exceptional work. His interface is not only beautiful but also perfectly functional. A true professional.',
      'testimonials.t1.role': 'CEO — Tech Startup',
      'testimonials.t2.text': 'Very rigorous and creative. The NLP project he led for our lab exceeded all our expectations in terms of accuracy and documentation.',
      'testimonials.t2.role': 'Thesis Director — University',
      'testimonials.t3.text': 'Our e-commerce site saw conversions increase by 40% after Khalil\'s redesign. Excellent attention to detail and respect for deadlines.',
      'testimonials.t3.role': 'Founder — Online Store',
      'github.sectionTitle': 'GITHUB',
      'github.heading1': 'GitHub',
      'github.heading2': 'Activity',
      'github.subtitle': 'My open source activity and daily contributions.',
      'github.stat1': 'Contributions (2024)',
      'github.stat2': 'Public Repositories',
      'github.stat4': 'Recent Commits',
      'github.graphLabel': 'Contribution graph — Dynamic',
      'github.less': 'Less',
      'github.more': 'More',
      'contact.sectionTitle': 'CONTACT',
      'contact.heading1': 'Let\'s work',
      'contact.heading2': 'together',
      'contact.subtitle': 'Available for full-time opportunities, freelance missions or collaborations on ambitious projects.',
      'contact.upworkValue': 'Freelance Profile',
      'contact.form.name': 'Name',
      'contact.form.namePlaceholder': 'Your name',
      'contact.form.subject': 'Subject',
      'contact.form.subjectPlaceholder': 'Subject of your message',
      'contact.form.message': 'Message',
      'contact.form.messagePlaceholder': 'Describe your project or request...',
      'contact.form.send': 'Send Message',
      'contact.form.success': 'Message sent! I will reply within 24 hours.',
      'footer.tagline': 'Full-Stack Developer & AI Engineer.<br>Building the future, one line at a time.',
      'footer.navTitle': 'Navigation',
      'footer.expertiseTitle': 'Expertise',
      'footer.expertise1': 'Web Development',
      'footer.expertise3': 'Artificial Intelligence',
      'footer.expertise4': 'Performance Optimization'
    },
    fr: {
      'nav.about': 'À Propos',
      'nav.skills': 'Skills',
      'nav.projects': 'Projets',
      'nav.certifications': 'Certifications',
      'nav.contact': 'Me contacter',
      'nav.services': 'Services',
      'logo.top': 'LAKNIFLI',
      'logo.bottom': 'KHALIL',
      'hero.name1': 'Laknifli',
      'hero.name2': 'Khalil',
      'hero.sideText': 'LAKNIFLI KHALIL',
      'hero.description': 'Futur ingénieur en Génie Informatique & Réseaux. Développeur Full-Stack passionné par l\'IA.',
      'hero.contactBtn': 'Me contacter',
      'hero.downloadCV': 'Télécharger CV',
      'hero.scroll': 'SCROLL',
      'about.sectionTitle': 'À PROPOS',
      'about.eyebrow': 'Qui suis-je ?',
      'about.heading.line1': 'Transformer des idées',
      'about.heading.line2': 'en',
      'about.heading.line3': 'Réalités numériques.',
      'about.text1': 'Futur ingénieur en <strong>Génie Informatique & Réseaux</strong> à l\'EMSI, je suis un développeur Full-Stack passionné par l\'intersection entre le code et l\'<strong>Intelligence Artificielle</strong>.',
      'about.text2': 'Depuis plus de 2 ans, je conçois des solutions digitales qui allient performance technique et esthétique raffinée. Mon approche repose sur une curiosité insatiable et une volonté constante de repousser les limites du possible.',
      'about.contactBtn': 'Me contacter',
      'about.journey.title': 'Mon Parcours',
      'about.journey.present': 'En cours',
      'about.journey.item1.title': 'Ingénierie Informatique & Réseaux',
      'about.journey.item2.title': 'Développement Digital Full-Stack',
      'about.journey.item3.title': 'Baccalauréat Sciences Physiques',
      'skills.sectionTitle': 'TECH STACK',
      'skills.heading1': 'Skills &',
      'skills.heading2': 'Technologies',
      'skills.subtitle': 'Une expertise polyvalente couvrant le développement, l\'infrastructure et l\'IA.',
      'projects.sectionTitle': 'PROJETS',
      'projects.heading1': 'Mes',
      'projects.heading2': 'Projets',
      'projects.subtitle': 'Des solutions concrètes que j\'ai conçues, développées et déployées.',
      'projects.proj1.desc': 'Plateforme IA de simulation de phishing réaliste, scoring du risque humain : génération d\'e-mails de phishing via IA et envoi, analyse du comportement utilisateur, avec génération de formations personnalisées par IA selon le niveau de risque.',
      'projects.proj2.desc': 'Agence de voyage : Réservation en ligne de circuits, excursions & événements avec demande de devis et espace administrateur pour la gestion des offres et réservations.',
      'projects.proj3.desc': 'Agence de transport privé : Réservation de trajets, la gestion des courses et des chauffeurs, ainsi que l\'optimisation des services via un tableau de bord statistique.',
      'projects.proj4.desc': 'Plateforme de gestion de salle de sport avec partie e-commerce de compléments : gestion des membres, cours, abonnements, achats et candidatures d\'entraîneurs, avec dashboard admin analytique.',
      'projects.proj5.desc': 'Agence de voyage : Réservation en ligne de circuits, excursions & événements avec demande de devis et espace administrateur pour la gestion des offres et réservations.',
      'projects.proj6.desc': 'Agence web : Conception et développement de sites web sur mesure pour divers clients, intégrant les aspects front-end, back-end et optimisation UX/UI pour garantir performance et expérience utilisateur.',
      'projects.liveDemo': 'Live Demo',
      'projects.code': 'Code',
      'certifications.sectionTitle': 'CERTIFICATIONS',
      'certifications.heading1': 'Certifi',
      'certifications.heading2': 'cations',
      'certifications.subtitle': 'Formations certifiées validant mes compétences techniques.',
      'certifications.verified': 'Vérifié',
      'services.sectionTitle': 'SERVICES',
      'services.heading1': 'Ce que je',
      'services.heading2': 'propose',
      'services.subtitle': 'Des prestations freelance adaptées à vos besoins digitaux.',
      'services.web.title': 'Web Development',
      'services.web.desc': 'Sites vitrines, applications web et dashboards sur mesure avec les meilleurs frameworks modernes.',
      'services.web.item1': 'React / Next.js / Vue.js',
      'services.web.item2': 'UI responsive & animée',
      'services.web.item3': 'Performance & SEO',
      'services.api.title': 'API Development',
      'services.api.desc': 'Conception et développement d\'APIs RESTful robustes, documentées et sécurisées pour vos applications.',
      'services.perf.title': 'Performance Optimization',
      'services.perf.desc': 'Audit et optimisation de vos applications pour des temps de chargement ultra-rapides et une meilleure UX.',
      'services.ai.title': 'IA & Data Science',
      'services.ai.desc': 'Intégration de modèles d\'IA dans vos produits : classification, prédiction, NLP et computer vision.',
      'services.cta': 'Me contacter',
      'testimonials.sectionTitle': 'TÉMOIGNAGES',
      'testimonials.heading1': 'Ce qu\'ils',
      'testimonials.heading2': 'disent',
      'testimonials.t1.text': 'Khalil a livré un travail exceptionnel. Son interface est non seulement belle mais aussi parfaitement fonctionnelle. Un vrai professionnel.',
      'testimonials.t1.role': 'CEO — Startup Tech',
      'testimonials.t2.text': 'Très rigoureux et créatif. Le projet NLP qu\'il a mené pour notre labo dépassait toutes nos attentes en termes de précision et de documentation.',
      'testimonials.t2.role': 'Directeur de thèse — Université',
      'testimonials.t3.text': 'Notre site e-commerce a vu ses conversions augmenter de 40% après la refonte par Khalil. Excellent sens du détail et respect des délais.',
      'testimonials.t3.role': 'Fondatrice — Boutique Online',
      'github.sectionTitle': 'GITHUB',
      'github.heading1': 'Activité',
      'github.heading2': 'GitHub',
      'github.subtitle': 'Mon activité open source et mes contributions au quotidien.',
      'github.stat1': 'Contributions (2024)',
      'github.stat2': 'Repositories publics',
      'github.stat4': 'Commits récents',
      'github.graphLabel': 'Contribution graph — Dynamique',
      'github.less': 'Moins',
      'github.more': 'Plus',
      'contact.sectionTitle': 'CONTACT',
      'contact.heading1': 'Travaillons',
      'contact.heading2': 'ensemble',
      'contact.subtitle': 'Disponible pour des opportunités full-time, des missions freelance ou des collaborations sur des projets ambitieux.',
      'contact.upworkValue': 'Profil Freelance',
      'contact.form.name': 'Nom',
      'contact.form.namePlaceholder': 'Votre nom',
      'contact.form.subject': 'Sujet',
      'contact.form.subjectPlaceholder': 'Objet de votre message',
      'contact.form.message': 'Message',
      'contact.form.messagePlaceholder': 'Décrivez votre projet ou votre demande...',
      'contact.form.send': 'Envoyer le message',
      'contact.form.success': 'Message envoyé ! Je vous répondrai sous 24h.',
      'footer.tagline': 'Développeur Full-Stack & Ingénieur IA.<br>Construire le futur, une ligne à la fois.',
      'footer.navTitle': 'Navigation',
      'footer.expertiseTitle': 'Expertises',
      'footer.expertise1': 'Développement Web',
      'footer.expertise3': 'Intelligence Artificielle',
      'footer.expertise4': 'Optimisation Performance'
    },
    es: {
      'nav.about': 'Sobre mí',
      'nav.skills': 'Habilidades',
      'nav.projects': 'Proyectos',
      'nav.certifications': 'Certificaciones',
      'nav.contact': 'Contactarme',
      'nav.services': 'Servicios',
      'logo.top': 'LAKNIFLI',
      'logo.bottom': 'KHALIL',
      'hero.name1': 'Laknifli',
      'hero.name2': 'Khalil',
      'hero.sideText': 'LAKNIFLI KHALIL',
      'hero.description': 'Futuro Ingeniero en Ciencias de la Computación y Redes. Desarrollador Full-Stack apasionado por la IA.',
      'hero.contactBtn': 'Contactarme',
      'hero.downloadCV': 'Descargar CV',
      'hero.scroll': 'SCROLL',
      'about.sectionTitle': 'SOBRE MÍ',
      'about.eyebrow': '¿Quién soy?',
      'about.heading.line1': 'Convirtiendo ideas',
      'about.heading.line2': 'en',
      'about.heading.line3': 'Realidades digitales.',
      'about.text1': 'Futuro <strong>Ingeniero en Ciencias de la Computación y Redes</strong> en EMSI, soy un Desarrollador Full-Stack apasionado por la intersección entre el código y la <strong>Inteligencia Artificial</strong>.',
      'about.text2': 'Durante más de 2 años, he estado diseñando soluciones digitales que combinan rendimiento técnico y estética refinada. Mi enfoque se basa en una curiosidad insaciable y un deseo constante de empujar los límites de lo posible.',
      'about.contactBtn': 'Contactarme',
      'about.journey.title': 'Mi Trayectoria',
      'about.journey.present': 'Presente',
      'about.journey.item1.title': 'Ingeniería en Ciencias de la Computación y Redes',
      'about.journey.item2.title': 'Desarrollo Digital Full-Stack',
      'about.journey.item3.title': 'Bachillerato en Ciencias Físicas',
      'skills.sectionTitle': 'TECH STACK',
      'skills.heading1': 'Habilidades y',
      'skills.heading2': 'Tecnologías',
      'skills.subtitle': 'Experiencia versátil que cubre desarrollo, infraestructura e IA.',
      'projects.sectionTitle': 'PROYECTOS',
      'projects.heading1': 'Mis',
      'projects.heading2': 'Proyectos',
      'projects.subtitle': 'Soluciones concretas que he diseñado, desarrollado y desplegado.',
      'projects.proj1.desc': 'Plataforma de simulación de phishing impulsada por IA con puntuación de riesgo humano: correos de phishing generados por IA y envío, análisis de comportamiento del usuario, con capacitación personalizada generada por IA según el nivel de riesgo.',
      'projects.proj2.desc': 'Agencia de viajes: Reserva en línea de tours, excursiones y eventos con solicitudes de cotización y espacio de administración para gestionar ofertas y reservas.',
      'projects.proj3.desc': 'Agencia de transporte privado: Reserva de viajes, gestión de carreras y conductores, así como optimización de servicios a través de un panel estadístico.',
      'projects.proj4.desc': 'Plataforma de gestión de gimnasio con sección de comercio electrónico para suplementos: gestión de miembros, clases, suscripciones, compras y solicitudes de entrenadores, con panel de administración analítico.',
      'projects.proj5.desc': 'Agencia de viajes: Reserva en línea de tours, excursiones y eventos con solicitudes de cotización y espacio de administración para gestionar ofertas y reservas.',
      'projects.proj6.desc': 'Agencia web: Diseño y desarrollo de sitios web personalizados para diversos clientes, integrando front-end, back-end y optimización UX/UI para garantizar rendimiento y experiencia de usuario.',
      'projects.liveDemo': 'Demo en Vivo',
      'projects.code': 'Código',
      'certifications.sectionTitle': 'CERTIFICACIONES',
      'certifications.heading1': 'Certifica',
      'certifications.heading2': 'ciones',
      'certifications.subtitle': 'Formación certificada que valida mis habilidades técnicas.',
      'certifications.verified': 'Verificado',
      'services.sectionTitle': 'SERVICIOS',
      'services.heading1': 'Lo que',
      'services.heading2': 'ofrezco',
      'services.subtitle': 'Servicios freelance adaptados a sus necesidades digitales.',
      'services.web.title': 'Desarrollo Web',
      'services.web.desc': 'Sitios de exhibición, aplicaciones web y dashboards personalizados con los mejores frameworks modernos.',
      'services.web.item1': 'React / Next.js / Vue.js',
      'services.web.item2': 'UI responsive y animada',
      'services.web.item3': 'Rendimiento y SEO',
      'services.api.title': 'Desarrollo de APIs',
      'services.api.desc': 'Diseño y desarrollo de APIs RESTful robustas, documentadas y seguras para sus aplicaciones.',
      'services.perf.title': 'Optimización de Rendimiento',
      'services.perf.desc': 'Auditoría y optimización de sus aplicaciones para tiempos de carga ultrarrápidos y mejor UX.',
      'services.ai.title': 'IA y Ciencia de Datos',
      'services.ai.desc': 'Integración de modelos de IA en sus productos: clasificación, predicción, NLP y visión por computadora.',
      'services.cta': 'Contactarme',
      'testimonials.sectionTitle': 'TESTIMONIOS',
      'testimonials.heading1': 'Lo que',
      'testimonials.heading2': 'dicen',
      'testimonials.t1.text': 'Khalil entregó un trabajo excepcional. Su interfaz no solo es hermosa sino también perfectamente funcional. Un verdadero profesional.',
      'testimonials.t1.role': 'CEO — Startup Tech',
      'testimonials.t2.text': 'Muy riguroso y creativo. El proyecto de NLP que lideró para nuestro laboratorio superó todas nuestras expectativas en términos de precisión y documentación.',
      'testimonials.t2.role': 'Director de Tesis — Universidad',
      'testimonials.t3.text': 'Nuestro sitio de comercio electrónico vio aumentar sus conversiones en un 40% después del rediseño de Khalil. Excelente atención al detalle y respeto por los plazos.',
      'testimonials.t3.role': 'Fundadora — Tienda Online',
      'github.sectionTitle': 'GITHUB',
      'github.heading1': 'Actividad',
      'github.heading2': 'GitHub',
      'github.subtitle': 'Mi actividad open source y contribuciones diarias.',
      'github.stat1': 'Contribuciones (2024)',
      'github.stat2': 'Repositorios Públicos',
      'github.stat4': 'Commits Recientes',
      'github.graphLabel': 'Gráfico de contribuciones — Dinámico',
      'github.less': 'Menos',
      'github.more': 'Más',
      'contact.sectionTitle': 'CONTACTO',
      'contact.heading1': 'Trabajemos',
      'contact.heading2': 'juntos',
      'contact.subtitle': 'Disponible para oportunidades full-time, misiones freelance o colaboraciones en proyectos ambiciosos.',
      'contact.upworkValue': 'Perfil Freelance',
      'contact.form.name': 'Nombre',
      'contact.form.namePlaceholder': 'Tu nombre',
      'contact.form.subject': 'Asunto',
      'contact.form.subjectPlaceholder': 'Asunto de tu mensaje',
      'contact.form.message': 'Mensaje',
      'contact.form.messagePlaceholder': 'Describe tu proyecto o solicitud...',
      'contact.form.send': 'Enviar Mensaje',
      'contact.form.success': '¡Mensaje enviado! Te responderé en 24 horas.',
      'footer.tagline': 'Desarrollador Full-Stack e Ingeniero de IA.<br>Construyendo el futuro, una línea a la vez.',
      'footer.navTitle': 'Navegación',
      'footer.expertiseTitle': 'Experiencia',
      'footer.expertise1': 'Desarrollo Web',
      'footer.expertise3': 'Inteligencia Artificial',
      'footer.expertise4': 'Optimización de Rendimiento'
    },
    ar: {
      'nav.about': 'عني',
      'nav.skills': 'المهارات',
      'nav.projects': 'المشاريع',
      'nav.certifications': 'الشهادات',
      'nav.contact': 'تواصل معي',
      'nav.services': 'الخدمات',
      'logo.top': 'لقنيفلي',
      'logo.bottom': 'خليل',
      'hero.name1': 'لقنيفلي',
      'hero.name2': 'خليل',
      'hero.sideText': 'لقنيفلي خليل',
      'hero.description': 'مهندس حاسوب وشبكات مستقبلي. مطور Full-Stack شغوف بالذكاء الاصطناعي.',
      'hero.contactBtn': 'تواصل معي',
      'hero.downloadCV': 'تحميل السيرة الذاتية',
      'hero.scroll': 'اسحب للأسفل',
      'about.sectionTitle': 'نبذة عني',
      'about.eyebrow': 'من أنا؟',
      'about.heading.line1': 'تحويل الأفكار',
      'about.heading.line2': 'إلى',
      'about.heading.line3': 'واقع رقمي.',
      'about.text1': 'مهندس <strong>حاسوب وشبكات</strong> مستقبلي في EMSI، أنا مطور Full-Stack شغوف بتقاطع البرمجة و<strong>الذكاء الاصطناعي</strong>.',
      'about.text2': 'لأكثر من عامين، أقوم بتصميم حلول رقمية تجمع بين الأداء التقني والجماليات الرفيعة. يعتمد نهجي على فضول لا ينتهي ورغبة دائمة في دفع حدود الممكن.',
      'about.contactBtn': 'تواصل معي',
      'about.journey.title': 'مسيرتي',
      'about.journey.present': 'الحاضر',
      'about.journey.item1.title': 'هندسة الحاسوب والشبكات',
      'about.journey.item2.title': 'تطوير Full-Stack الرقمي',
      'about.journey.item3.title': 'البكالوريا علوم فيزيائية',
      'skills.sectionTitle': 'المهارات التقنية',
      'skills.heading1': 'المهارات و',
      'skills.heading2': 'التقنيات',
      'skills.subtitle': 'خبرة متعددة الأوجه تشمل التطوير والبنية التحتية والذكاء الاصطناعي.',
      'projects.sectionTitle': 'المشاريع',
      'projects.heading1': 'مشاريع',
      'projects.heading2': 'الخاصة',
      'projects.subtitle': 'حلول ملموسة صممتها وطورتها ونشرتها.',
      'projects.proj1.desc': 'منصة محاكاة تصيد احتيالي مدعومة بالذكاء الاصطناعي مع تقييم المخاطر البشرية: رسائل تصيد احتيالي مولدة بالذكاء الاصطناعي وإرسالها، تحليل سلوك المستخدم، مع تدريب مخصص مولد بالذكاء الاصطناعي بناءً على مستوى المخاطر.',
      'projects.proj2.desc': 'وكالة سفر: حجز جولات ورحلات وفعاليات عبر الإنترنت مع طلبات عروض أسعار ومساحة إدارة لإدارة العروض والحجوزات.',
      'projects.proj3.desc': 'وكالة نقل خاصة: حجز الرحلات، إدارة الرحلات والسائقين، وكذلك تحسين الخدمات عبر لوحة تحكم إحصائية.',
      'projects.proj4.desc': 'منصة إدارة صالة رياضية مع قسم تجارة إلكترونية للمكملات الغذائية: إدارة الأعضاء، الدروس، الاشتراكات، المشتريات وطلبات المدربين، مع لوحة تحكم إدارية تحليلية.',
      'projects.proj5.desc': 'وكالة سفر: حجز جولات ورحلات وفعاليات عبر الإنترنت مع طلبات عروض أسعار ومساحة إدارة لإدارة العروض والحجوزات.',
      'projects.proj6.desc': 'وكالة ويب: تصميم وتطوير مواقع ويب مخصصة لعملاء متنوعين، مع تكامل الواجهة الأمامية والخلفية وتحسين UX/UI لضمان الأداء وتجربة المستخدم.',
      'projects.liveDemo': 'عرض مباشر',
      'projects.code': 'الشفرة المصدرية',
      'certifications.sectionTitle': 'الشهادات',
      'certifications.heading1': 'الشهادات',
      'certifications.heading2': 'المعتمدة',
      'certifications.subtitle': 'تدريب معتمد يثبت مهاراتي التقنية.',
      'certifications.verified': 'موثق',
      'services.sectionTitle': 'الخدمات',
      'services.heading1': 'الخدمات',
      'services.heading2': 'المقدمة',
      'services.subtitle': 'خدمات مستقلة مصممة حسب احتياجاتك الرقمية.',
      'services.web.title': 'تطوير الويب',
      'services.web.desc': 'مواقع عرض، تطبيقات ويب ولوحات تحكم مخصصة بأفضل الأطر الحديثة.',
      'services.web.item1': 'React / Next.js / Vue.js',
      'services.web.item2': 'واجهة متجاوبة ومتحركة',
      'services.web.item3': 'الأداء وتحسين محركات البحث',
      'services.api.title': 'تطوير واجهات API',
      'services.api.desc': 'تصميم وتطوير واجهات RESTful قوية وموثقة وآمنة لتطبيقاتك.',
      'services.perf.title': 'تحسين الأداء',
      'services.perf.desc': 'تدقيق وتحسين تطبيقاتك لأوقات تحميل فائقة السرعة وتجربة مستخدم أفضل.',
      'services.ai.title': 'الذكاء الاصطناعي وعلم البيانات',
      'services.ai.desc': 'دمج نماذج الذكاء الاصطناعي في منتجاتك: التصنيف، التنبؤ، معالجة اللغات الطبيعية ورؤية الحاسوب.',
      'services.cta': 'تواصل معي',
      'testimonials.sectionTitle': 'آراء العملاء',
      'testimonials.heading1': 'ما يقولون',
      'testimonials.heading2': 'عن عملي',
      'testimonials.t1.text': 'قدم خليل لقنيفلي عملاً استثنائياً. واجهته ليست جميلة فحسب بل وظيفية تماماً. محترف حقيقي.',
      'testimonials.t1.role': 'CEO — شركة ناشئة',
      'testimonials.t2.text': 'دقيق للغاية ومبدع. مشروع معالجة اللغات الطبيعية الذي قاده لمختبرنا تجاوز جميع توقعاتنا من حيث الدقة والتوثيق.',
      'testimonials.t2.role': 'مشرف رسالة — جامعة',
      'testimonials.t3.text': 'شهد موقعنا للتجارة الإلكترونية زيادة في التحويلات بنسبة 40% بعد إعادة التصميم من قبل خليل لقنيفلي. انتباه ممتاز للتفاصيل واحترام للمواعيد.',
      'testimonials.t3.role': 'مؤسسة — متجر إلكتروني',
      'github.heading1': 'GitHub',
      'github.heading2': 'النشاط',
      'github.subtitle': 'نشاطي مفتوح المصدر ومساهماتي اليومية.',
      'github.stat1': 'المساهمات (2024)',
      'github.stat2': 'المستودعات العامة',
      'github.stat4': 'الالتزامات الحديثة',
      'github.graphLabel': 'رسم بياني للمساهمات — تفاعلي',
      'github.less': 'أقل',
      'github.more': 'أكثر',
      'contact.sectionTitle': 'تواصل معي',
      'contact.heading1': 'لنعمل',
      'contact.heading2': 'معاً',
      'contact.subtitle': 'متاح لفرص العمل الكامل، المهام المستقلة أو التعاون في المشاريع الطموحة.',
      'contact.upworkValue': 'الملف المستقل',
      'contact.form.name': 'الاسم',
      'contact.form.namePlaceholder': 'اسمك',
      'contact.form.subject': 'الموضوع',
      'contact.form.subjectPlaceholder': 'موضوع رسالتك',
      'contact.form.message': 'الرسالة',
      'contact.form.messagePlaceholder': 'صف مشروعك أو طلبك...',
      'contact.form.send': 'إرسال الرسالة',
      'contact.form.success': 'تم إرسال الرسالة! سأرد عليك في غضون 24 ساعة.',
      'footer.tagline': 'مطور Full-Stack ومهندس ذكاء اصطناعي.<br>بناء المستقبل، سطراً بسطر.',
      'footer.navTitle': 'التنقل',
      'footer.expertiseTitle': 'الخبرة',
      'footer.expertise1': 'تطوير الويب',
      'footer.expertise2': 'تطوير واجهات API',
      'footer.expertise3': 'الذكاء الاصطناعي',
      'footer.expertise4': 'تحسين الأداء'
    }
  };

  const langToggle = document.getElementById('lang-toggle');
  const langDropdown = document.getElementById('lang-dropdown');
  const langOptions = document.querySelectorAll('.lang-option');
  const currentFlag = document.getElementById('current-flag');
  const currentCode = document.getElementById('current-code');

  // Get saved language or default to English
  let currentLang = localStorage.getItem('portfolio-lang') || 'en';

  function updateContent(lang) {
    const t = translations[lang];
    if (!t) return;

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key]) {
        el.innerHTML = t[key];
      }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (t[key]) {
        el.placeholder = t[key];
      }
    });

    // Update HTML lang attribute
    document.documentElement.lang = lang;

    // Update current language button
    const langData = {
      en: { flag: 'images/flags/gb.png', code: 'EN' },
      fr: { flag: 'images/flags/fr.png', code: 'FR' },
      es: { flag: 'images/flags/es.png', code: 'ES' },
      ar: { flag: 'images/flags/sa.png', code: 'AR' }
    };

    currentFlag.innerHTML = '<img src="' + langData[lang].flag + '" alt="' + langData[lang].code + '" class="flag-icon" />';
    currentCode.textContent = langData[lang].code;

    // Update active state in dropdown
    langOptions.forEach(opt => {
      opt.classList.toggle('active', opt.dataset.lang === lang);
    });

    // Save to localStorage
    localStorage.setItem('portfolio-lang', lang);

    // Update form validation messages based on language
    updateFormValidation(lang);
  }

  function updateFormValidation(lang) {
    const formMessages = {
      en: {
        nameError: 'Please enter a valid name (2-100 characters).',
        emailError: 'Please enter a valid email address.',
        messageError: 'Please enter a valid message (10-5000 characters).',
        suspiciousError: 'Unauthorized content detected. Please remove any code or scripts.',
        sending: 'Sending...',
        connectionError: 'Connection error. Please try again later.'
      },
      fr: {
        nameError: 'Veuillez entrer un nom valide (2-100 caractères).',
        emailError: 'Veuillez entrer une adresse email valide.',
        messageError: 'Veuillez entrer un message valide (10-5000 caractères).',
        suspiciousError: 'Contenu non autorisé détecté. Veuillez retirer tout code ou script.',
        sending: 'Envoi en cours…',
        connectionError: 'Erreur de connexion. Veuillez réessayer plus tard.'
      },
      es: {
        nameError: 'Por favor ingrese un nombre válido (2-100 caracteres).',
        emailError: 'Por favor ingrese una dirección de correo válida.',
        messageError: 'Por favor ingrese un mensaje válido (10-5000 caracteres).',
        suspiciousError: 'Contenido no autorizado detectado. Por favor elimine cualquier código o script.',
        sending: 'Enviando...',
        connectionError: 'Error de conexión. Por favor intente más tarde.'
      },
      ar: {
        nameError: 'الرجاء إدخال اسم صالح (2-100 حرف).',
        emailError: 'الرجاء إدخال عنوان بريد إلكتروني صالح.',
        messageError: 'الرجاء إدخال رسالة صالحة (10-5000 حرف).',
        suspiciousError: 'تم اكتشاف محتوى غير مصرح به. الرجاء إزالة أي رمز أو برنامج نصي.',
        sending: 'جارٍ الإرسال...',
        connectionError: 'خطأ في الاتصال. الرجاء المحاولة مرة أخرى لاحقاً.'
      }
    };

    // Store current validation messages for form handler
    window.currentValidationMessages = formMessages[lang] || formMessages.en;
  }

  // Toggle dropdown
  if (langToggle) {
    langToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      langToggle.classList.toggle('active');
      langDropdown.classList.toggle('active');
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    if (langToggle && langDropdown) {
      langToggle.classList.remove('active');
      langDropdown.classList.remove('active');
    }
  });

  // Language selection
  langOptions.forEach(option => {
    option.addEventListener('click', () => {
      const lang = option.dataset.lang;
      currentLang = lang;
      updateContent(lang);
    });
  });

  // Initialize with saved language
  updateContent(currentLang);

  // Expose for debugging
  window.setLanguage = (lang) => {
    if (translations[lang]) {
      currentLang = lang;
      updateContent(lang);
    }
  };
})();
