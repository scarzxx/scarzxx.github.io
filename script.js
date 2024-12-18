function sortTable(tableId, column) {
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  table = document.getElementById(tableId);
  switching = true;
  // Set the sorting direction to ascending:
  dir = "asc";
  /* Make a loop that will continue until
  no switching has been done: */
  while (switching) {
    // Start by saying: no switching is done:
    switching = false;
    rows = table.rows;
    /* Loop through all table rows (except the
    first, which contains table headers): */
    for (i = 1; i < (rows.length - 1); i++) {
      // Start by saying there should be no switching:
      shouldSwitch = false;
      /* Get the two elements you want to compare,
      one from current row and one from the next: */
      x = rows[i].getElementsByTagName("TD")[column];
      y = rows[i + 1].getElementsByTagName("TD")[column];
      /* Check if the two rows should switch place,
      based on the direction, asc or desc: */
      if (dir == "asc") {
        if (compare(x.innerHTML.toLowerCase(), y.innerHTML.toLowerCase(), column)) {
          // If so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      } else if (dir == "desc") {
        if (compare(y.innerHTML.toLowerCase(), x.innerHTML.toLowerCase(), column)) {
          // If so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      /* If a switch has been marked, make the switch
      and mark that a switch has been done: */
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      // Each time a switch is done, increase this count by 1:
      switchcount ++;
    } else {
      /* If no switching has been done AND the direction is "asc",
      set the direction to "desc" and run the while loop again. */
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
  }
}

function compare(a, b, column) {
    // Special handling for columns with specific data types
    if (column === 1) { // Počet Byte (numeric)
        return parseInt(a) > parseInt(b);
    } else {
        return a > b;
    }
}

// Funkce pro nastavení aktivní položky menu
function setActiveMenuItem() {
  const currentPath = window.location.pathname;
  const menuItems = document.querySelectorAll('.top-menu a');

  menuItems.forEach(item => {
    item.classList.remove('active');
    // Zkontrolujeme, zda je odkaz relativní a zda odpovídá aktuální cestě
    if (currentPath.endsWith(item.getAttribute('href')) || (currentPath.endsWith('/') && item.getAttribute('href') === 'index.html')) {
      item.classList.add('active');
    }
  });
}

// Zavolání funkce při načtení stránky a při skrolování
window.addEventListener('load', setActiveMenuItem);
window.addEventListener('scroll', setActiveMenuItem);

// Funkce pro zobrazení/skrytí menu po kliknutí na hamburger ikonu
function toggleMenu() {
  const menuList = document.getElementById("menu-list");
  const isDownloadPage = window.location.pathname.endsWith("download.html");

  if (!isDownloadPage) {
    // Pokud nejsme na stránce download.html, chováme se standardně
    menuList.classList.toggle("show");
  } else {
    // Pokud jsme na stránce download.html, menu se na mobilu nezavře
    if (window.innerWidth <= 768) {
      menuList.classList.add("show"); // Force zobrazení menu na mobilu
    } else {
      menuList.classList.remove("show"); // Na desktopu se chováme standardně
    }
  }
}
