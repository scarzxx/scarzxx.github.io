document.addEventListener('DOMContentLoaded', () => {
    const page = window.location.pathname.split('/').pop();

    // Funkce pro načtení a zobrazení tabulek
    function loadAndPopulateTable(url, tableId, formatter) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (page === 'gateway.html' && tableId === 'gatewayUnits') {
                    populateTable(tableId, data.gatewayUnits, formatter);
                } else if (page === 'comfort.html' && tableId === 'comfortUnits') {
                    populateTable(tableId, data.comfortUnits, formatter);
                    addComfortUnitsDescription();
                } else if (page === 'bsg.html' && tableId === 'bsgUnits') {
                    populateTable(tableId, data.bsgUnits, formatter);
                } else if (page === 'gateway.html' && tableId === '7N0TableContainer'){
                    populateTable(tableId, data.gatewayUnits, formatter);
                }
            });
    }

    // Načtení příslušných tabulek pro danou stránku
    if (page === 'gateway.html') {
        loadAndPopulateTable('units.json', 'gatewayUnits', formatGatewayUnits);
        // Tabulka 7N0 se načte po kliknutí na odkaz
        const toggle7N0Info = document.getElementById('toggle7N0Info');
        if (toggle7N0Info) {
            toggle7N0Info.addEventListener('click', (event) => {
                event.preventDefault();
                const tableContainer = document.getElementById('7N0TableContainer');
                if (tableContainer.classList.contains('hidden')) {
                    // Načte tabulku, pokud ještě nebyla načtena
                    if (!tableContainer.querySelector('table')) {
                        loadAndPopulateTable('units7N0.json', '7N0TableContainer', formatGatewayUnits);
                    }
                    tableContainer.classList.remove('hidden');
                } else {
                    tableContainer.classList.add('hidden');
                }
            });
        }
    } else if (page === 'comfort.html') {
        loadAndPopulateTable('units.json', 'comfortUnits', formatComfortUnits);
    } else if (page === 'bsg.html') {
        loadAndPopulateTable('units.json', 'bsgUnits', formatBsgUnits);
    }

    adjustMenuToggleSize();
    window.addEventListener('resize', adjustMenuToggleSize);
    fetchUpdates();

    if (page === 'code.html') {
        const totalVolume = document.getElementById("totalVolume");
        const totalVolumeUnit = document.getElementById("totalVolumeUnit");
        const ratioSelect = document.getElementById("ratioSelect");
        const customRatio = document.getElementById("customRatio");

        if (totalVolume && totalVolumeUnit && ratioSelect && customRatio) {
            totalVolume.addEventListener("input", calculate);
            totalVolumeUnit.addEventListener("change", calculate);
            ratioSelect.addEventListener("change", calculate);
            customRatio.addEventListener("input", calculate);
            calculate();
        }
    }
});

function fetchUpdates() {
    fetch('releases/vcdsopener/version.xml')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xml = parser.parseFromString(data, 'application/xml');
            const updates = xml.getElementsByTagName('update');
            const latestUpdate = updates[updates.length - 1];
            const whatsNew = latestUpdate.getElementsByTagName('whatsNew')[0].textContent;
            const whatsNewList = document.getElementById('whats-new-list');
            whatsNew.split('\n').forEach(item => {
                if (item.trim()) {
                    const li = document.createElement('li');
                    li.textContent = item.trim();
                    whatsNewList.appendChild(li);
                }
            });
        })
        .catch(error => console.error('Error fetching version.xml:', error));
}

function populateTable(tableId, units, formatter) {
    const container = document.getElementById(tableId);
    const table = document.createElement('table');
    table.classList.add('w-full', 'border-collapse');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headers = Object.keys(units[0]);
    const headerRow = document.createElement('tr');
    headerRow.classList.add('bg-gray-700');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.classList.add('px-4', 'py-2', 'text-left', 'text-gray-200','cursor-pointer');
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
    container.appendChild(table);
}

function formatGatewayUnits(row, unit) {
    Object.keys(unit).forEach(key => {
        const cell = document.createElement('td');
        cell.classList.add('px-4', 'py-2', 'border-b', 'border-gray-200', 'dark:border-gray-600','text-gray-200');
        if (key === 'partNumber') {
            cell.innerHTML = `${unit[key]} <i class="fas fa-copy copy-icon text-blue-500 hover:text-blue-700 cursor-pointer"></i>`;
            cell.querySelector('.fa-copy').addEventListener('click', () => copyToClipboard(unit[key]));
        } else {
            cell.textContent = unit[key];
        }
        if (key === 'compatible') {
            if (unit[key] === 'Ne') {
                cell.classList.add('bg-compatible-no-bg', 'text-compatible-no-text');
            } else if (unit[key] === 'Ano') {
                cell.classList.add('bg-compatible-yes-bg', 'text-compatible-yes-text');
            }
        }
        if (key === 'notes' && (unit[key] === 'Dostupná aktualizace' || unit[key] === 'Nevybíjí baterii')) {
            cell.classList.add('bg-compatible-yes-bg', 'text-compatible-yes-text');
        } else if (key === 'notes' && unit[key] === 'Pouze výměna') {
            cell.classList.add('bg-compatible-no-bg', 'text-compatible-no-text');
        }
        row.appendChild(cell);
    });
}

function formatComfortUnits(row, unit) {
    Object.keys(unit).forEach(key => {
        const cell = document.createElement('td');
        cell.classList.add('px-4', 'py-2', 'border-b', 'border-gray-200', 'dark:border-gray-600','text-gray-200');
        if (key === 'partNumber') {
            cell.innerHTML = `${unit[key]} <i class="fas fa-copy copy-icon text-blue-500 hover:text-blue-700 cursor-pointer"></i>`;
            cell.querySelector('.fa-copy').addEventListener('click', () => copyToClipboard(unit[key]));
        } else if (key === 'notes') {
            const notes = unit[key].split('\n');
            notes.forEach(note => {
                const noteSpan = document.createElement('span');
                noteSpan.textContent = note;
                if (note.includes('Highend')) {
                    noteSpan.classList.add('text-yellow-500');
                }
                if (note.includes('Podpora Komfortního Menu v Maxidotu')) {
                    noteSpan.classList.add('text-green-500');
                }
                cell.appendChild(noteSpan);
                cell.appendChild(document.createElement('br'));
            });
        } else if (key === 'frequency' && unit[key].includes('PR-5D1: 434 Mhz')) {
            const frequencySpan = document.createElement('span');
            frequencySpan.textContent = unit[key];
            frequencySpan.classList.add('text-green-500');
            cell.appendChild(frequencySpan);
        } else if (key === 'frequency' && unit[key].includes('PR-5D')) {
            const frequencySpan = document.createElement('span');
            frequencySpan.textContent = unit[key];
            frequencySpan.classList.add('text-yellow-500');
            cell.appendChild(frequencySpan);
        } else {
            cell.textContent = unit[key];
        }
        row.appendChild(cell);
    });
}

function formatBsgUnits(row, unit) {
    Object.keys(unit).forEach(key => {
        const cell = document.createElement('td');
        cell.classList.add('px-4', 'py-2', 'border-b', 'border-gray-200', 'dark:border-gray-600','text-gray-200');
        if (key === 'partNumber') {
            cell.innerHTML = `${unit[key]} <i class="fas fa-copy copy-icon text-blue-500 hover:text-blue-700 cursor-pointer"></i>`;
            cell.querySelector('.fa-copy').addEventListener('click', () => copyToClipboard(unit[key]));
        } else {
            cell.textContent = unit[key];
        }
        if (key === 'notes') {
            if (unit[key] === 'Medium') {
                cell.classList.add('text-yellow-500');
            }
            if (unit[key] === 'Highend') {
                cell.classList.add('text-green-500');
            }
        }
        if (key === 'fogLightSupport') {
            if (unit[key] === 'Ne') {
                cell.classList.add('bg-compatible-no-bg', 'text-compatible-no-text');
            }
            if (unit[key] === 'Mlhovkami') {
                cell.classList.add('bg-compatible-yes-bg', 'text-compatible-yes-text');
            }
            if (unit[key] === 'Pouze dálkovými světly') {
                cell.classList.add('bg-yellow-200', 'text-yellow-800');
            }
        }
        row.appendChild(cell);
    });
}

fetch('https://api.ipify.org?format=json')
  .then(response => response.json())
  .then(data => {
    console.log('Vaše IP adresa:', data.ip);
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
    descriptionContainer.classList.add('mt-4');
    descriptionContainer.innerHTML = `
        <h2 class="text-xl font-bold mb-2 text-gray-200">Zkratky v tabulce Komfortních Jednotek:</h2>
        <p class="text-gray-200"><strong>NAR</strong> – North American Region: Vozidla nebo komponenty určené pro severoamerický trh (USA, Kanada). Splňují standardy DOT/SAE.</p>
        <p class="text-gray-200"><strong>JOK</strong> – Japan, Oceania, Korea: Specifikace vozidel nebo dílů pro Japonsko, oblast Oceánie (Austrálie, Nový Zéland) a Jižní Koreu. Obvykle se řídí místními předpisy a normami.</p>
        <p class="text-gray-200"><strong>J</strong> – Japan: Vozidla nebo komponenty specificky určené pro japonský trh.</p>
    `;
    container.appendChild(descriptionContainer);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const notification = document.getElementById('copyNotification');
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

function sortTable(table, columnIndex) {
    const rows = Array.from(table.tBodies[0].rows);
    const isAscending = !table.tHead.rows[0].cells[columnIndex].classList.contains('asc');
    table.tHead.rows[0].cells[columnIndex].classList.toggle('asc', isAscending);
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

// Funkce pro kalkulačku ředění (pokud je script.js sdílený mezi více stránkami)
if (page === 'code.html') {
    function calculate() {
        // ... (zbytek kódu pro kalkulačku ředění)
    }
}