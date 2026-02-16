// controlTable.js
// Reusable function to build dynamic control table
// buttons = array of rows; each row is array of button objects [{display, id}]
// Table size (rows/cols) automatically matches the input structure
// const buttons = [
//   [ { display: "Save A", id: "saveA" }, { display: "Load A", id: "loadA" } ],
//   [ { display: "Test B", id: "testB" } ],                    // only 1 button
//   [ { display: "Start", id: "start" }, { display: "Stop", id: "stop" } ],
//   [ { display: "Reset", id: "reset" } ]
// ];

(function () {
  'use strict';

  window.buildControlTable = function buildControlTable(
    className = 'info-table',
    buttons = [],               // e.g. [ [{display:"A1", id:"a1"}, {display:"B1", id:"b1"}], ... ]
    onButtonClick = null        // optional per-table callback
  ) {
    if (!Array.isArray(buttons) || buttons.length === 0) {
      console.warn('buildControlTable: no valid buttons provided');
      return document.createElement('div'); // empty placeholder
    }

    const table = document.createElement('table');
    table.className = className;

    // Determine max columns across all rows (for consistent table layout)
    let maxCols = 0;
    buttons.forEach(row => {
      if (Array.isArray(row)) {
        maxCols = Math.max(maxCols, row.length);
      }
    });

    // Build rows
    buttons.forEach((rowButtons, rowIndex) => {
      if (!Array.isArray(rowButtons)) return; // skip invalid rows

      const tr = document.createElement('tr');

      rowButtons.forEach((btnInfo, colIndex) => {
        // Each button gets its own column pair: input + button
        const tdInput = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Value ${rowIndex + 1}.${colIndex + 1}`;
        tdInput.appendChild(input);

        const tdButton = document.createElement('td');
        const btn = document.createElement('button');
        btn.textContent = btnInfo.display || `Btn ${rowIndex + 1}.${colIndex + 1}`;
        btn.dataset.id = btnInfo.id || '';
        tdButton.appendChild(btn);

        // Click handler
        btn.addEventListener('click', () => {
          const value = input.value.trim();
          const btnId = btn.dataset.id;

          if (!value || !btnId) {
            console.warn(`Row ${rowIndex + 1} Col ${colIndex + 1}: missing value or ID`);
            return;
          }

          const eventData = {
            row: rowIndex + 1,
            col: colIndex + 1,
            buttonId: btnId,
            value: value,
            display: btn.textContent
          };

          if (typeof onButtonClick === 'function') {
            onButtonClick(eventData);
          } else if (typeof window.onControlTableClick === 'function') {
            window.onControlTableClick(eventData);
          } else {
            console.log('Control table button clicked:', eventData);
          }
        });

        tr.appendChild(tdInput);
        tr.appendChild(tdButton);
      });

      table.appendChild(tr);
    });

    return table;
  };
})();