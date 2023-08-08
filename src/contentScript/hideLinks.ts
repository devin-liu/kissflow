import "arrive";
import $ from "cash-dom";

const initialDisplayValues: Record<string, string> = {};

const hideLinks = (linksToHide: string[]) => {
  const watchForChangedLink = (anchorElem: HTMLAnchorElement) => {
    const href = anchorElem.href || "";
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes") {
          const newAnchorElem = mutation.target as HTMLAnchorElement;
          const newHref = newAnchorElem.href || "";
          if (!linksToHide.includes(newHref)) {
            console.log("change", href, newHref);
            $(anchorElem).toggleClass("hidden-link", false);
            $(anchorElem).toggle(true);
            observer.disconnect();
          }
        }
      });
    });

    observer.observe(anchorElem, {
      attributes: true,
      childList: false,
      characterData: false,
    });
  };
  // hide links on load
  document.arrive(
    "a",
    { existing: true, fireOnAttributesModification: true },
    function () {
      // 'this' refers to the newly created element
      const anchorElem = this as HTMLAnchorElement;
      const href = anchorElem.href || "";
      if (linksToHide.includes(href)) {
        initialDisplayValues[href] = anchorElem.style.display;
        $(anchorElem).toggleClass("hidden-link", true);
        $(anchorElem).toggle(false);
        watchForChangedLink(anchorElem);
      }
    }
  );
};

async function hideLinksWithoutDuration() {
  const storageData = await chrome.storage.local.get("visitDurationMap");
  const visitDurationMap = storageData.visitDurationMap || {};
  chrome.history.getVisits({ url: window.location.origin }, (visitItems) => {
    console.log("visitItems", visitItems);
    const lastVisit = visitItems[visitItems.length - 1];
    if (!lastVisit?.visitTime) return;
    const lastVisitTime = lastVisit.visitTime;
    const now = Date.now();
    const timeSinceLastVisit = now - lastVisitTime;
    console.log("timeSinceLastVisit", timeSinceLastVisit);
    // if (timeSinceLastVisit < 10000) {
    const linksToHide = Object.entries(visitDurationMap)
      .filter(
        ([url, duration]) => typeof duration === "number" && duration < 10000
      )
      .map((info) => info[0]);
    console.log("linksToHide", linksToHide);
    hideLinks(linksToHide);
  });
}

const init = async () => {
  // hideLinksWithoutDuration();
  
};

init();

export default init;
