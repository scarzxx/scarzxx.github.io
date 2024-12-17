function changeLanguage(lang) {
    localStorage.setItem('language', lang); // Uloží zvolený jazyk do localStorage
    applyLanguage(lang);
}

function applyLanguage(lang) {
    // Skryje všechny elementy s třídou lang-*, kromě těch s třídou lang-{lang}
    const allLangElements = document.querySelectorAll('[class*="lang-"]');
    allLangElements.forEach(element => {
        element.style.display = 'none';
    });

    // Zobrazí všechny elementy s třídou lang-{lang}
    const currentLangElements = document.querySelectorAll(`.lang-${lang}`);
    currentLangElements.forEach(element => {
        element.style.display = 'inline'; // Pro inline elementy
        if (element.tagName === 'P' || element.tagName === 'H1' || element.tagName === 'H2' || element.tagName === 'TH' || element.tagName === 'TD' || element.tagName === 'B' || element.tagName === 'SPAN') {
            element.style.display = 'block'; // Pro block-level elementy
        }
        if (element.tagName === 'TD'){
            element.style.display = 'table-cell';
        }
    });
}

// Při načtení stránky se podívá do localStorage, jaký je zvolený jazyk, a ten aplikuje
window.addEventListener('load', () => {
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage) {
        applyLanguage(storedLanguage);
    } else {
        applyLanguage('cz'); // Výchozí jazyk
    }
});
