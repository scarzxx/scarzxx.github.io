document.addEventListener('DOMContentLoaded', () => {
    fetch('units.json')
        .then(response => response.json())
        .then(data => {
            populateTable('gatewayUnits', data.gatewayUnits, formatGatewayUnits);
            populateTable('comfortUnits', data.comfortUnits, formatComfortUnits);
            populateTable('bsgUnits', data.bsgUnits, formatBsgUnits);
            addComfortUnitsDescription();
        });
});

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
                if (note.includes('High End')) {
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
        } else {
            cell.textContent = unit[key];
        }
        row.appendChild(cell);
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

function addComfortUnitsDescription() {
    const container = document.getElementById('comfortUnits');
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

function addGatewayUnitsDescription() {
    const container = document.getElementById('gatewayUnitsDescription');
    const descriptionContainer = document.createElement('div');
    descriptionContainer.classList.add('description-container');
    descriptionContainer.innerHTML = `
        <h2>Popis:</h2>
<p>Jednotky s číslem 7N0 907 530 XX nezpůsobují vybíjení baterie.</p>
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

document.addEventListener('DOMContentLoaded', function() {
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
});

function openImage(src) {
    window.open(src, '_blank');
}
