import "arrive";
import $ from "cash-dom";

const initialDisplayValues: Record<string, string> = {};

const hideLinks = (linksToHide: string[]) => {
  // hide links on load
  document.arrive("a", { existing: true }, function () {
    // 'this' refers to the newly created element
    const anchorElem = this as HTMLAnchorElement;
    const href = anchorElem.href || "";
    if (linksToHide.includes(href)) {
      initialDisplayValues[href] = anchorElem.style.display;
      $(anchorElem).toggleClass("hidden-link", true);
      $(anchorElem).toggle(false);
      $(anchorElem).on("change", () => {
        const newAnchorElem = this as HTMLAnchorElement;
        console.log("change", anchorElem.href, newAnchorElem.href);
      });
    }
  });

  // show links when the href changes
  document.arrive(
    "a",
    { existing: true, fireOnAttributesModification: true },
    function () {
      const anchorElem = this as HTMLAnchorElement;
      const href = anchorElem.href || "";
      // Check if href is NOT in the list of links to hide
      // And if it has the hidden-link class
      if (
        !linksToHide.includes(href) &&
        $(anchorElem).hasClass("hidden-link")
      ) {
        // Show the link
        $(anchorElem).toggleClass("hidden-link", false);
        $(anchorElem).toggle(true);
        $(anchorElem).off("change");
      }
    }
  );
};

const init = async () => {
  const storageData = await chrome.storage.local.get("visitDurationMap");
  const visitDurationMap = storageData.visitDurationMap || {};

  const linksToHide = Object.entries(visitDurationMap)
    .filter(
      ([url, duration]) => typeof duration === "number" && duration < 10000
    )
    .map((info) => info[0]);
  console.log("linksToHide", linksToHide);
  hideLinks(linksToHide);
};

init();

export default init;
