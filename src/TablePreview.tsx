import React, { useEffect } from "react";
import { TableData } from "./types";
import "./TablePreview.css";

// todo:::
// start table on hidden view
// expand table when user adds more rows
// hide table after user scrolls past it

function TablePreview() {
  const [rowData, setRowData] = React.useState<TableData[]>([]);
  const [headers, setHeaders] = React.useState<string[]>([]);

  const [isHidden, setIsHidden] = React.useState(true);

  // hide table when user scrolls down
  useEffect(() => {
    // listen for scroll event
    // if user scrolls past table, hide table
    const listener = () => {
      const table = document.getElementById("preview-table-builder");
      if (table) {
        const rect = table.getBoundingClientRect();
        if (rect.top < 0) {
          setIsHidden(true);
        } else {
          setIsHidden(false);
        }
      }
      // setIsHidden(true);
    };

    window.addEventListener("scroll", listener);
  }, []);

  // show table when user hovers over it
  useEffect(() => {
    const table = document.getElementById("preview-table-builder");
    if (table) {
      const listener = () => {
        setIsHidden(false);
      };
      table.addEventListener("mouseenter", listener);
      return () => table.removeEventListener("mouseenter", listener);
    }
  }, []);

  // Normalize row to be same length as headers
  const normalizedRowData = React.useMemo(() => {
    // if no headers, just return row data
    if (!headers.length) return rowData;
    const headersLength = headers.length;
    return rowData.map((row) => {
      return Object.values(row).slice(0, headersLength);
    });
  }, [rowData, headers]);

  // listen for messages from the background script
  React.useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (event.data.action === "previewDataStore") {
        setRowData(event.data.data);
        setHeaders(
          event.data.headers.filter(
            (headerString: string) =>
              typeof headerString === "string" && headerString.length > 0
          )
        );
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
          {(isHidden ? normalizedRowData.slice(-1) : normalizedRowData).map(
            (row, index) => (
              <tr key={index}>
                {row.map((value, index) => (
                  <td style={{ border: "1px solid black" }} key={index}>
                    {value}
                  </td>
                ))}
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TablePreview;
