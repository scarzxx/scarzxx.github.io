function sortTable(tableId, column) {
    // ... (funkce sortTable zůstává beze změny) ...
}

function compare(a, b, column) {
    // ... (funkce compare zůstává beze změny) ...
}

// Funkce pro nastavení aktivní položky menu
function setActiveMenuItem() {
    // ... (funkce setActiveMenuItem zůstává beze změny) ...
}

// Zavolání funkce při načtení stránky a při skrolování
window.addEventListener('load', setActiveMenuItem);
window.addEventListener('scroll', setActiveMenuItem);

// Funkce pro zobrazení/skrytí menu po kliknutí na hamburger ikonu
function toggleMenu() {
    const menuList = document.getElementById("menu-list");
    const isDownloadPage = window.location.pathname.endsWith("download.html");

    if (window.innerWidth <= 768) { // Pokud jsme na mobilním zařízení
        if (isDownloadPage) {
            // Na stránce download.html menu zůstane otevřené
            menuList.classList.add("show"); 
        } else {
            // Na ostatních stránkách se menu chová standardně (rozbalí/sbalí)
            menuList.classList.toggle("show");
        }
    }
}

// Zajištění, že se menu zavře po kliknutí na odkaz mimo download.html
const menuItems = document.querySelectorAll('.top-menu a');
menuItems.forEach(item => {
    item.addEventListener('click', () => {
        const isDownloadPage = window.location.pathname.endsWith("download.html");
        if (window.innerWidth <= 768 && !isDownloadPage) {
            document.getElementById("menu-list").classList.remove("show");
        }
    });
});
