
function toggleTheme() {
  document.documentElement.classList.toggle('dark');
}

document.addEventListener("DOMContentLoaded", () => {
  const gatewayData = ["Gateway řádek 1", "Gateway řádek 2"];
  const bsgData = ["BSG řádek 1", "BSG řádek 2"];
  const komfortData = ["Komfort řádek 1", "Komfort řádek 2"];

  const fillTable = (id, data) => {
    const tbody = document.getElementById(id);
    data.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `<td class="border px-4 py-2">${item}</td>`;
      tbody.appendChild(row);
    });
  };

  fillTable("gateway-data", gatewayData);
  fillTable("bsg-data", bsgData);
  fillTable("komfort-data", komfortData);
});
