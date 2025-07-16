
  document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("menu-toggle");
    const navMenu = document.getElementById("navMenu");
    const dropdownToggles = document.querySelectorAll(".dropdown-toggle");

    // Toggle for the main navigation menu
    if (menuToggle && navMenu) { // Added check if elements exist
      menuToggle.addEventListener("click", () => {
        navMenu.classList.toggle("active");
        // Close any open dropdowns when main menu is toggled
        dropdownToggles.forEach(btn => {
          const parentDropdown = btn.closest(".dropdown");
          if (parentDropdown && parentDropdown.classList.contains("active")) {
            parentDropdown.classList.remove("active");
          }
        });
      });
    }

    // Toggle for dropdown menus on small screens
    dropdownToggles.forEach(btn => {
      btn.addEventListener("click", e => {
        if (window.innerWidth <= 768) {
          e.preventDefault(); // Prevent default link behavior for dropdown buttons
          const parentDropdown = btn.closest(".dropdown");
          if (parentDropdown) {
            // Close other dropdowns before opening a new one
            dropdownToggles.forEach(otherBtn => {
              const otherParentDropdown = otherBtn.closest(".dropdown");
              if (otherParentDropdown && otherParentDropdown !== parentDropdown && otherParentDropdown.classList.contains("active")) {
                otherParentDropdown.classList.remove("active");
              }
            });
            parentDropdown.classList.toggle("active");
          }
        }
      });
    });

    // Close dropdowns and menu if clicking outside on small screens
    document.addEventListener("click", (e) => {
      if (window.innerWidth <= 768) {
        // Check if the click is outside the navMenu and not on the menuToggle itself
        if (navMenu && menuToggle && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
          navMenu.classList.remove("active");
          // Also close all dropdowns
          dropdownToggles.forEach(btn => {
            const parentDropdown = btn.closest(".dropdown");
            if (parentDropdown) {
              parentDropdown.classList.remove("active");
            }
          });
        }
      }
    });

    // Close dropdowns and menu when resizing from mobile to desktop
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        if (navMenu) navMenu.classList.remove("active");
        dropdownToggles.forEach(btn => {
          const parentDropdown = btn.closest(".dropdown");
          if (parentDropdown) {
            parentDropdown.classList.remove("active");
          }
        });
      }
    });
  });
