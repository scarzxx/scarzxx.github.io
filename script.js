const unitPageMap = {
  'gateway.html': { target: 'gatewayUnits', key: 'gatewayUnits', formatter: formatGatewayUnits },
  'comfort.html': { target: 'comfortUnits', key: 'comfortUnits', formatter: formatComfortUnits },
  'bsg.html': { target: 'bsgUnits', key: 'bsgUnits', formatter: formatBsgUnits }
};

const columnLabels = {
  partNumber: 'Číslo dílu',
  softwareVersion: 'SW verze',
  compatible: 'Kompatibilní',
  notes: 'Poznámka',
  byteCount: 'Byte',
  frequency: 'Frekvence',
  fogLightSupport: 'Přísvit'
};

document.addEventListener('DOMContentLoaded', () => {
  setActiveNavigation();
  loadUnitsForCurrentPage();
  setupGatewayToggle();
  setupSearch();
  setupDilutionCalculator();
  fetchUpdates();
});

function currentPage() {
  return window.location.pathname.split('/').pop() || 'index.html';
}

function setActiveNavigation() {
  const page = currentPage();
  document.querySelectorAll('.nav-link, .dropdown-item').forEach(link => {
    const href = link.getAttribute('href');
    if (href === page) link.classList.add('active');
  });
}

async function loadUnitsForCurrentPage() {
  const config = unitPageMap[currentPage()];
  if (!config) return;

  try {
    const response = await fetch('units.json');
    if (!response.ok) throw new Error('Jednotky se nepodařilo načíst.');
    const data = await response.json();
    const units = data[config.key] || [];
    populateTable(config.target, units, config.formatter);
    updateUnitCounter(units.length);
  } catch (error) {
    const target = document.getElementById(config.target);
    if (target) target.innerHTML = `<div class="alert alert-warning">${error.message}</div>`;
  }
}

function updateUnitCounter(count) {
  const counter = document.querySelector('[data-unit-count]');
  if (counter) counter.textContent = count;
}

function labelFor(header) {
  return columnLabels[header] || header;
}

function populateTable(id, units, formatter) {
  const container = document.getElementById(id);
  if (!container) return;
  container.innerHTML = '';

  if (!Array.isArray(units) || units.length === 0) {
    container.innerHTML = '<div class="alert alert-info">Žádné položky k zobrazení.</div>';
    return;
  }

  const tableContainer = document.createElement('div');
  tableContainer.className = 'table-container';
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const headers = Object.keys(units[0]);
  const headerRow = document.createElement('tr');

  headers.forEach((header, index) => {
    const th = document.createElement('th');
    th.textContent = labelFor(header);
    th.title = 'Seřadit tabulku';
    th.addEventListener('click', () => sortTable(table, index));
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  units.forEach(unit => {
    const row = document.createElement('tr');
    row.dataset.search = Object.values(unit).join(' ').toLowerCase();
    formatter(row, unit);
    tbody.appendChild(row);
  });

  table.append(thead, tbody);
  tableContainer.appendChild(table);
  container.appendChild(tableContainer);
}

function createCopyCell(value) {
  const cell = document.createElement('td');
  const span = document.createElement('span');
  span.textContent = value;
  const icon = document.createElement('i');
  icon.className = 'fas fa-copy copy-icon';
  icon.title = 'Kopírovat číslo dílu';
  icon.addEventListener('click', () => copyToClipboard(value));
  cell.append(span, icon);
  return cell;
}

function formatGatewayUnits(row, unit) {
  Object.keys(unit).forEach(key => {
    const cell = key === 'partNumber' ? createCopyCell(unit[key]) : document.createElement('td');
    if (key !== 'partNumber') cell.textContent = unit[key];
    if (key === 'compatible') cell.classList.add(unit[key] === 'Ano' ? 'compatible-yes' : 'compatible-no');
    if (key === 'notes') {
      if (['Dostupná aktualizace', 'Nevybíjí baterii'].includes(unit[key])) cell.classList.add('compatible-yes');
      if (unit[key] === 'Pouze výměna') cell.classList.add('compatible-no');
    }
    row.appendChild(cell);
  });
}

function formatComfortUnits(row, unit) {
  Object.keys(unit).forEach(key => {
    const cell = key === 'partNumber' ? createCopyCell(unit[key]) : document.createElement('td');
    if (key === 'notes') {
      String(unit[key] || '').split('\n').filter(Boolean).forEach(note => {
        const span = document.createElement('span');
        span.textContent = note;
        if (note.includes('Highend')) span.classList.add('notes-high-end');
        if (note.includes('Podpora Komfortního Menu v Maxidotu')) span.classList.add('notes-comfort-menu');
        cell.append(span, document.createElement('br'));
      });
    } else if (key === 'frequency') {
      const span = document.createElement('span');
      span.textContent = unit[key];
      if (unit[key].includes('PR-5D1: 434 Mhz')) span.classList.add('notes-comfort-menu');
      else if (unit[key].includes('PR-5D')) span.classList.add('notes-medium');
      cell.appendChild(span);
    } else if (key !== 'partNumber') {
      cell.textContent = unit[key];
    }
    row.appendChild(cell);
  });
}

function formatBsgUnits(row, unit) {
  Object.keys(unit).forEach(key => {
    const cell = key === 'partNumber' ? createCopyCell(unit[key]) : document.createElement('td');
    if (key !== 'partNumber') cell.textContent = unit[key];
    if (key === 'notes') {
      if (unit[key] === 'Medium') cell.classList.add('notes-medium');
      if (unit[key] === 'Highend') cell.classList.add('notes-highend');
    }
    if (key === 'fogLightSupport') {
      if (unit[key] === 'Ne') cell.classList.add('fog-light-no');
      if (unit[key] === 'Mlhovkami') cell.classList.add('fog-light-mlhovkami');
      if (unit[key] === 'Pouze dálkovými světly') cell.classList.add('fog-light-dalkovymi');
    }
    row.appendChild(cell);
  });
}

async function populate7N0Table() {
  const container = document.getElementById('7N0TableContainer');
  if (!container || container.dataset.loaded === 'true') return;
  try {
    const response = await fetch('units7N0.json');
    if (!response.ok) throw new Error('Tabulku 7N0 se nepodařilo načíst.');
    const data = await response.json();
    populateTable('7N0TableContainer', data.gatewayUnits || [], formatGatewayUnits);
    container.dataset.loaded = 'true';
  } catch (error) {
    container.innerHTML = `<div class="alert alert-warning">${error.message}</div>`;
  }
}

function setupGatewayToggle() {
  const toggle = document.getElementById('toggle7N0Info');
  if (!toggle) return;
  toggle.addEventListener('click', async event => {
    event.preventDefault();
    const container = document.getElementById('7N0TableContainer');
    if (!container) return;
    await populate7N0Table();
    const isHidden = container.hidden;
    container.hidden = !isHidden;
    toggle.textContent = isHidden ? 'Skrýt tabulku 7N0' : 'Zobrazit tabulku 7N0';
    if (isHidden) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function setupSearch() {
  const input = document.getElementById('unitSearch');
  if (!input) return;
  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    const rows = document.querySelectorAll('tbody tr');
    let visible = 0;
    rows.forEach(row => {
      const match = row.dataset.search.includes(query);
      row.style.display = match ? '' : 'none';
      if (match) visible += 1;
    });
    const result = document.getElementById('searchResultCount');
    if (result) result.textContent = visible;
  });
}

async function fetchUpdates() {
  const whatsNewList = document.getElementById('whats-new-list');
  const versionLabel = document.getElementById('latest-version');
  const hashLabel = document.getElementById('latest-hash');
  if (!whatsNewList && !versionLabel && !hashLabel) return;

  try {
    const response = await fetch('releases/vcdsopener/version.json');
    if (!response.ok) throw new Error('Informace o verzi nejsou dostupné.');
    const data = await response.json();
    const latest = data?.updates?.[0];
    if (!latest) throw new Error('Informace o verzi nejsou dostupné.');

    if (versionLabel) versionLabel.textContent = latest.version || '-';
    if (hashLabel) hashLabel.textContent = latest.hash || '-';
    if (whatsNewList) {
      whatsNewList.innerHTML = '';
      String(latest.whatsNew || '')
        .split(' - ')
        .map(item => item.trim())
        .filter(Boolean)
        .forEach(item => {
          const li = document.createElement('li');
          li.textContent = item;
          whatsNewList.appendChild(li);
        });
      if (!whatsNewList.children.length) whatsNewList.innerHTML = '<li>Pro tuto verzi nejsou uvedené žádné novinky.</li>';
    }
  } catch (error) {
    if (whatsNewList) whatsNewList.innerHTML = `<li>${error.message}</li>`;
  }
}

function setupDilutionCalculator() {
  const totalVolume = document.getElementById('totalVolume');
  const totalVolumeUnit = document.getElementById('totalVolumeUnit');
  const ratioSelect = document.getElementById('ratioSelect');
  const customRatio = document.getElementById('customRatio');
  const round = document.getElementById('round');
  if (!totalVolume || !totalVolumeUnit || !ratioSelect || !customRatio || !round) return;

  const updateCustomVisibility = () => {
    customRatio.style.display = ratioSelect.value === 'custom' ? 'block' : 'none';
  };
  const recalculate = () => calculateDilution(totalVolume, totalVolumeUnit, ratioSelect, customRatio, round);
  [totalVolume, totalVolumeUnit, ratioSelect, customRatio, round].forEach(el => el.addEventListener('input', recalculate));
  ratioSelect.addEventListener('change', () => { updateCustomVisibility(); recalculate(); });
  updateCustomVisibility();
  recalculate();
}

function calculateDilution(totalVolumeEl, unitEl, ratioEl, customEl, roundEl) {
  const totalVolume = parseFloat(totalVolumeEl.value);
  const ratio = ratioEl.value === 'custom' ? parseFloat(customEl.value) : parseFloat(ratioEl.value.split(':')[1]);
  if (!Number.isFinite(totalVolume) || totalVolume <= 0 || !Number.isFinite(ratio) || ratio <= 0) return;

  const unit = unitEl.value;
  const totalVolumeMl = convertToMl(totalVolume, unit);
  const concentrateMl = totalVolumeMl / (1 + ratio);
  const waterMl = totalVolumeMl - concentrateMl;
  const concentrate = convertFromMl(concentrateMl, unit);
  const water = convertFromMl(waterMl, unit);
  const format = value => roundEl.checked ? value.toFixed(2) : String(value);

  document.getElementById('concentrate').textContent = format(concentrate);
  document.getElementById('water').textContent = format(water);
  document.getElementById('concentrateUnit').textContent = unit;
  document.getElementById('waterUnit').textContent = unit;
}

function convertToMl(value, unit) {
  if (unit === 'l') return value * 1000;
  if (unit === 'oz') return value * 29.5735;
  if (unit === 'gal') return value * 3785.41;
  return value;
}

function convertFromMl(value, unit) {
  if (unit === 'l') return value / 1000;
  if (unit === 'oz') return value / 29.5735;
  if (unit === 'gal') return value / 3785.41;
  return value;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    const notification = document.getElementById('copyNotification');
    if (!notification) return;
    notification.style.display = 'block';
    setTimeout(() => { notification.style.display = 'none'; }, 1600);
  });
}

function sortTable(table, columnIndex) {
  const tbody = table.tBodies[0];
  const rows = Array.from(tbody.rows);
  const header = table.tHead.rows[0].cells[columnIndex];
  const ascending = !header.classList.contains('asc');
  table.querySelectorAll('th').forEach(th => th.classList.remove('asc', 'desc'));
  header.classList.add(ascending ? 'asc' : 'desc');
  rows.sort((a, b) => {
    const cellA = a.cells[columnIndex].textContent.trim();
    const cellB = b.cells[columnIndex].textContent.trim();
    return ascending ? cellA.localeCompare(cellB, 'cs', { numeric: true }) : cellB.localeCompare(cellA, 'cs', { numeric: true });
  });
  rows.forEach(row => tbody.appendChild(row));
}

function openImage(src) {
  window.open(src, '_blank', 'noopener');
}
