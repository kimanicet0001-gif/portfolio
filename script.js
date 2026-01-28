lucide.createIcons();

// Navbar mobile toggle
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
menuBtn.addEventListener("click", () => { mobileMenu.classList.toggle("hidden"); });
document.querySelectorAll('#mobileMenu a').forEach(link => link.addEventListener('click', () => mobileMenu.classList.add('hidden')));

// Dynamiser les projets
const projects = [
  { name: "JENOVA", desc: "Plateforme éducative et sociale valorisant les talents locaux.", icon: "users", link: "https://le-seul-1.github.io/JENOVA/" },
  { name: "EXETAT PREP", desc: "Plateforme de préparation aux examens avec cours et exercices.", icon: "book-open", link: "https://exetatrdc.lovable.app" },
  { name: "EduBOURSE", desc: "Plateforme centralisant les informations sur les bourses.", icon: "award", link: "https://edubourse.example.com" },
  { name: "E-Santé Triage", desc: "Système de triage médical autonome.", icon: "heart-pulse", link: "https://docu-flow-ai-1b346baa.base44.app" }
];


const grid = document.getElementById("projectsGrid");
projects.forEach((p, index) => {
  const card = document.createElement("div");
  card.className = "p-6 h-[20vh] bg-black/40 rounded-xl hover:scale-105 transition transform animate-fadeSlide";
  card.style.animationDelay = `${index * 150}ms`;
  card.innerHTML = `
      <i data-lucide="${p.icon}" class="text-primary mb-4"></i>
      <h4 class="text-xl font-semibold mb-2">${p.name}</h4>
      <p class="text-gray-400 text-sm mb-4">${p.desc}</p>
      <a href="${p.link}" target="_blank" class="inline-block px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/80 transition">
        En savoir plus
      </a>
    `;
  grid.appendChild(card);
});

lucide.createIcons();
