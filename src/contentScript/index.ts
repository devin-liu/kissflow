import "arrive";

const hideLinks = (linksToHide: string[]) => {
  document.arrive("a", { existing: true }, function () {
    // 'this' refers to the newly created element
    const anchorElem = this as HTMLAnchorElement;
    const href = anchorElem.href || "";
    if (linksToHide.includes(href)) {
      anchorElem.style.display = "none";
    }
  });
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
