document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("navMenu");
  const dropdowns = document.querySelectorAll(".dropdown");
  const dropdownToggles = document.querySelectorAll(".dropdown-toggle");

  // ✅ Toggle mobile menu
  menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });

  // ✅ Toggle dropdowns on mobile
  dropdownToggles.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (window.innerWidth <= 768) {
        const parent = btn.closest(".dropdown");
        parent.classList.toggle("active");
      }
    });
  });

  // ✅ Smooth scroll
  document.querySelectorAll('a.nav-link[href^="#"]').forEach((link) => {
    link.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });

        // ✅ Close menu on click (mobile)
        if (window.innerWidth <= 768) {
          navMenu.classList.remove("active");
          dropdowns.forEach((d) => d.classList.remove("active"));
        }
      }
    });
  });
});
