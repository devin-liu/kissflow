import React from "react";
import { TableData } from "./types";
import "./TablePreview.css";

function TablePreview() {
  const [rowData, setRowData] = React.useState<TableData[]>([]);
  const [headers, setHeaders] = React.useState<string[]>([]);

  // listen for messages from the background script
  React.useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (event.data.action === "previewDataStore") {
        setRowData(event.data.data);
        setHeaders(event.data.headers);
      }
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  return (
    <div>
      <table>
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowData.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((value, index) => (
                <td key={index}>{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TablePreview;
