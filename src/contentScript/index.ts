const visitDurationMap: { [url: string]: number } = {};

const saveVisitDuration = async () => {
  await chrome.storage.local.set({ visitDurationMap });
};

const hideLinks = (linksToHide: string[]) => {
  const links = document.querySelectorAll("a");

  links.forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (linksToHide.includes(href)) {
      link.style.display = "none";
    }
  });
};

const trackLinks = () => {
  document.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", async (e) => {
      const currentUrl = window.location.href;
      const startTime = Date.now();
      e.preventDefault();

      setTimeout(() => {
        const duration = Date.now() - startTime;
        visitDurationMap[currentUrl] = duration;
        saveVisitDuration();

        if (duration < 10000) {
          hideLinks([currentUrl]);
        }

        window.location.href = link.getAttribute("href") || "";
      }, 10);
    });
  });
};

const init = async () => {
  console.log("init2");
  const data = await chrome.storage.local.get("visitDurationMap");
  console.log("data", data);
  Object.assign(visitDurationMap, data.visitDurationMap || {});

  trackLinks();
};

console.log("init1");

init();

export default init;
