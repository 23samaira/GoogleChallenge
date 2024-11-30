document.getElementById("start").addEventListener("click", () => {
  const meetingCode = document.getElementById("meetingCode").value;
  const language = document.getElementById("language").value;

  chrome.runtime.sendMessage({
    type: "START_TRANSLATION",
    meetingCode,
    language,
  });
});
