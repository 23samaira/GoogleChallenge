class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0]; // This is the raw audio input
    if (input) {
      const audioData = input[0]; // Access the first channel's audio data
      // You can send audioData to background.js or further processing
      this.port.postMessage(audioData); // Send processed audio data back to the main thread
    }
    return true; // Keep processing audio data
  }
}

registerProcessor("audio-processor", AudioProcessor);
