function PivotTable({ pivotData, rows, columns, valueField }) {
  if (!pivotData || !pivotData.length) {
    return <div>No data to display</div>;
  }

  // The headers will be in the first row of pivotData
  const headerRow = pivotData[0];
  const dataRows = pivotData.slice(1);

  // Calculate column totals
  const columnTotals = new Array(headerRow.length).fill(0);
  dataRows.forEach((row) => {
    row.forEach((value, index) => {
      // Skip row header columns
      if (index >= rows.length) {
        // Make sure we're adding numbers
        const numValue =
          typeof value === "number" ? value : parseFloat(value) || 0;
        columnTotals[index] += numValue;
      }
    });
  });

  return (
    <div className="p-4 w-full shadow-sm overflow-auto">
      <h2 className="text-xl font-bold mb-4">
        Pivot Table: {valueField} by {rows.join(", ")} and {columns.join(", ")}
      </h2>

      <table className="min-w-full border-4 border-gray-300">
        <thead>
          <tr className="bg-green-100">
            {/* Render header row */}
            {headerRow.map((cell, index) => (
              <th key={index} className="border px-4 py-2 text-left">
                {cell}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* Render data rows */}
          {dataRows.map((row, rowIdx) => {
            // Calculate row total
            let rowTotal = 0;
            row.forEach((value, idx) => {
              if (idx >= rows.length) {
                const numValue =
                  typeof value === "number" ? value : parseFloat(value) || 0;
                rowTotal += numValue;
              }
            });

            return (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? "bg-gray-50" : ""}>
                {row.map((cell, cellIdx) => {
                  // Apply special formatting for row headers
                  if (cellIdx < rows.length) {
                    return (
                      <td
                        key={cellIdx}
                        className="border px-4 py-2 font-medium"
                      >
                        {cell}
                      </td>
                    );
                  }

                  // Format data cells
                  const numValue =
                    typeof cell === "number" ? cell : parseFloat(cell) || 0;
                  return (
                    <td key={cellIdx} className="border px-4 py-2 text-right">
                      {numValue.toLocaleString()}
                    </td>
                  );
                })}

                {/* Add row total */}
                <td className="border px-4 py-2 text-right font-bold bg-yellow-50">
                  {rowTotal.toLocaleString()}
                </td>
              </tr>
            );
          })}

          {/* Add column totals row */}
          <tr className="bg-yellow-100 font-bold">
            <td colSpan={rows.length} className="border px-4 py-2">
              Grand Total
            </td>

            {columnTotals.slice(rows.length).map((total, idx) => (
              <td key={idx} className="border px-4 py-2 text-right">
                {total.toLocaleString()}
              </td>
            ))}

            {/* Grand total */}
            <td className="border px-4 py-2 text-right">
              {columnTotals
                .slice(rows.length)
                .reduce((sum, val) => sum + val, 0)
                .toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default PivotTable;
