document.addEventListener('DOMContentLoaded', () => {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
      easing: 'ease-out-cubic'
    });
  }
  
  const readMoreBtn = document.getElementById('readMoreBtn');
  const dots = document.getElementById('dots');
  const moreText = document.getElementById('moreText');

  if (readMoreBtn && dots && moreText) {
      readMoreBtn.addEventListener('click', function() {
          if (dots.style.display === "none") {
              dots.style.display = "inline";
              moreText.style.display = "none";
              readMoreBtn.innerHTML = "Read More";
          } else {
              dots.style.display = "none";
              moreText.style.display = "inline";
              readMoreBtn.innerHTML = "Read Less";
          }
      });
  }

  let currentTestimonial = 0;
  const testimonialSlides = document.querySelectorAll(".testimonial-slide");
  const testimonialDots = document.querySelectorAll(".dot");
  
  if (testimonialSlides.length > 0) {
    const rotateTestimonials = () => {
      testimonialSlides[currentTestimonial].classList.remove("active");
      if (testimonialDots[currentTestimonial]) {
        testimonialDots[currentTestimonial].classList.remove("active");
      }
      
      currentTestimonial = (currentTestimonial + 1) % testimonialSlides.length;
      
      testimonialSlides[currentTestimonial].classList.add("active");
      if (testimonialDots[currentTestimonial]) {
        testimonialDots[currentTestimonial].classList.add("active");
      }
    };

    setInterval(rotateTestimonials, 5000);
  }

  window.currentSlide = (n) => {
    testimonialSlides.forEach(slide => slide.classList.remove("active"));
    testimonialDots.forEach(dot => dot.classList.remove("active"));
    
    currentTestimonial = n - 1;
    
    if (testimonialSlides[currentTestimonial]) {
      testimonialSlides[currentTestimonial].classList.add("active");
    }
    if (testimonialDots[currentTestimonial]) {
      testimonialDots[currentTestimonial].classList.add("active");
    }
  };

  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav');
  
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
    });

    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
      });
    });

    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
        nav.classList.remove('active');
      }
    });
  }

  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const headerHeight = document.querySelector('header')?.offsetHeight || 0;
        const targetPosition = targetElement.offsetTop - headerHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  const impactNumbers = document.querySelectorAll('.impact-number');
  const animateCounters = () => {
    impactNumbers.forEach(counter => {
      const target = parseInt(counter.textContent.replace(/\D/g, ''));
      const duration = 2000;
      const increment = target / (duration / 16);
      let current = 0;
      
      const updateCounter = () => {
        current += increment;
        if (current < target) {
          counter.textContent = Math.floor(current).toLocaleString() + '+';
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target.toLocaleString() + '+';
        }
      };
      
      updateCounter();
    });
  };

  const impactSection = document.querySelector('#impact');
  if (impactSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(impactSection);
  }

  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) scale(1)';
    });
  });

  const donateButtons = document.querySelectorAll('.btn-donate, .btn-donate-large');
  donateButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = '';
      }, 150);
      
      alert('Thank you for your interest in supporting our students! Please contact us for donation details.');
    });
  });

  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => {
    imageObserver.observe(img);
  });

  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        header.style.background = 'rgba(30, 64, 175, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
      } else {
        header.style.background = '#1e40af';
        header.style.backdropFilter = 'none';
      }
    });
  }

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  window.addEventListener('beforeunload', () => {
    document.body.style.opacity = '0.8';
  });

  const socialLinks = document.querySelectorAll('.social-links a');
  socialLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const platform = link.getAttribute('aria-label') || 'unknown';
      console.log(`Social link clicked: ${platform}`);
    });
  });

  const focusableElements = document.querySelectorAll('a, button, input, textarea, select');
  focusableElements.forEach(element => {
    element.addEventListener('focus', () => {
      element.style.outline = '2px solid #f97316';
      element.style.outlineOffset = '2px';
    });
    
    element.addEventListener('blur', () => {
      element.style.outline = '';
      element.style.outlineOffset = '';
    });
  });

  const checkRequiredElements = () => {
    const requiredElements = [
      '.hero',
      '#about',
      '#impact',
      'footer'
    ];
    
    requiredElements.forEach(selector => {
      if (!document.querySelector(selector)) {
        console.warn(`Required element missing: ${selector}`);
      }
    });
  };

  checkRequiredElements();

  console.log('KASH NGO website initialized successfully!');
});

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    currentSlide: window.currentSlide,
    debounce,
    throttle
  };
}   