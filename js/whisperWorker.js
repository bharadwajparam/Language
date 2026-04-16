import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

// Set environment for WebAssembly
env.allowLocalModels = false;

let transcriber = null;
let synthesizer = null;

self.onmessage = async (event) => {
    const { type, audioData, text } = event.data;

    if (type === 'init') {
        try {
            self.postMessage({ status: 'loading', message: 'Loading model (this might take a while on first run)...' });
            // Initialize the speech recognition pipeline. We use whisper-tiny.
            transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
                progress_callback: (info) => {
                    self.postMessage({ status: 'progress', info });
                }
            });
            self.postMessage({ status: 'progress', info: { progress: 100 }, message: 'Loading TTS...' });
            
            // Initialize the text-to-speech pipeline.
            synthesizer = await pipeline('text-to-speech', 'Xenova/mms-tts-hin', {
                progress_callback: (info) => {
                    self.postMessage({ status: 'progress', info });
                }
            });
            self.postMessage({ status: 'ready', message: 'Models loaded' });
        } catch (error) {
            console.error('Error loading whisper model:', error);
            self.postMessage({ status: 'error', error: error.message });
        }
    } else if (type === 'transcribe') {
        if (!transcriber) {
            self.postMessage({ status: 'error', error: 'Pipeline not initialized' });
            return;
        }
        
        self.postMessage({ status: 'transcribing' });
        
        try {
            // Expected audioData: Float32Array at 16000Hz mono
            const result = await transcriber(audioData, {
                language: 'mr',
                task: 'transcribe',
                chunk_length_s: 30,
                stride_length_s: 5,
            });

            self.postMessage({ status: 'success', text: result.text });
        } catch (error) {
            console.error('Transcription error:', error);
            self.postMessage({ status: 'error', error: error.message });
        }
    } else if (type === 'synthesize') {
        if (!synthesizer) {
            self.postMessage({ status: 'error', error: 'TTS Pipeline not initialized' });
            return;
        }
        self.postMessage({ status: 'synthesizing' });
        try {
            const out = await synthesizer(text);
            self.postMessage({ 
                status: 'tts-success', 
                audio: out.audio, 
                sampling_rate: out.sampling_rate 
            });
        } catch (error) {
            console.error('Synth error:', error);
            self.postMessage({ status: 'error', error: error.message });
        }
    }
};
