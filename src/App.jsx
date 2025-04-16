import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PivotTable from "./components/PivotTable";
import { generatePivotTable } from "./utils/GeneratePivot.js";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DragItem from "./components/DragItem";
import DropZone from "./components/DropZone";

function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [valueField, setValueField] = useState("");
  const [pivotData, setPivotData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-load data when file is selected
      handleLoadData(selectedFile);
    }
  };

  const handleLoadData = (selectedFile) => {
    if (!selectedFile) return toast.error("Please upload a file first.");

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!jsonData || jsonData.length === 0) {
          setIsLoading(false);
          return toast.error("No data found in the file.");
        }

        setData(jsonData);
        setHeaders(jsonData[0]);

        // Reset selections when loading new data
        setRows([]);
        setColumns([]);
        setValueField("");
        setPivotData(null);

        toast.success("Data loaded successfully!");
        setIsLoading(false);
      } catch (error) {
        console.error("Error processing file:", error);
        toast.error("Error processing file. Please check the format.");
        setIsLoading(false);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  useEffect(() => {
    if (
      data.length > 0 &&
      rows.length > 0 &&
      columns.length > 0 &&
      valueField
    ) {
      const result = generatePivotTable(
        data,
        headers,
        rows,
        columns,
        valueField
      );
      setPivotData(result);
    } else {
      setPivotData(null);
    }
  }, [data, headers, rows, columns, valueField]);

  // Replace the moveItem function in your App.js
  const moveItem = (header, targetType) => {
    // If header is already in the target area, don't add it again
    if (
      (targetType === "row" && rows.includes(header)) ||
      (targetType === "column" && columns.includes(header))
    ) {
      return;
    }

    // If header is in the other area, remove it from there first
    if (targetType === "row" && columns.includes(header)) {
      setColumns(columns.filter((item) => item !== header));
    } else if (targetType === "column" && rows.includes(header)) {
      setRows(rows.filter((item) => item !== header));
    }

    // Now add the header to the target area
    if (targetType === "row") {
      setRows([...rows, header]);
    } else if (targetType === "column") {
      setColumns([...columns, header]);
    }
  };

  // Also replace the removeItem function to ensure proper cleanup
  const removeItem = (header, type) => {
    if (type === "row") {
      setRows(rows.filter((item) => item !== header));
    } else if (type === "column") {
      setColumns(columns.filter((item) => item !== header));
    }
  };

  const moveAllItems = (type) => {
    if (type === "row") {
      // Move all fields to rows
      setRows([...new Set([...rows, ...headers])]);
    } else if (type === "column") {
      // Move all fields to columns
      setColumns([...new Set([...columns, ...headers])]);
    }
  };

  const clearItems = (type) => {
    if (type === "row") {
      setRows([]);
    } else if (type === "column") {
      setColumns([]);
    } else if (type === "all") {
      setRows([]);
      setColumns([]);
      setValueField("");
    }
  };

  // Helper function to get unused headers
  const getUnusedHeaders = () => {
    const usedHeaders = new Set([...rows, ...columns]);
    return headers.filter((header) => !usedHeaders.has(header));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex w-full min-h-screen justify-center items-center bg-gradient-to-b from-blue-500 to-purple-600 p-4">
        <ToastContainer position="top-center" />
        <div className="flex flex-col items-center w-full max-w-6xl bg-white rounded-lg shadow-xl p-6 overflow-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 ly">
            Interactive Pivot Table Generator
          </h1>

          {/* File Upload Section */}
          <div className="w-full bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
              1. Upload Your Data
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1">
                <input
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={handleFileChange}
                  className="relative z-10 opacity-0 h-full w-full cursor-pointer"
                />
                <div className="absolute top-0 left-0 w-full h-full flex items-center px-4 text-gray-500 border-2 border-dashed border-gray-400 rounded-lg hover:border-blue-500">
                  {file ? file.name : "Choose Excel or CSV file..."}
                </div>
              </div>
              <button
                className={`px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2 ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                onClick={() => handleLoadData(file)}
                disabled={isLoading || !file}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  "Load Data"
                )}
              </button>
            </div>
          </div>

          {data.length > 0 && (
            <>
              {/* Data Preview Section */}
              <div className="w-full bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-semibold text-gray-700">
                    2. Data Preview
                  </h2>
                  <span className="text-sm text-gray-500">
                    {data.length} rows × {headers.length} columns
                  </span>
                </div>
                <div className="overflow-auto max-h-64 border border-gray-300 rounded">
                  <table className="min-w-full divide-y divide-gray-300 bg-white">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        {data[0].map((header, index) => (
                          <th
                            key={index}
                            className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.slice(1, 10).map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className={
                            rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          {row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 border-r border-gray-200"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                      {data.length > 10 && (
                        <tr>
                          <td
                            colSpan={data[0].length}
                            className="text-center p-2 text-sm text-gray-500 italic"
                          >
                            ... {data.length - 10} more rows
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Configuration Section */}
              <div className="w-full bg-gray-50 rounded-lg p-4 mb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-3">
                  3. Configure Your Pivot Table
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Available Fields */}
                  <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium text-gray-700">
                        Available Fields
                      </h3>
                      <div className="flex gap-1">
                        <button
                          className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 hover:bg-blue-200"
                          onClick={() => moveAllItems("row")}
                          title="Add all to rows"
                        >
                          → Rows
                        </button>
                        <button
                          className="px-2 py-1 rounded text-xs bg-green-100 text-green-700 hover:bg-green-200"
                          onClick={() => moveAllItems("column")}
                          title="Add all to columns"
                        >
                          → Cols
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 min-h-40 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded border border-gray-200">
                      {getUnusedHeaders().map((header, index) => (
                        <DragItem
                          key={index}
                          header={header}
                          type="field"
                          moveItem={moveItem}
                        />
                      ))}
                      {getUnusedHeaders().length === 0 && (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm italic">
                          All fields are in use
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row Dimensions */}
                  <DropZone
                    type="row"
                    onDrop={(item) => moveItem(item.header, "row")}
                  >
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-sm h-full">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-medium text-blue-800">
                          Row Dimensions
                        </h3>
                        <button
                          className="px-2 py-1 rounded text-xs bg-red-100 text-red-700 hover:bg-red-200"
                          onClick={() => clearItems("row")}
                        >
                          Clear
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1 min-h-40 max-h-40 overflow-y-auto p-2 bg-white rounded border border-blue-200">
                        {rows.map((header, index) => (
                          <div key={index} className="relative">
                            <div className="p-2 border-2 border-blue-400 bg-blue-100 rounded m-1 text-blue-800">
                              {header}
                              <button
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                                onClick={() => removeItem(header, "row")}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                        {rows.length === 0 && (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm italic">
                            Drag fields here or click fields to add as rows
                          </div>
                        )}
                      </div>
                    </div>
                  </DropZone>

                  {/* Column Dimensions */}
                  <DropZone
                    type="column"
                    onDrop={(item) => moveItem(item.header, "column")}
                  >
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 shadow-sm h-full">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-medium text-green-800">
                          Column Dimensions
                        </h3>
                        <button
                          className="px-2 py-1 rounded text-xs bg-red-100 text-red-700 hover:bg-red-200"
                          onClick={() => clearItems("column")}
                        >
                          Clear
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1 min-h-40 max-h-40 overflow-y-auto p-2 bg-white rounded border border-green-200">
                        {columns.map((header, index) => (
                          <div key={index} className="relative">
                            <div className="p-2 border-2 border-green-400 bg-green-100 rounded m-1 text-green-800">
                              {header}
                              <button
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                                onClick={() => removeItem(header, "column")}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                        {columns.length === 0 && (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm italic">
                            Drag fields here or click fields to add as columns
                          </div>
                        )}
                      </div>
                    </div>
                  </DropZone>
                </div>

                {/* Value Field Selection */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value Field (Measure)
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={valueField}
                      onChange={(e) => setValueField(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="" disabled>
                        Select the field to aggregate
                      </option>
                      {headers.map((header, index) => (
                        <option value={header} key={index}>
                          {header}
                        </option>
                      ))}
                    </select>
                    <button
                      className="px-4 py-2 rounded text-white bg-red-600 hover:bg-red-700"
                      onClick={() => clearItems("all")}
                    >
                      Reset All
                    </button>
                  </div>
                </div>
              </div>

              {/* Pivot Table Result */}
              {pivotData ? (
                <div className="w-full bg-gray-50 rounded-lg p-4">
                  <h2 className="text-xl font-semibold text-gray-700 mb-3">
                    4. Pivot Table Result
                  </h2>
                  <PivotTable
                    pivotData={pivotData}
                    rows={rows}
                    columns={columns}
                    valueField={valueField}
                  />
                </div>
              ) : (
                <div className="w-full bg-gray-50 rounded-lg p-4 text-center">
                  <h2 className="text-xl font-semibold text-gray-700 mb-3">
                    4. Pivot Table Result
                  </h2>
                  <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500">
                      {rows.length === 0
                        ? "Add at least one row dimension"
                        : columns.length === 0
                        ? "Add at least one column dimension"
                        : !valueField
                        ? "Select a value field to aggregate"
                        : "No data to display"}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {data.length === 0 && (
            <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-blue-800">
                No data loaded
              </h3>
              <p className="mt-1 text-sm text-blue-500">
                Upload an Excel (.xlsx) or CSV file to get started
              </p>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
}

export default App;
