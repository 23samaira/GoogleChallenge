console.log("Content script loaded and running.");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CAPTURE_AUDIO") {
    const language = message.language;

    // Capture audio using getUserMedia
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        console.log("Audio stream captured successfully.");

        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);

        audioContext.audioWorklet
          .addModule(chrome.runtime.getURL("scripts/audio-processor.js"))
          .then(() => {
            console.log("AudioWorklet module loaded.");

            const workletNode = new AudioWorkletNode(
              audioContext,
              "audio-processor"
            );

            // Process data from the worklet
            workletNode.port.onmessage = async (event) => {
              const rawAudioData = event.data;
              console.log(rawAudioData);

              //   try {
              //     // Process and translate audio data
              //     const translatedText = await processAndTranslateAudio(
              //       rawAudioData,
              //       language
              //     );

              //     // Display subtitles
              //     showSubtitles(translatedText);
              //   }
              //   catch (error) {
              //     console.error("Error during audio processing:", error);
              //   }
            };

            // Connect audio stream to the worklet
            source.connect(workletNode);
            workletNode.connect(audioContext.destination);
          })
          .catch((error) => {
            console.error("AudioWorklet error:", error);
            sendResponse({ success: false, error: error.message });
          });
      })
      .catch((error) => {
        console.error("getUserMedia error:", error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep the message channel open for async response
  }
});

// Function to display subtitles
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

// Function to process and translate audio
async function processAndTranslateAudio(rawAudioData, language) {
  try {
    console.log("xyz");
    const encodedAudioData = encodeAudioData(rawAudioData);
    const transcription = await sendForTranscription(encodedAudioData);

    const translatedText = await translateText(transcription, language); // Translate text
    return translatedText;
  } catch (error) {
    console.error("Error during processing and translation:", error);
    throw error;
  }
}

// Function to send audio data for transcription
async function sendForTranscription(audioData) {
  try {
    const apiKey = "AIzaSyAj6D4EqMF345FJisw8QeG4Nu6Y9ccEeXA"; // Replace with your API key
    const url = `https://speech.googleapis.com/v1p1beta1/speech:recognize?key=${apiKey}`;

    const requestPayload = {
      config: {
        encoding: "LINEAR16",
        sampleRateHertz: 16000,
        languageCode: "hi-IN", // Replace with the source language
        enableAutomaticPunctuation: true,
      },
      audio: {
        content: audioData, // Base64-encoded audio data
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    const result = await response.json();
    console.log(result);
    /*
    if (!result.results || result.results.length === 0) {
      console.warn(
        "No transcription results. Possible reasons: silent audio, poor quality, or API limitations."
      );
      return ""; // Return empty string or an appropriate fallback
    }*/

    // if (
    //   !result.results[0].alternatives ||
    //   result.results[0].alternatives.length === 0
    // ) {
    //   console.warn("No alternatives found in the transcription results.");
    //   return "";
    // }

    // Check if the results array and nested properties exist
    // if (
    //   result.results &&
    //   result.results[0] &&
    //   result.results[0].alternatives &&
    //   result.results[0].alternatives[0]
    // ) {
    //   return result.results[0].alternatives[0].transcript;
    // } else {
    //   console.warn(
    //     "Incomplete response received. Returning partial result if available."
    //   );
    //   return result.results?.[0]?.alternatives?.[0]?.transcript || ""; // Use optional chaining
    // }
    return true;
  } catch (error) {
    console.error("Speech-to-Text API Error:", error);
    throw error;
  }
}

// Function to translate text
async function translateText(text, targetLanguage) {
  try {
    const apiKey = "AIzaSyAj6D4EqMF345FJisw8QeG4Nu6Y9ccEeXA"; // Replace with your API key
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    const requestPayload = {
      q: text,
      target: targetLanguage,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    const result = await response.json();
    console.log(result);
    /*
    return result.data.translations[0].translatedText;*/
    return true;
  } catch (error) {
    console.error("Translation API Error:", error);
    throw error;
  }
}
function encodeAudioData(audioBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
}
