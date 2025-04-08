function toggleTheme() {
    document.body.classList.toggle('dark-mode');
}
function loadUnitsData(type, tableId) {
    fetch('units.json')
        .then(response => response.json())
        .then(data => {
            const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
            table.innerHTML = '';
            const units = data[type];
            units.forEach(unit => {
                const row = table.insertRow();
                row.classList.add('fade-in');
                const partNumber = unit.partNumber || '';
                const softwareVersion = unit.softwareVersion || '';
                const compatibility = unit.compatibility || '';
                const notes = unit.notes || '';
                row.innerHTML = `
                    <td>${highlightColors(partNumber)}</td>
                    <td>${highlightColors(softwareVersion)}</td>
                    <td>${highlightColors(compatibility)}</td>
                    <td>${highlightColors(notes)}</td>
                `;
            });
        });
}
function highlightColors(text) {
    if (!text) return '';
    return text.replace(/(červený|modrý|zelený|oranžový|žlutý|fialový|růžový)/gi, match => {
        const color = match.toLowerCase();
        return `<span style="color: ${color}; font-weight: bold">${match}</span>`;
    });
}
