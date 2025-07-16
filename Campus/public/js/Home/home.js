document.addEventListener('DOMContentLoaded', () => {
  // Testimonial Slider
  let current = 0;
  const slides = document.querySelectorAll(".testimonial-slide");
  if (slides.length > 0) {
    setInterval(() => {
      slides[current].classList.remove("active");
      current = (current + 1) % slides.length;
      slides[current].classList.add("active");
    }, 4000);
  }

  // Mobile Menu Toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav');
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
    });
  }

  // Initialize AOS (Animate On Scroll)
  AOS.init();
});