document.getElementById("start").addEventListener("click", () => {
  const language = document.getElementById("language").value;

  chrome.runtime.sendMessage({
    type: "START_TRANSLATION",
    language,
  });
});
