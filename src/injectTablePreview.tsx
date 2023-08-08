import React from "react";
import ReactDOM from "react-dom/client";

import TablePreview from "./TablePreview";

const tablePreviewID = "preview-table-builder";

export default function injectTablePreview() {
  const preview = document.createElement("div");
  preview.id = tablePreviewID;
  preview.style.position = "sticky";
  preview.style.top = "0";
  preview.style.right = "0";
  preview.style.width = "300px";
  preview.style.background = "white";
  preview.style.height = "fit-content";
  preview.style.minHeight = "20vh";

  // position: sticky;
  // top: 0%;
  // left: 0;
  // right: 0px;
  // width: 100vw;
  // background: white;
  // height: 30vh;
  // z-index: 5;
  // overflow: scroll;

  document.body.prepend(preview);

  const root = ReactDOM.createRoot(preview);
  root.render(
    <React.StrictMode>
      <TablePreview />
    </React.StrictMode>
  );
}

chrome.runtime.onMessage.addListener((request) => {
  console.log("content script received message", request);
  if (request.action === "previewDataStore") {
    window.postMessage(
      {
        action: "previewDataStore",
        data: request.data.data,
        headers: request.data.headers,
      },
      "*"
    );
  }
});

// listen for messages from the background script
// send the table data to the preview through postmessage

const port = chrome.runtime.connect({
  name: JSON.stringify(window.location.href),
});
port.postMessage({ action: "previewDataStore" });

port.onMessage.addListener(function (msg) {
  // check for previewDataStore message
  if (msg.action === "previewDataStore") {
    // send message to preview
    window.postMessage({ action: "previewDataStore", data: msg.data }, "*");
  }
});
