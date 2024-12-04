chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_TRANSLATION") {
    const language = message.language;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        sendResponse({ success: false, error: "No active tab found." });
        return;
      }

      const activeTab = tabs[0];

      chrome.tabs.sendMessage(
        activeTab.id,
        { type: "CAPTURE_AUDIO", language },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            sendResponse({
              success: false,
              error: chrome.runtime.lastError.message,
            });
          } else {
            sendResponse(response);
          }
        }
      );
    });

    return true; // Keep the message channel open for async response
  }
});
