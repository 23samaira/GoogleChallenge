chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_TRANSLATION") {
    const { meetingCode, language } = message;
    const audioContext = new AudioContext();

    // Start capturing audio from the meeting tab
    chrome.tabCapture.capture({ audio: true, video: false }, (stream) => {
      if (stream) {
        const source = audioContext.createMediaStreamSource(stream);

        // Load the audio-processor.js file as a module
        audioContext.audioWorklet
          .addModule("audio-processor.js")
          .then(() => {
            const workletNode = new AudioWorkletNode(
              audioContext,
              "audio-processor"
            );

            // Listen for processed audio data
            workletNode.port.onmessage = async (event) => {
              const audioData = event.data; // This is the raw audio buffer
              try {
                // Send audioData to transcription and translation API
                const translatedText = await sendForTranscription(
                  audioData,
                  language
                );

                // Display subtitles in the meeting tab
                chrome.scripting.executeScript({
                  target: { tabId: sender.tab.id },
                  func: showSubtitles,
                  args: [translatedText],
                });
              } catch (error) {
                console.error(
                  "Error during transcription or translation:",
                  error
                );
              }
            };

            // Connect audio stream to the worklet
            source.connect(workletNode);
            workletNode.connect(audioContext.destination);
          })
          .catch((error) =>
            console.error("Failed to load audio processor:", error)
          );
      } else {
        console.error("Failed to capture tab audio");
      }
    });
  }
});

// Function to handle transcription and translation
async function sendForTranscription(audioData, language) {
  try {
    // Use Chrome AI Summarization API for transcription
    const transcription = await chrome.ai.summarize(audioData); // Summarization API

    // Use Chrome AI Translation API for translation
    const translatedText = await chrome.ai.translate(transcription, {
      targetLanguage: language,
    }); // Translation API

    return translatedText; // Return the translated subtitle
  } catch (error) {
    console.error("Error in AI processing:", error);
    throw error;
  }
}

// Inject subtitles into the current tab
function showSubtitles(subtitle) {
  let subtitleBox = document.getElementById("realTimeSubtitle");
  if (!subtitleBox) {
    subtitleBox = document.createElement("div");
    subtitleBox.id = "realTimeSubtitle";
    subtitleBox.style.position = "fixed";
    subtitleBox.style.bottom = "20px";
    subtitleBox.style.left = "20px";
    subtitleBox.style.backgroundColor = "rgba(0,0,0,0.8)";
    subtitleBox.style.color = "white";
    subtitleBox.style.padding = "10px";
    subtitleBox.style.borderRadius = "5px";
    subtitleBox.style.zIndex = "9999";
    document.body.appendChild(subtitleBox);
  }
  subtitleBox.innerText = subtitle;
}
