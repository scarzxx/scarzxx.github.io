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
document.getElementById('toggle7N0Info').addEventListener('click', (event) => {
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
    document.getElementById('ip-address').textContent = data.ip;
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
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 2000);
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
    menu.classList.toggle('show');
}

function adjustMenuToggleSize() {
    const menuToggle = document.querySelector('.menu-toggle');
    if (window.innerWidth <= 768) {
        menuToggle.style.minWidth = '30px';
        menuToggle.style.maxWidth = '50px';
    } else {
        menuToggle.style.minWidth = '';
        menuToggle.style.maxWidth = '';
    }
}
