(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var nav = document.getElementById("primary-nav");
  var toggle = document.querySelector(".menu-toggle");
  var backdrop = document.querySelector(".nav-backdrop");
  var navLinks = document.querySelectorAll('#primary-nav a[href^="#"]');
  var sections = document.querySelectorAll("main section[id]");
  var year = document.getElementById("year");
  var reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* =========================
     ANNO FOOTER
     ========================= */

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  /* =========================
     MENU MOBILE
     ========================= */

  function setMenu(open) {
    if (!nav || !toggle) {
      return;
    }

    nav.classList.toggle("is-open", open);

    toggle.setAttribute(
      "aria-expanded",
      open ? "true" : "false"
    );

    toggle.setAttribute(
      "aria-label",
      open ? "Chiudi menu" : "Apri menu"
    );

    if (backdrop) {
      backdrop.hidden = !open;
    }

    document.body.style.overflow = open ? "hidden" : "";

    if (open) {
      var firstLink = nav.querySelector("a");

      if (firstLink) {
        window.setTimeout(function () {
          firstLink.focus();
        }, 0);
      }
    } else if (
      document.activeElement &&
      nav.contains(document.activeElement)
    ) {
      toggle.focus();
    }
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.contains("is-open");
      setMenu(!isOpen);
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", function () {
      setMenu(false);
    });
  }

  /* =========================
     ACCESSIBILITÀ MENU
     ========================= */

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      setMenu(false);
      return;
    }

    if (
      event.key !== "Tab" ||
      !nav ||
      !nav.classList.contains("is-open")
    ) {
      return;
    }

    var focusable = nav.querySelectorAll("a");

    if (!focusable.length) {
      return;
    }

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (
      event.shiftKey &&
      document.activeElement === first
    ) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      document.activeElement === last
    ) {
      event.preventDefault();
      first.focus();
    }
  });

  /* =========================
     CHIUSURA MENU SU LINK
     ========================= */

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      setMenu(false);
    });
  });

  /* =========================
     SCROLL ANCORA
     ========================= */

  document
    .querySelectorAll('a[href^="#"]')
    .forEach(function (anchor) {
      anchor.addEventListener("click", function (event) {
        var id = anchor.getAttribute("href");

        if (!id || id === "#") {
          return;
        }

        var target = document.querySelector(id);

        if (!target) {
          return;
        }

        event.preventDefault();

        var offset = header
          ? header.offsetHeight + 8
          : 0;

        var top =
          target.getBoundingClientRect().top +
          window.pageYOffset -
          offset;

        window.scrollTo({
          top: top,
          behavior: reduceMotion ? "auto" : "smooth"
        });

        /*
         * Aggiorna l'URL senza ricaricare la pagina.
         * Per #home torna all'URL pulito.
         */
        if (id !== "#home") {
          history.pushState(null, "", id);
        } else {
          history.pushState(
            null,
            "",
            window.location.pathname
          );
        }
      });
    });

  /* =========================
     NAV ATTIVA
     ========================= */

  function updateActiveNav() {
    var scrollPos =
      window.scrollY +
      (header ? header.offsetHeight + 24 : 80);

    var current = "home";

    sections.forEach(function (section) {
      if (section.offsetTop <= scrollPos) {
        current = section.id;
      }
    });

    var map = {
      home: "home",
      servizi: "servizi",
      "chi-siamo": "chi-siamo",
      galleria: "galleria",
      "perche-noi": "galleria",
      orari: "orari",
      faq: "contatti",
      contatti: "contatti"
    };

    var mapped = map[current] || current;

    navLinks.forEach(function (link) {
      var href = link.getAttribute("href") || "";

      link.classList.toggle(
        "is-active",
        href === "#" + mapped
      );
    });
  }

  window.addEventListener(
    "scroll",
    updateActiveNav,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    updateActiveNav,
    { passive: true }
  );

  updateActiveNav();

  /* =========================
     FAQ
     ========================= */

  document
    .querySelectorAll(".faq-trigger")
    .forEach(function (button) {
      button.addEventListener("click", function () {
        var expanded =
          button.getAttribute("aria-expanded") === "true";

        var panelId =
          button.getAttribute("aria-controls");

        var panel = panelId
          ? document.getElementById(panelId)
          : null;

        /*
         * Chiude tutte le altre FAQ.
         */
        document
          .querySelectorAll(".faq-trigger")
          .forEach(function (other) {
            if (other === button) {
              return;
            }

            other.setAttribute(
              "aria-expanded",
              "false"
            );

            var otherPanelId =
              other.getAttribute("aria-controls");

            var otherPanel =
              otherPanelId
                ? document.getElementById(otherPanelId)
                : null;

            if (otherPanel) {
              otherPanel.hidden = true;
            }
          });

        var nextExpanded = !expanded;

        button.setAttribute(
          "aria-expanded",
          nextExpanded ? "true" : "false"
        );

        if (panel) {
          panel.hidden = !nextExpanded;
        }
      });
    });

  /* =========================
     REVEAL ON SCROLL
     ========================= */

  if (
    !reduceMotion &&
    "IntersectionObserver" in window
  ) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    document
      .querySelectorAll(".reveal")
      .forEach(function (element) {
        observer.observe(element);
      });
  } else {
    document
      .querySelectorAll(".reveal")
      .forEach(function (element) {
        element.classList.add("is-visible");
      });
  }

  /* =========================
     VIDEO GALLERIA
     ========================= */

  /*
   * Quando inseriremo i veri file video nell'HTML,
   * questa funzione applicherà impostazioni comuni
   * per evitare audio e riproduzioni automatiche
   * indesiderate.
   */
  document
    .querySelectorAll(".gallery-card video")
    .forEach(function (video) {
      video.muted = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.setAttribute("preload", "metadata");

      /*
       * Su desktop e mobile il video può partire
       * quando entra nella viewport, senza audio.
       */
      if (
        !reduceMotion &&
        "IntersectionObserver" in window
      ) {
        var videoObserver =
          new IntersectionObserver(
            function (entries) {
              entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                  var playPromise = video.play();

                  if (
                    playPromise &&
                    typeof playPromise.catch === "function"
                  ) {
                    playPromise.catch(function () {
                      /* Autoplay non consentito: nessun errore visibile. */
                    });
                  }
                } else {
                  video.pause();
                }
              });
            },
            {
              threshold: 0.25
            }
          );

        videoObserver.observe(video);
      }
    });

  /* =========================
     RIPRISTINO MENU SU RESIZE
     ========================= */

  window.addEventListener("resize", function () {
    if (
      window.innerWidth > 800 &&
      nav &&
      nav.classList.contains("is-open")
    ) {
      setMenu(false);
    }
  });

})();