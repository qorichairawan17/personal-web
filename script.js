/* ==========================================================================
   Qori Chairawan — Interactive Experience, GSAP Animations & Theme Engine
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Dynamic footer year
  const yearEl = document.querySelector("[data-year]");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* --------------------------------------------------------------------------
     1. Theme Engine (Dark / Light Theme — Default to System Preference)
     -------------------------------------------------------------------------- */
  const themeToggle = document.getElementById("themeToggle");
  const mobileThemeToggle = document.getElementById("mobileThemeToggle");
  const metaThemeColor = document.getElementById("metaThemeColor");
  const systemMedia = window.matchMedia("(prefers-color-scheme: dark)");

  const applyTheme = (theme, save = true) => {
    document.documentElement.setAttribute("data-theme", theme);
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        theme === "dark" ? "#06070b" : "#f8fafc"
      );
    }
    if (save) {
      localStorage.setItem("theme", theme);
    }
    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
  };

  // Determine initial theme
  const savedTheme = localStorage.getItem("theme");
  const initialTheme = savedTheme
    ? savedTheme
    : systemMedia.matches
      ? "dark"
      : "light";
  applyTheme(initialTheme, false);

  // Listen for system appearance change if user has not explicitly locked a theme
  systemMedia.addEventListener("change", (e) => {
    if (!localStorage.getItem("theme")) {
      applyTheme(e.matches ? "dark" : "light", false);
    }
  });

  const handleToggle = () => {
    const current =
      document.documentElement.getAttribute("data-theme") || "dark";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next, true);
    showToast(
      next === "dark"
        ? "🌙 Switched to Dark Theme"
        : "☀️ Switched to Light Theme"
    );
  };

  if (themeToggle) themeToggle.addEventListener("click", handleToggle);
  if (mobileThemeToggle) mobileThemeToggle.addEventListener("click", handleToggle);

  /* --------------------------------------------------------------------------
     2. Preloader & Hero Choreography
     -------------------------------------------------------------------------- */
  const preloader = document.getElementById("preloader");
  const countEl = document.querySelector(".preloader-count");

  const playHeroIntro = () => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

    tl.from(".nav", { y: -60, opacity: 0, duration: 0.9 })
      .from(".hero-eyebrow", { y: 24, opacity: 0, duration: 0.7 }, "-=0.55")
      .from(
        ".hero-title .line-inner",
        {
          yPercent: 115,
          rotate: 2,
          duration: 1,
          stagger: 0.14,
        },
        "-=0.45"
      )
      .from(
        ".hero-anim",
        {
          y: 28,
          opacity: 0,
          duration: 0.8,
          stagger: 0.12,
        },
        "-=0.6"
      )
      .from(
        ".hero-visual-inner",
        {
          scale: 0.84,
          opacity: 0,
          duration: 1.1,
          ease: "back.out(1.4)",
        },
        "-=0.95"
      )
      .from(
        ".float-chip",
        {
          scale: 0,
          opacity: 0,
          duration: 0.65,
          stagger: 0.12,
          ease: "back.out(1.8)",
          clearProps: "opacity,scale",
        },
        "-=0.55"
      )
      .from(".scroll-cue", { opacity: 0, y: 12, duration: 0.6 }, "-=0.3");

    // Continuous floating chips
    gsap.utils.toArray(".float-chip").forEach((chip, i) => {
      gsap.to(chip, {
        y: i % 2 === 0 ? -10 : 10,
        duration: 2.4 + i * 0.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });
  };

  if (preloader && !prefersReducedMotion) {
    const counter = { val: 0 };

    gsap.to(".preloader-dots span", {
      y: -12,
      stagger: { each: 0.1, repeat: 3, yoyo: true },
      duration: 0.32,
      ease: "power2.out",
    });

    const loaderTl = gsap.timeline({
      onComplete: () => {
        preloader.style.display = "none";
        ScrollTrigger.refresh();
      },
    });

    loaderTl
      .to(counter, {
        val: 100,
        duration: 1.1,
        ease: "power2.inOut",
        onUpdate: () => {
          if (countEl) countEl.textContent = Math.round(counter.val);
        },
      })
      .to(".preloader-content", {
        opacity: 0,
        y: -20,
        duration: 0.35,
        ease: "power2.in",
      })
      .to(
        ".preloader-panel",
        {
          scaleY: 0,
          duration: 0.7,
          stagger: 0.07,
          ease: "expo.inOut",
          onStart: playHeroIntro,
        },
        "-=0.1"
      );
  } else {
    if (preloader) preloader.style.display = "none";
    if (!prefersReducedMotion) playHeroIntro();
  }

  /* --------------------------------------------------------------------------
     3. Role Rotator (GSAP Text Loop)
     -------------------------------------------------------------------------- */
  const roles = gsap.utils.toArray(".role-rotator span");
  if (roles.length > 1 && !prefersReducedMotion) {
    gsap.set(roles, { opacity: 0, yPercent: 100 });
    gsap.set(roles[0], { opacity: 1, yPercent: 0 });

    let currentRole = 0;
    setInterval(() => {
      const prev = roles[currentRole];
      currentRole = (currentRole + 1) % roles.length;
      const next = roles[currentRole];

      gsap.to(prev, {
        yPercent: -100,
        opacity: 0,
        duration: 0.45,
        ease: "power3.inOut",
      });
      gsap.fromTo(
        next,
        { yPercent: 100, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.45,
          ease: "power3.inOut",
        }
      );
    }, 2800);
  }

  /* --------------------------------------------------------------------------
     4. Custom Cursor, Spotlight & Hero Mouse Parallax
     -------------------------------------------------------------------------- */
  const cursorDot = document.querySelector(".cursor-dot");
  const cursorRing = document.querySelector(".cursor-ring");
  const heroSection = document.getElementById("hero");
  const depthLayers = gsap.utils.toArray("#hero [data-depth]");

  if (cursorDot && cursorRing && window.matchMedia("(pointer: fine)").matches) {
    const xDot = gsap.quickTo(cursorDot, "x", { duration: 0.1, ease: "power3" });
    const yDot = gsap.quickTo(cursorDot, "y", { duration: 0.1, ease: "power3" });
    const xRing = gsap.quickTo(cursorRing, "x", { duration: 0.35, ease: "power3" });
    const yRing = gsap.quickTo(cursorRing, "y", { duration: 0.35, ease: "power3" });

    window.addEventListener("mousemove", (e) => {
      xDot(e.clientX);
      yDot(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);

      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        if (rect.bottom > 0) {
          heroSection.style.setProperty("--mx", `${e.clientX}px`);
          heroSection.style.setProperty("--my", `${e.clientY - rect.top}px`);

          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;

          depthLayers.forEach((layer) => {
            const depth = parseFloat(layer.dataset.depth || "20");
            gsap.to(layer, {
              x: nx * depth,
              y: ny * depth,
              duration: 0.9,
              ease: "power2.out",
              overwrite: "auto",
            });
          });
        }
      }
    });

    document
      .querySelectorAll("a, button, .glow-card, .chip, .stack-item, .tool-pill")
      .forEach((el) => {
        el.addEventListener("mouseenter", () =>
          cursorRing.classList.add("is-hover")
        );
        el.addEventListener("mouseleave", () =>
          cursorRing.classList.remove("is-hover")
        );
      });
  }

  /* --------------------------------------------------------------------------
     5. Magnetic Buttons & Card 3D Tilt (with clean reset)
     -------------------------------------------------------------------------- */
  if (window.matchMedia("(pointer: fine)").matches && !prefersReducedMotion) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);
        gsap.to(el, {
          x: x * 0.28,
          y: y * 0.28,
          duration: 0.35,
          ease: "power2.out",
        });
      });

      el.addEventListener("mouseleave", () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.4)",
          clearProps: "x,y",
        });
      });
    });

    document.querySelectorAll(".glow-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--gx", `${x}px`);
        card.style.setProperty("--gy", `${y}px`);

        const rx = ((y - rect.height / 2) / rect.height) * -4;
        const ry = ((x - rect.width / 2) / rect.width) * 4;

        gsap.to(card, {
          rotateX: rx,
          rotateY: ry,
          transformPerspective: 900,
          duration: 0.35,
          ease: "power2.out",
        });
      });

      card.addEventListener("mouseleave", () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.5,
          ease: "power3.out",
          clearProps: "transform",
        });
      });
    });
  }

  /* --------------------------------------------------------------------------
     6. Interactive Google-Colored Particle Canvas
     -------------------------------------------------------------------------- */
  const canvas = document.getElementById("particles");
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext("2d");
    const googlePalette = ["#4285F4", "#EA4335", "#FBBC05", "#34A853"];
    let width = 0;
    let height = 0;
    let particles = [];

    const resizeCanvas = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    const createParticles = () => {
      const count = Math.min(46, Math.floor((width * height) / 28000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.42,
        vy: (Math.random() - 0.5) * 0.42,
        r: Math.random() * 2.2 + 1,
        color: googlePalette[Math.floor(Math.random() * googlePalette.length)],
      }));
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.65;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = (1 - dist / 120) * 0.12;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(drawParticles);
    };

    resizeCanvas();
    createParticles();
    drawParticles();
    window.addEventListener("resize", () => {
      resizeCanvas();
      createParticles();
    });
  }

  /* --------------------------------------------------------------------------
     7. Scroll Progress & Active Navigation
     -------------------------------------------------------------------------- */
  gsap.to(".scroll-progress", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: {
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.2,
    },
  });

  const nav = document.getElementById("nav");
  window.addEventListener(
    "scroll",
    () => {
      if (nav) {
        nav.classList.toggle("scrolled", window.scrollY > 40);
      }
    },
    { passive: true }
  );

  const navLinks = gsap.utils.toArray(".nav-link");
  ["hero", "about", "skills", "projects", "contact"].forEach((id) => {
    const section = document.getElementById(id);
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: "top 45%",
      end: "bottom 45%",
      onToggle: (self) => {
        if (self.isActive) {
          navLinks.forEach((link) =>
            link.classList.toggle("active", link.dataset.section === id)
          );
        }
      },
    });
  });

  /* --------------------------------------------------------------------------
     8. Perfectly Parallel & Level Reveal Animations (Without Staircase Bug)
     -------------------------------------------------------------------------- */
  if (!prefersReducedMotion) {
    // Section Headings
    gsap.utils.toArray("[data-split]").forEach((heading) => {
      gsap.from(heading, {
        scrollTrigger: { trigger: heading, start: "top 86%" },
        y: 32,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        clearProps: "all",
      });
    });

    // Reveal Tags and Paragraphs
    gsap.utils.toArray(".reveal").forEach((el) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: "top 88%" },
        y: 28,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        clearProps: "all",
      });
    });

    // Terminal Line Typing Reveal
    gsap.from(".terminal .t-line", {
      scrollTrigger: { trigger: ".terminal", start: "top 82%" },
      opacity: 0,
      x: -12,
      duration: 0.35,
      stagger: 0.07,
      ease: "power2.out",
      clearProps: "all",
    });

    // About Stats Cards
    gsap.from(".stats .stat", {
      scrollTrigger: { trigger: ".stats", start: "top 85%" },
      y: 28,
      opacity: 0,
      duration: 0.65,
      stagger: 0.1,
      ease: "power2.out",
      clearProps: "all",
    });

    // TECHNICAL SKILLS: Animate in together and clear all transforms so they remain strictly parallel
    ScrollTrigger.batch(".skills-grid .skill-card", {
      start: "top 86%",
      once: true,
      onEnter: (batch) => {
        gsap.fromTo(
          batch,
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            stagger: 0.1,
            ease: "power2.out",
            clearProps: "all", // CRITICAL: leaves no lingering transform, ensuring level cards!
          }
        );
      },
    });

    // FEATURED PROJECT: Easiness (SaaS Tools)
    const featured = document.querySelector(".featured");
    if (featured) {
      const featTl = gsap.timeline({
        scrollTrigger: { trigger: featured, start: "top 82%" },
      });

      featTl
        .from(featured, {
          y: 44,
          opacity: 0,
          duration: 0.85,
          ease: "power3.out",
          clearProps: "all",
        })
        .from(
          ".featured .stack-item",
          {
            y: 18,
            opacity: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: "power2.out",
            clearProps: "all",
          },
          "-=0.4"
        )
        .from(
          ".mock-chart span",
          {
            scaleY: 0,
            transformOrigin: "bottom",
            duration: 0.6,
            stagger: 0.03,
            ease: "back.out(1.5)",
          },
          "-=0.4"
        )
        .from(
          ".mock-toast",
          {
            y: 18,
            opacity: 0,
            duration: 0.55,
            ease: "back.out(1.7)",
            clearProps: "all",
          },
          "-=0.3"
        );
    }

    // SHOWCASE PROJECTS: Uniform batch reveal with complete transform reset
    ScrollTrigger.batch(".projects-grid .project-card", {
      start: "top 86%",
      once: true,
      onEnter: (batch) => {
        gsap.fromTo(
          batch,
          { y: 36, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            stagger: 0.1,
            ease: "power2.out",
            clearProps: "all", // Ensures all grid cards are uniformly aligned
          }
        );
      },
    });

    // CONTACT GRID: Strictly parallel, equal height with cleared transform
    ScrollTrigger.batch(".contact-grid .contact-item", {
      start: "top 88%",
      once: true,
      onEnter: (batch) => {
        gsap.fromTo(
          batch,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            stagger: 0.1,
            ease: "power2.out",
            clearProps: "all", // Fixes the staircase offset shown in user screenshot
          }
        );
      },
    });

    // SOCIALS: Centered horizontal icons with clean back scale
    ScrollTrigger.batch(".socials .social", {
      start: "top 90%",
      once: true,
      onEnter: (batch) => {
        gsap.fromTo(
          batch,
          { scale: 0.65, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.55,
            stagger: 0.09,
            ease: "back.out(1.7)",
            clearProps: "all", // Perfectly level alignment
          }
        );
      },
    });

    // Animated Counters
    gsap.utils.toArray(".counter").forEach((counterEl) => {
      const target = parseInt(counterEl.dataset.target || "0", 10);
      const obj = { val: 0 };
      ScrollTrigger.create({
        trigger: counterEl,
        start: "top 88%",
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: target,
            duration: 1.5,
            ease: "power2.out",
            onUpdate: () => {
              counterEl.textContent = Math.round(obj.val);
            },
          });
        },
      });
    });
  }

  /* --------------------------------------------------------------------------
     9. Mobile Menu & Copy Toast
     -------------------------------------------------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  if (navToggle && mobileMenu) {
    const toggleMenu = (forceClose = false) => {
      const isOpen = forceClose ? false : !mobileMenu.classList.contains("open");
      mobileMenu.classList.toggle("open", isOpen);
      navToggle.classList.toggle("active", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    };

    navToggle.addEventListener("click", () => toggleMenu());
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => toggleMenu(true));
    });
  }

  const toast = document.getElementById("toast");
  let toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.getAttribute("data-copy");
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        showToast(`📋 Copied "${text}" to clipboard!`);
      } catch {
        showToast(`Email: ${text}`);
      }
    });
  });
});
