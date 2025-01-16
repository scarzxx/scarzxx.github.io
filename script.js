document.addEventListener('DOMContentLoaded', () => {
    const page = window.location.pathname.split('/').pop();
    fetch('units.json')
        .then(response => response.json())
        .then(data => {
            if (page === 'gateway.html') {
                populateTable('gatewayUnits', data.gatewayUnits, formatGatewayUnits);
            } else if (page === 'comfort.html') {
                populateTable('comfortUnits', data.comfortUnits, formatComfortUnits);
            } else if (page === 'bsg.html') {
                populateTable('bsgUnits', data.bsgUnits, formatBsgUnits);
            }
        });
        if (page === 'download.html') {
          fetchUpdates();
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

function populateTable(id, units, formatter) {
    const container = document.getElementById(id);
    const tableContainer = document.createElement('div');
    tableContainer.classList.add('table-responsive'); // Přidáno pro responzivní tabulky
    const table = document.createElement('table');
    table.classList.add('table', 'table-striped', 'table-bordered', 'table-hover'); // Přidány Bootstrap třídy pro tabulku
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headers = Object.keys(units[0]);
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.scope = 'col'; // Přidáno pro správné zobrazení v Bootstrapu
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
        // Změněno z 'compatible' na 'notes'
        if (key === 'notes' && unit[key].includes('Nevybíjí baterii')) {
            cell.classList.add('compatible-yes');
        }
        if (key === 'notes' && unit[key].includes('Dostupná aktualizace')) {
            cell.classList.add('compatible-yes');
        }
        if (key === 'notes' && unit[key].includes('Pouze výměna')) {
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
            table.classList.add('table', 'table-striped', 'table-bordered', 'table-hover');
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

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const notification = document.getElementById('copyNotification');
        notification.classList.add('show'); // Přidáme třídu pro zobrazení
        setTimeout(() => {
            notification.classList.remove('show'); // Odebereme třídu pro skrytí
        }, 2000);
    });
}

function sortTable(table, columnIndex) {
    const tbody = table.tBodies[0];
    const rows = Array.from(tbody.rows);
    const isAscending = !table.tHead.rows[0].cells[columnIndex].classList.contains('asc');
    
    // Odstranění tříd 'asc' a 'desc' ze všech hlaviček
    Array.from(table.tHead.rows[0].cells).forEach(header => {
        header.classList.remove('asc', 'desc');
    });

    // Přidání třídy 'asc' nebo 'desc' na kliknutou hlavičku
    table.tHead.rows[0].cells[columnIndex].classList.toggle('asc', isAscending);
    table.tHead.rows[0].cells[columnIndex].classList.toggle('desc', !isAscending);

    rows.sort((rowA, rowB) => {
        const cellA = rowA.cells[columnIndex].textContent.trim();
        const cellB = rowB.cells[columnIndex].textContent.trim();
        // Porovnání jako čísla, pokud je to možné, jinak jako stringy
        const numA = parseFloat(cellA);
        const numB = parseFloat(cellB);
        if (!isNaN(numA) && !isNaN(numB)) {
            return isAscending ? numA - numB : numB - numA;
        } else {
            return isAscending ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
        }
    });

    // Odstranění existujících řádků a vložení seřazených
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
    rows.forEach(row => tbody.appendChild(row));
}

function openImage(src) {
    window.open(src, '_blank');
}

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
  
  // Funkce pro práci s LocalStorage
  function saveToLocalStorage() {
      const data = {
          totalVolume: document.getElementById("totalVolume").value,
          totalVolumeUnit: document.getElementById("totalVolumeUnit").value,
          ratioSelect: document.getElementById("ratioSelect").value,
          customRatio: document.getElementById("customRatio").value,
          round: document.getElementById("round").checked
      };
      localStorage.setItem("dilutionCalculatorData", JSON.stringify(data));
      alert("Data byla uložena do LocalStorage.");
  }
  
  function loadFromLocalStorage() {
      const data = JSON.parse(localStorage.getItem("dilutionCalculatorData"));
      if (data) {
          document.getElementById("totalVolume").value = data.totalVolume;
          document.getElementById("totalVolumeUnit").value = data.totalVolumeUnit;
          document.getElementById("ratioSelect").value = data.ratioSelect;
          document.getElementById("customRatio").value = data.customRatio;
          document.getElementById("round").checked = data.round;
          calculate();
          alert("Data byla načtena z LocalStorage.");
      } else {
          alert("Žádná data nebyla nalezena v LocalStorage.");
      }
  }
  
  function clearLocalStorage() {
      localStorage.removeItem("dilutionCalculatorData");
      alert("Data byla vymazána z LocalStorage.");
  }
  
  // Event listenery pro automatický výpočet
  document.getElementById("totalVolume").addEventListener("input", calculate);
  document.getElementById("totalVolumeUnit").addEventListener("change", calculate);
  document.getElementById("ratioSelect").addEventListener("change", calculate);
  document.getElementById("customRatio").addEventListener("input", calculate);
  document.getElementById("round").addEventListener("change", calculate);
  
  // Prvotní výpočet
  calculate();