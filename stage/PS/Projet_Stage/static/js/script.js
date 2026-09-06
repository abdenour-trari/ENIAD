const RESULTS_PER_PAGE = 15;
let currentResults = [];
let currentPage = 1;

const advancedFiltersDiv = document.getElementById("advancedFilters");
const toggleAdvancedBtn = document.getElementById("toggleAdvanced");
const sourceSelect = document.getElementById("source");

// Configuration des filtres avancés par source avec placeholder
const advancedFiltersConfig = {
  finances: [
    {
      label: "Rubrique",
      id: "rubrique",
      type: "text",
      placeholder: "Ex: Informatisation",
    },
    {
      label: "Date de publication",
      id: "date_publication",
      type: "date",
      placeholder: "",
    },
  ],
  credit_agricole: [
    {
      label: "Date d'ouverture",
      id: "date_ouverture",
      type: "date",
      placeholder: "",
    },
    {
      label: "Contact",
      id: "contact",
      type: "text",
      placeholder: "Ex: 05 30 17 86 23",
    },
  ],
  equipement: [
    {
      label: "Estimation",
      id: "estimation",
      type: "text",
      placeholder: "Ex: 100000 DH",
    },
    {
      label: "Lieu",
      id: "lieu",
      type: "text",
      placeholder: "Ex: Rabat",
    },
  ],
};

// --- Affiche une page de résultats (inchangé) ---
function displayPage(page) {
  currentPage = page;
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  const start = (page - 1) * RESULTS_PER_PAGE;
  const end = start + RESULTS_PER_PAGE;
  const pageResults = currentResults.slice(start, end);

  pageResults.forEach((offre) => {
    const div = document.createElement("div");
    div.className = "result";

    div.innerHTML = `
      <div class="offre-card">
        <h3 class="offre-numero">${offre.rubrique || offre.objet}</h3>
        ${
          offre.rubrique
            ? `<p class="offre-rubrique"><strong>Numèro AO :</strong> ${offre.numero_ao}</p>`
            : ""
        }
        <p class="offre-objet"><strong>Objet :</strong><br/> ${
          offre.objet || "<em>Aucun objet disponible</em>"
        }</p>

        <p class="offre-infos">
          <strong>Publication :</strong> ${
            offre.date_publication || "N/A"
          } <br/>
          <strong>Entité :</strong> ${offre.entite || "N/A"} <br/>
          <strong>Lieu :</strong> ${offre.lieu || "N/A"}
        </p>

        ${
          offre.date_ouverture
            ? `<p><strong>Date d'ouverture :</strong> ${offre.date_ouverture}</p>`
            : ""
        }

        ${
          offre.contact
            ? `<p><strong>Contact :</strong><br/><pre style="white-space: pre-wrap; margin:0;">${offre.contact}</pre></p>`
            : ""
        }

        ${
          offre.dossier_link
            ? `<p><a class="offre-link" href="${offre.dossier_link}" target="_blank">📄 Consulter le dossier</a></p>`
            : ""
        }
      </div>
    `;

    resultsDiv.appendChild(div);
  });

  createPagination(page, Math.ceil(currentResults.length / RESULTS_PER_PAGE));
}

// --- Création pagination (inchangé) ---
function createPagination(current, totalPages) {
  const resultsDiv = document.getElementById("results");

  const oldPagination = document.getElementById("pagination");
  if (oldPagination) oldPagination.remove();

  if (totalPages <= 1) return;

  const paginationDiv = document.createElement("div");
  paginationDiv.id = "pagination";

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Précédent";
  prevBtn.disabled = current === 1;
  prevBtn.addEventListener("click", () => {
    if (current > 1) displayPage(current - 1);
  });
  paginationDiv.appendChild(prevBtn);

  function pageBtn(page) {
    const btn = document.createElement("button");
    btn.textContent = page;
    btn.disabled = page === current;
    if (page === current) {
      btn.style.backgroundColor = "#1e3a8a";
      btn.style.color = "white";
      btn.style.cursor = "default";
    }
    btn.addEventListener("click", () => displayPage(page));
    return btn;
  }

  let left = current - 2;
  let right = current + 2;

  if (left < 1) {
    right += 1 - left;
    left = 1;
  }
  if (right > totalPages) {
    left -= right - totalPages;
    right = totalPages;
    if (left < 1) left = 1;
  }

  paginationDiv.appendChild(pageBtn(1));

  if (left > 2) {
    const dots = document.createElement("span");
    dots.textContent = "...";
    dots.className = "dots";
    paginationDiv.appendChild(dots);
  }

  for (let i = left; i <= right; i++) {
    if (i !== 1 && i !== totalPages) {
      paginationDiv.appendChild(pageBtn(i));
    }
  }

  if (right < totalPages - 1) {
    const dots = document.createElement("span");
    dots.textContent = "...";
    dots.className = "dots";
    paginationDiv.appendChild(dots);
  }

  if (totalPages > 1) {
    paginationDiv.appendChild(pageBtn(totalPages));
  }

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Suivant";
  nextBtn.disabled = current === totalPages;
  nextBtn.addEventListener("click", () => {
    if (current < totalPages) displayPage(current + 1);
  });
  paginationDiv.appendChild(nextBtn);

  resultsDiv.appendChild(paginationDiv);
}

// --- Affiche / masque filtres avancés et génère les inputs dynamiques ---
toggleAdvancedBtn.addEventListener("click", () => {
  if (advancedFiltersDiv.style.display === "none") {
    advancedFiltersDiv.style.display = "block";
    renderAdvancedFilters(sourceSelect.value);
    toggleAdvancedBtn.textContent = "Masquer la recherche avancée";
  } else {
    advancedFiltersDiv.style.display = "none";
    advancedFiltersDiv.innerHTML = "";
    toggleAdvancedBtn.textContent = "Recherche avancée";
  }
});

// Met à jour les filtres avancés quand la source change (si visible)
sourceSelect.addEventListener("change", () => {
  if (advancedFiltersDiv.style.display === "block") {
    renderAdvancedFilters(sourceSelect.value);
  }
});

// Fonction qui génère dynamiquement les champs avancés
function renderAdvancedFilters(source) {
  advancedFiltersDiv.innerHTML = "";

  if (!advancedFiltersConfig[source]) {
    advancedFiltersDiv.innerHTML =
      "<p>Choisissez un site pour voir les filtres avancés.</p>";
    return;
  }

  advancedFiltersConfig[source].forEach((filter) => {
    const label = document.createElement("label");
    label.setAttribute("for", filter.id);
    label.textContent = filter.label + " : ";

    const input = document.createElement("input");
    input.type = filter.type;
    input.id = filter.id;
    input.name = filter.id;
    input.placeholder = filter.placeholder;

    const wrapper = document.createElement("div");
    wrapper.style.marginBottom = "8px";

    wrapper.appendChild(label);
    wrapper.appendChild(input);

    advancedFiltersDiv.appendChild(wrapper);
  });
}

// --- Gestion du formulaire de recherche ---
document.getElementById("searchForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const keyword = document.getElementById("keyword").value.trim();
  const source = sourceSelect.value;
  const resultsDiv = document.getElementById("results");

  // Récupérer les filtres avancés si visibles
  const filters = {};
  if (advancedFiltersDiv.style.display === "block") {
    const inputs = advancedFiltersDiv.querySelectorAll("input");
    inputs.forEach((input) => {
      if (input.value.trim() !== "") {
        filters[input.name] = input.value.trim();
      }
    });
  }

  resultsDiv.innerHTML = "<p>Chargement...</p>";

  try {
    let allOffres = [];

    if (source === "all") {
      const sourcesList = ["finances", "credit_agricole", "equipement"];
      const promises = sourcesList.map((src) =>
        fetch(
          `/scrape?keyword=${encodeURIComponent(keyword)}&source=${src}`
        ).then((res) => res.json())
      );
      const allResults = await Promise.all(promises);

      allResults.forEach((result) => {
        if (!result.error && result.filtered > 0) {
          allOffres = allOffres.concat(result.results);
        }
      });
    } else {
      // Construire URL avec filtres avancés
      let url = `/scrape?keyword=${encodeURIComponent(
        keyword
      )}&source=${source}`;
      for (const key in filters) {
        url += `&${encodeURIComponent(key)}=${encodeURIComponent(
          filters[key]
        )}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      if (!data.error && data.filtered > 0) {
        allOffres = data.results;
      }
    }

    if (allOffres.length === 0) {
      resultsDiv.innerHTML = "<p>Aucun résultat trouvé.</p>";
      return;
    }

    currentResults = allOffres;
    displayPage(1);
  } catch (error) {
    resultsDiv.innerHTML = `<p style="color:red;">Erreur serveur : ${error.message}</p>`;
  }
});

// Initialiser filtres avancés au chargement
document.addEventListener("DOMContentLoaded", () => {
  renderAdvancedFilters(sourceSelect.value);
  advancedFiltersDiv.style.display = "none";
  toggleAdvancedBtn.textContent = "Recherche avancée";
});
