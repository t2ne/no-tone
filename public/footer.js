(() => {
  const button = document.querySelector(".bottombar__contact");
  if (!button) return;

  const EMAIL = "msg@no-tone.com";
  let resetTimeout;

  const setLabel = (text) => {
    button.textContent = text;
  };

  setLabel("contact");

  button.addEventListener("click", async () => {
    clearTimeout(resetTimeout);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(EMAIL);
      } else {
        const area = document.createElement("textarea");
        area.value = EMAIL;
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
      }
      setLabel("copied");
    } catch {
      setLabel("copy failed");
    }
    resetTimeout = setTimeout(() => setLabel("contact"), 1500);
  });
})();
