
// script.js

// Přepínání světlého/tmavého režimu
function toggleTheme() {
  const html = document.documentElement;
  if (html.classList.contains('dark')) {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  } else {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
}

// Nastavení výchozího režimu při načtení
window.addEventListener('DOMContentLoaded', () => {
  const theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  }

  // Dropdowny
  const dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector('.dropdown-trigger');
    const menu = dropdown.querySelector('.dropdown-menu');

    trigger.addEventListener('click', () => {
      menu.classList.toggle('hidden');
    });

    // Zavření když klikneš mimo
    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        menu.classList.add('hidden');
      }
    });
  });
});
