// navbar.js — Composant navbar réutilisable
export function renderNavbar({ activePage = "game" } = {}) {
  const links = [
    { id: "game", label: "Game", icon: "⌨️", href: "index.html" },
    { id: "progress", label: "Progress", icon: "📈", href: "progress.html" },
    { id: "settings", label: "Settings", icon: "⚙️", href: "settings.html" },
  ];

  const nav = document.createElement("nav");
  nav.className = "navbar";
  nav.innerHTML = `
    <div class="navbar-inner">
      <a class="navbar-brand" href="index.html">
        <span class="brand-icon">✦</span>
        <span class="brand-name">LetterQuest</span>
      </a>

      <ul class="navbar-links">
        ${links
          .map(
            (l) => `
          <li>
            <a href="${l.href}" class="nav-link ${l.id === activePage ? "active" : ""}">
              <span class="nav-icon">${l.icon}</span>
              <span>${l.label}</span>
            </a>
          </li>
        `,
          )
          .join("")}
      </ul>

      <div class="navbar-status">
        <div class="status-dot" id="trackingDot"></div>
        <span class="status-label" id="trackingLabel">Connecting…</span>
      </div>
    </div>
  `;

  document.body.prepend(nav);
}

// Met à jour le statut de tracking dans la navbar
export function setTrackingStatus(active) {
  const dot = document.getElementById("trackingDot");
  const label = document.getElementById("trackingLabel");
  if (!dot || !label) return;
  dot.className = "status-dot " + (active ? "online" : "offline");
  label.innerText = active ? "Tracking ON" : "No Hand";
}
