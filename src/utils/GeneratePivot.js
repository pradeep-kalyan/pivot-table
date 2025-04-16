export function generatePivotTable(data, headers, rows, columns, valueField) {
  // Input validation
  if (
    !data ||
    !data.length ||
    !headers ||
    !headers.length ||
    !valueField ||
    !rows.length ||
    !columns.length
  ) {
    return null;
  }

  const valueIndex = headers.indexOf(valueField);
  if (valueIndex === -1) return null;

  // Get unique row and column values
  const uniqueRowValues = [];
  const uniqueColValues = [];
  const rowKeysMap = new Map();
  const colKeysMap = new Map();

  // Extract unique row and column combinations
  data.slice(1).forEach((row) => {
    // Build row key object
    const rowKey = {};
    rows.forEach((fieldName) => {
      const idx = headers.indexOf(fieldName);
      if (idx !== -1) {
        rowKey[fieldName] =
          row[idx] !== undefined && row[idx] !== null ? row[idx] : "(blank)";
      }
    });

    // Build column key object
    const colKey = {};
    columns.forEach((fieldName) => {
      const idx = headers.indexOf(fieldName);
      if (idx !== -1) {
        colKey[fieldName] =
          row[idx] !== undefined && row[idx] !== null ? row[idx] : "(blank)";
      }
    });

    // Store unique row combinations
    const rowKeyStr = JSON.stringify(rowKey);
    if (!rowKeysMap.has(rowKeyStr)) {
      rowKeysMap.set(rowKeyStr, rowKey);
      uniqueRowValues.push(rowKey);
    }

    // Store unique column combinations
    const colKeyStr = JSON.stringify(colKey);
    if (!colKeysMap.has(colKeyStr)) {
      colKeysMap.set(colKeyStr, colKey);
      uniqueColValues.push(colKey);
    }
  });

  // Create a matrix to hold values
  const valueMatrix = {};

  // Process data and sum values
  data.slice(1).forEach((row) => {
    // Get row key
    const rowKey = {};
    rows.forEach((fieldName) => {
      const idx = headers.indexOf(fieldName);
      if (idx !== -1) {
        rowKey[fieldName] =
          row[idx] !== undefined && row[idx] !== null ? row[idx] : "(blank)";
      }
    });

    // Get column key
    const colKey = {};
    columns.forEach((fieldName) => {
      const idx = headers.indexOf(fieldName);
      if (idx !== -1) {
        colKey[fieldName] =
          row[idx] !== undefined && row[idx] !== null ? row[idx] : "(blank)";
      }
    });

    // Get value
    let value = 0;
    const rawValue = row[valueIndex];

    if (rawValue !== undefined && rawValue !== null) {
      if (typeof rawValue === "number") {
        value = rawValue;
      } else if (typeof rawValue === "string") {
        // Clean and parse string value
        const cleanValue = rawValue.replace(/[$,\s]/g, "");
        const parsedValue = parseFloat(cleanValue);
        if (!isNaN(parsedValue)) {
          value = parsedValue;
        }
      }
    }

    // Store in matrix
    const rowKeyStr = JSON.stringify(rowKey);
    const colKeyStr = JSON.stringify(colKey);

    if (!valueMatrix[rowKeyStr]) {
      valueMatrix[rowKeyStr] = {};
    }

    if (!valueMatrix[rowKeyStr][colKeyStr]) {
      valueMatrix[rowKeyStr][colKeyStr] = 0;
    }

    valueMatrix[rowKeyStr][colKeyStr] += value;
  });

  // Build the formatted table
  const formattedTable = [];

  // Create header row
  const headerRow = [];

  // Add row dimension headers
  rows.forEach((rowField) => {
    headerRow.push(rowField);
  });

  // Add column headers
  uniqueColValues.forEach((colValue) => {
    let colLabel = "";
    columns.forEach((col) => {
      colLabel += colValue[col] + " ";
    });
    headerRow.push(colLabel.trim());
  });

  // Add "Total" column header
  headerRow.push("Total");
  formattedTable.push(headerRow);

  // Add data rows
  uniqueRowValues.forEach((rowValue) => {
    const dataRow = [];

    // Add row labels
    rows.forEach((rowField) => {
      dataRow.push(rowValue[rowField]);
    });

    // Get row key string for lookups
    const rowKeyStr = JSON.stringify(rowValue);
    let rowTotal = 0;

    // Add cell values for each column
    uniqueColValues.forEach((colValue) => {
      const colKeyStr = JSON.stringify(colValue);
      const cellValue = valueMatrix[rowKeyStr]?.[colKeyStr] || 0;
      dataRow.push(cellValue);
      rowTotal += cellValue;
    });

    dataRow.push(rowTotal);
    formattedTable.push(dataRow);
  });

  return formattedTable;
}
