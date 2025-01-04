function sortTable(tableId, column) {
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  table = document.getElementById(tableId);
  switching = true;
  dir = "asc";
  while (switching) {
    switching = false;
    rows = table.rows;
    for (i = 1; i < (rows.length - 1); i++) {
      shouldSwitch = false;
      x = rows[i].getElementsByTagName("TD")[column];
      y = rows[i + 1].getElementsByTagName("TD")[column];
      if (dir == "asc") {
        if (compare(x.innerHTML.toLowerCase(), y.innerHTML.toLowerCase(), column)) {
          shouldSwitch = true;
          break;
        }
      } else if (dir == "desc") {
        if (compare(y.innerHTML.toLowerCase(), x.innerHTML.toLowerCase(), column)) {
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      switchcount ++;
    } else {
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
  }
}

function compare(a, b, column) {
    if (column === 1) {
        return parseInt(a) > parseInt(b);
    } else {
        return a > b;
    }
}

function setActiveMenuItem() {
  const currentPath = window.location.pathname;
  const menuItems = document.querySelectorAll('.top-menu a');

  menuItems.forEach(item => {
    item.classList.remove('active');
    if (currentPath.endsWith(item.getAttribute('href')) || (currentPath.endsWith('/') && item.getAttribute('href') === 'index.html')) {
      item.classList.add('active');
    }
  });
}

window.addEventListener('load', setActiveMenuItem);
window.addEventListener('scroll', setActiveMenuItem);

function toggleMenu() {
  const menuList = document.getElementById("menu-list");

  if (window.innerWidth <= 768) {
    menuList.classList.toggle("show");
  } else {
    menuList.classList.remove("show");
  }
}

const menuItems = document.querySelectorAll('.top-menu a');
menuItems.forEach(item => {
  item.addEventListener('click', () => {
    const isDownloadPage = window.location.pathname.endsWith("download.html");
    if (window.innerWidth <= 768 && !isDownloadPage) {
      document.getElementById("menu-list").classList.remove("show");
    }
  });
});

function copyToClipboard(spanElement) {
    const tdElement = spanElement.parentNode;
    const range = document.createRange();
    range.selectNodeContents(tdElement);
    const icon = tdElement.querySelector('.copy-icon');
    range.setEndBefore(icon);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    navigator.clipboard.writeText(range.toString().trim())
        .then(() => {
            const notification = document.createElement("div");
            notification.classList.add("copy-notification");
            notification.textContent = "Zkopírováno!";
            document.body.appendChild(notification);
            setTimeout(() => {
                notification.classList.add("show");
            }, 10); // Přidání třídy show pro zobrazení notifikace
            setTimeout(() => {
                notification.classList.remove("show");
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 500);
            }, 3000);
        })
        .catch(err => {
            console.error('Nepodařilo se zkopírovat text: ', err);
        });
}

window.addEventListener('scroll', function() {
  const topMenu = document.getElementById('top-menu');
  if (window.scrollY > 50) {
    topMenu.classList.add('compact');
  } else {
    topMenu.classList.remove('compact');
  }
});
