document.addEventListener('DOMContentLoaded', () => {
    const page = window.location.pathname.split('/').pop();
    fetch('units.json')
        .then(response => response.json())
        .then(data => {
            if (page === 'gateway.html') {
                populateTable('gatewayUnits', data.gatewayUnits, formatGatewayUnits);
            } else if (page === 'comfort.html') {
                populateTable('comfortUnits', data.comfortUnits, formatComfortUnits);
                addComfortUnitsDescription();
            } else if (page === 'bsg.html') {
                populateTable('bsgUnits', data.bsgUnits, formatBsgUnits);
            }
        });
        
    adjustMenuToggleSize();
    window.addEventListener('resize', adjustMenuToggleSize);
    fetchUpdates(); // Přidáno volání funkce pro načítání aktualizací
    if (page === 'code.html') {
        // Event listenery pro automatický výpočet
        const totalVolume = document.getElementById("totalVolume");
        const totalVolumeUnit = document.getElementById("totalVolumeUnit");
        const ratioSelect = document.getElementById("ratioSelect");
        const customRatio = document.getElementById("customRatio");

        if (totalVolume && totalVolumeUnit && ratioSelect && customRatio) {
            totalVolume.addEventListener("input", calculate);
            totalVolumeUnit.addEventListener("change", calculate);
            ratioSelect.addEventListener("change", calculate);
            customRatio.addEventListener("input", calculate);
            // Prvotní výpočet
            calculate();
        }
    }
});

function fetchUpdates() {
    fetch('releases/vcdsopener/version.json') // Ujistěte se, že cesta je správná
        .then(response => {
            if (!response.ok) {
                // Vylepšené chybové hlášení pro síťové problémy
                throw new Error(`Chyba sítě: ${response.status} ${response.statusText}`);
            }
            return response.json(); // Zpracovat odpověď jako JSON
        })
        .then(data => {
            // Kontrola, zda data obsahují platné pole 'updates' a není prázdné
            if (!data || !Array.isArray(data.updates) || data.updates.length === 0) {
                console.error('JSON data jsou neplatná, neobsahují pole "updates" nebo je pole prázdné.');
                // Můžete zde přidat i zobrazení chyby uživateli
                const whatsNewList = document.getElementById('whats-new-list');
                if (whatsNewList) {
                    whatsNewList.innerHTML = '<li>Informace o aktualizacích nejsou momentálně dostupné.</li>';
                }
                return; // Ukončit funkci
            }

            // --- ZMĚNA: Získání PRVNÍ položky jako nejnovější ---
            const latestUpdate = data.updates[0];

            // Zkontrolovat, zda nejnovější aktualizace a její 'whatsNew' existují
            if (!latestUpdate || typeof latestUpdate.whatsNew !== 'string') {
                console.error('Nejnovější záznam v JSON nemá platný formát nebo chybí "whatsNew".');
                const whatsNewList = document.getElementById('whats-new-list');
                if (whatsNewList) {
                    whatsNewList.innerHTML = '<li>Popis novinek pro poslední verzi chybí.</li>';
                }
                return; // Ukončit funkci
            }

            const whatsNewText = latestUpdate.whatsNew;
            const whatsNewList = document.getElementById('whats-new-list');

            // Zkontrolovat, zda element pro seznam existuje v HTML
            if (!whatsNewList) {
                console.error('HTML element s ID "whats-new-list" nebyl nalezen.');
                return; // Ukončit funkci, pokud není kam vkládat
            }

            // Vyčistit seznam před přidáním nových položek
            whatsNewList.innerHTML = '';

            // --- ZMĚNA: Rozdělení textu podle " - " ---
            // Předpokládáme, že každý bod začíná " - " (s mezerou před i za pomlčkou)
            // Rozdělíme string podle tohoto vzoru. Výsledné pole bude obsahovat
            // texty *mezi* těmito oddělovači. První prvek může být prázdný, pokud text začíná " - ".
            const updatePoints = whatsNewText.split(' - ');

            updatePoints.forEach(point => {
                const trimmedPoint = point.trim(); // Odstranit bílé znaky z okolí

                // Přidat položku pouze pokud není po oříznutí prázdná
                if (trimmedPoint) {
                    const li = document.createElement('li');
                    // Zobrazíme text *bez* úvodní pomlčky a mezery,
                    // protože ty sloužily jako oddělovač.
                    li.textContent = trimmedPoint;
                    whatsNewList.appendChild(li);
                }
            });

            // Pokud by po rozdělení a ořezání nezůstaly žádné platné body
            if (whatsNewList.children.length === 0 && whatsNewText.trim() !== '') {
                 console.warn('Text "whatsNew" byl nalezen, ale nepodařilo se jej rozdělit na body pomocí " - ". Zobrazuji jako jeden blok.');
                 const li = document.createElement('li');
                 li.textContent = whatsNewText.trim(); // Zobrazit celý text jako nouzové řešení
                 whatsNewList.appendChild(li);
            } else if (whatsNewList.children.length === 0) {
                 // Pokud byl text whatsNew prázdný
                 whatsNewList.innerHTML = '<li>Pro tuto verzi nejsou uvedeny žádné novinky.</li>';
            }

        })
        .catch(error => {
            console.error('Došlo k chybě při načítání nebo zpracování version.json:', error);
            // Zobrazit chybu uživateli
            const whatsNewList = document.getElementById('whats-new-list');
            if (whatsNewList) {
                // Zobrazit obecnou chybu nebo specifickou z error.message
                whatsNewList.innerHTML = `<li>Chyba při načítání novinek: ${error.message}</li>`;
            }
        });
}

// Příklad volání funkce (např. po načtení stránky)
// document.addEventListener('DOMContentLoaded', fetchUpdates);

// Pro spuštění funkce (například po načtení stránky):
// document.addEventListener('DOMContentLoaded', fetchUpdates);
// nebo ji zavolejte, jak potřebujete.
function populateTable(id, units, formatter) {
    const container = document.getElementById(id);
    const tableContainer = document.createElement('div');
    tableContainer.classList.add('table-container');
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headers = Object.keys(units[0]);
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.addEventListener('click', () => sortTable(table, headers.indexOf(header)));
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    units.forEach(unit => {
        const row = document.createElement('tr');
        formatter(row, unit);
        tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);
    container.appendChild(tableContainer);
}

function formatGatewayUnits(row, unit) {
    Object.keys(unit).forEach(key => {
        const cell = document.createElement('td');
        if (key === 'partNumber') {
            cell.innerHTML = `${unit[key]} <i class="fas fa-copy copy-icon" onclick="copyToClipboard('${unit[key]}')"></i>`;
        } else {
            cell.textContent = unit[key];
        }
        if (key === 'compatible' && unit[key] === 'Ne') {
            cell.classList.add('compatible-no');
        }
        if (key === 'compatible' && unit[key] === 'Ano') {
            cell.classList.add('compatible-yes');
        }
        if (key === 'notes' && unit[key] === 'Dostupná aktualizace') {
            cell.classList.add('compatible-yes');
        }
        if (key === 'notes' && unit[key] === 'Nevybíjí baterii') {
            cell.classList.add('compatible-yes');
        }
        if (key === 'notes' && unit[key] === 'Pouze výměna') {
            cell.classList.add('compatible-no');
        }
        row.appendChild(cell);
    });
}

function formatComfortUnits(row, unit) {
    Object.keys(unit).forEach(key => {
        const cell = document.createElement('td');
        if (key === 'partNumber') {
            cell.innerHTML = `${unit[key]} <i class="fas fa-copy copy-icon" onclick="copyToClipboard('${unit[key]}')"></i>`;
        } else if (key === 'notes') {
            const notes = unit[key].split('\n');
            notes.forEach(note => {
                const noteSpan = document.createElement('span');
                noteSpan.textContent = note;
                if (note.includes('Highend')) {
                    noteSpan.classList.add('notes-high-end');
                }
                if (note.includes('Podpora Komfortního Menu v Maxidotu')) {
                    noteSpan.classList.add('notes-comfort-menu');
                }
                cell.appendChild(noteSpan);
                cell.appendChild(document.createElement('br'));
            });
        } else if (key === 'frequency' && unit[key].includes('PR-5D1: 434 Mhz')) {
            const frequencySpan = document.createElement('span');
            frequencySpan.textContent = unit[key];
            frequencySpan.classList.add('notes-comfort-menu');
            cell.appendChild(frequencySpan);
        } else if (key === 'frequency' && unit[key].includes('PR-5D')) {
            const frequencySpan = document.createElement('span');
            frequencySpan.textContent = unit[key];
            frequencySpan.classList.add('notes-medium');
            cell.appendChild(frequencySpan);
        } else {
            cell.textContent = unit[key];
        }
        row.appendChild(cell);
    });
}
function populate7N0Table() {
    fetch('units7N0.json')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('7N0TableContainer');
            const tableContainer = document.createElement('div');
            tableContainer.classList.add('table-container');
            const table = document.createElement('table');
            const thead = document.createElement('thead');
            const tbody = document.createElement('tbody');

            const headers = Object.keys(data.gatewayUnits[0]);
            const headerRow = document.createElement('tr');
            headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                th.addEventListener('click', () => sortTable(table, headers.indexOf(header)));
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);

            data.gatewayUnits.forEach(unit => {
                const row = document.createElement('tr');
                formatGatewayUnits(row, unit); // Použijeme stejnou funkci pro formátování jako u ostatních gateway jednotek
                tbody.appendChild(row);
            });

            table.appendChild(thead);
            table.appendChild(tbody);
            tableContainer.appendChild(table);
            container.appendChild(tableContainer);
        });
}

// Zobrazí/skryje tabulku po kliknutí na odkaz 
const toggle7N0Info = document.getElementById('toggle7N0Info');
if (toggle7N0Info) {
    toggle7N0Info.addEventListener('click', (event) => {
        event.preventDefault();
        const tableContainer = document.getElementById('7N0TableContainer');
        if (tableContainer.innerHTML === '') {
            populate7N0Table(); // Načte tabulku, pokud ještě nebyla načtena
        }
        if (tableContainer.style.display === 'none') {
            tableContainer.style.display = 'block';
            // Přidáme posun na tabulku
            setTimeout(() => {
                tableContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50); // Malé zpoždění pro plynulejší animaci
        } else {
            tableContainer.style.display = 'none';
        }
    });
}
function formatBsgUnits(row, unit) {
    Object.keys(unit).forEach(key => {
        const cell = document.createElement('td');
        if (key === 'partNumber') {
            cell.innerHTML = `${unit[key]} <i class="fas fa-copy copy-icon" onclick="copyToClipboard('${unit[key]}')"></i>`;
        } else {
            cell.textContent = unit[key];
        }
        if (key === 'notes') {
            if (unit[key] === 'Medium') {
                cell.classList.add('notes-medium');
            }
            if (unit[key] === 'Highend') {
                cell.classList.add('notes-highend');
            }
        }
        if (key === 'fogLightSupport') {
            if (unit[key] === 'Ne') {
                cell.classList.add('fog-light-no');
            }
            if (unit[key] === 'Mlhovkami') {
                cell.classList.add('fog-light-mlhovkami');
            }
            if (unit[key] === 'Pouze dálkovými světly') {
                cell.classList.add('fog-light-dalkovymi');
            }
        }
        row.appendChild(cell);
    });
}
fetch('https://api.ipify.org?format=json')
  .then(response => response.json())
  .then(data => {
    console.log('Vaše IP adresa:', data.ip);
    // Zde můžete IP adresu dále zpracovat, např. zobrazit na stránce
    const ipAddressElement = document.getElementById('ip-address');
    if (ipAddressElement) {
        ipAddressElement.textContent = data.ip;
    }
  })
  .catch(error => {
    console.error('Chyba při získávání IP adresy:', error);
  });
function addComfortUnitsDescription() {
    const container = document.getElementById('comfortUnitsDescription');
    const descriptionContainer = document.createElement('div');
    descriptionContainer.classList.add('description-container');
    descriptionContainer.innerHTML = `
        <h2>Zkratky v tabulce Komfortních Jednotek:</h2>
        <p><strong>NAR</strong> – North American Region: Vozidla nebo komponenty určené pro severoamerický trh (USA, Kanada). Splňují standardy DOT/SAE.</p>
        <p><strong>JOK</strong> – Japan, Oceania, Korea: Specifikace vozidel nebo dílů pro Japonsko, oblast Oceánie (Austrálie, Nový Zéland) a Jižní Koreu. Obvykle se řídí místními předpisy a normami.</p>
        <p><strong>J</strong> – Japan: Vozidla nebo komponenty specificky určené pro japonský trh.</p>
    `;
    container.appendChild(descriptionContainer);
}


function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const notification = document.getElementById('copyNotification');
        if (notification) {
            notification.style.display = 'block';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 2000);
        }
    });
}

function sortTable(table, columnIndex) {
    const rows = Array.from(table.tBodies[0].rows);
    const isAscending = table.tHead.rows[0].cells[columnIndex].classList.toggle('asc');
    rows.sort((rowA, rowB) => {
        const cellA = rowA.cells[columnIndex].textContent.trim();
        const cellB = rowB.cells[columnIndex].textContent.trim();
        return isAscending ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
    });
    rows.forEach(row => table.tBodies[0].appendChild(row));
}

function openImage(src) {
    window.open(src, '_blank');
}

function toggleMenu() {
    const menu = document.querySelector('nav ul');
    if (menu) {
        menu.classList.toggle('show');
    }
}

function adjustMenuToggleSize() {
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        if (window.innerWidth <= 768) {
            menuToggle.style.minWidth = '30px';
            menuToggle.style.maxWidth = '50px';
        } else {
            menuToggle.style.minWidth = '';
            menuToggle.style.maxWidth = '';
        }
    }
}

// Dilution calculator functions
function calculate() {
    const totalVolume = parseFloat(document.getElementById("totalVolume").value);
    const totalVolumeUnit = document.getElementById("totalVolumeUnit").value;
    const ratioSelect = document.getElementById("ratioSelect").value;
    const customRatio = parseFloat(document.getElementById("customRatio").value);
    const round = document.getElementById("round").checked;

    let ratio;
    if (ratioSelect === "custom") {
        ratio = customRatio;
    } else {
        ratio = parseFloat(ratioSelect.split(":")[1]);
    }

    // Konverze na ml
    let totalVolumeMl = convertToMl(totalVolume, totalVolumeUnit);

    const concentrateMl = totalVolumeMl / (1 + ratio);
    const waterMl = totalVolumeMl - concentrateMl;

    // Konverze zpět na zvolené jednotky
    const concentrate = convertFromMl(concentrateMl, totalVolumeUnit);
    const water = convertFromMl(waterMl, totalVolumeUnit);

    if (round) {
        document.getElementById("concentrate").textContent = concentrate.toFixed(2);
        document.getElementById("water").textContent = water.toFixed(2);
    } else {
        document.getElementById("concentrate").textContent = concentrate;
        document.getElementById("water").textContent = water;
    }

    document.getElementById("concentrateUnit").textContent = totalVolumeUnit;
    document.getElementById("waterUnit").textContent = totalVolumeUnit;
}

function convertToMl(value, unit) {
    switch (unit) {
        case "l":
            return value * 1000;
        case "oz":
            return value * 29.5735;
        case "gal":
            return value * 3785.41;
        default: // ml
            return value;
    }
}

function convertFromMl(value, unit) {
    switch (unit) {
        case "l":
            return value / 1000;
        case "oz":
            return value / 29.5735;
        case "gal":
            return value / 3785.41;
        default: // ml
            return value;
    }
}

// Zobrazení/skrytí pole pro vlastní poměr
document.getElementById("ratioSelect").addEventListener("change", function() {
    const customRatioInput = document.getElementById("customRatio");
    if (this.value === "custom") {
        customRatioInput.style.display = "inline-block";
    } else {
        customRatioInput.style.display = "none";
    }
});
