const SentenceGame = {
    allSentences: [],
    currentSentence: null,
    selectedWords: [],
    worker: null,
    isRecording: false,
    mediaRecorder: null,
    audioChunks: [],
    audioContext: null,
    preloadedAudio: null,
    waitingForAudio: false,
    workerReady: false,
    isSynthesizing: false,
    
    init(sentences) {
        this.allSentences = sentences;
        this.bindEvents();
        try {
            this.initWorker();
        } catch(e) {
            console.error("Worker initialization failed:", e);
        }
        this.loadNextSentence();
    },

    bindEvents() {
        document.getElementById('check-btn').addEventListener('click', () => this.checkAnswer());
        document.getElementById('next-btn').addEventListener('click', () => this.loadNextSentence());
        document.getElementById('retry-btn').addEventListener('click', () => this.resetSelectionArea());
        document.getElementById('hint-btn').addEventListener('click', () => this.showHint());
        document.getElementById('shuffle-btn').addEventListener('click', () => {
            this.resetSelectionArea();
            this.renderOptions(this.shuffleArray([...this.currentSentence.marathi]));
        });
        document.getElementById('speak-btn').addEventListener('click', () => this.toggleRecording());
        document.getElementById('listen-btn').addEventListener('click', () => this.playTTS());
    },

    playTTS() {
        if (!this.currentSentence) return;
        if (this.preloadedAudio) {
            this.playAudioData(this.preloadedAudio.audio, this.preloadedAudio.sampling_rate);
        } else {
            const statusEl = document.getElementById('model-status');
            statusEl.textContent = "Loading audio...";
            statusEl.classList.remove('hidden');
            document.getElementById('listen-btn').disabled = true;
            this.waitingForAudio = true;
            if (!this.isSynthesizing) {
                this.preloadCurrentSentenceAudio();
            }
        }
    },

    preloadCurrentSentenceAudio() {
        if (!this.workerReady || !this.currentSentence) return;
        this.preloadedAudio = null;
        this.isSynthesizing = true;
        this.waitingForAudio = false;
        const textToSpeak = this.currentSentence.marathi.map(w => w.script).join(' ');
        this.worker.postMessage({ type: 'synthesize', text: textToSpeak });
    },

    playAudioData(audio, sampling_rate) {
        const statusEl = document.getElementById('model-status');
        statusEl.textContent = "Playing...";
        statusEl.classList.remove('hidden');
        document.getElementById('listen-btn').disabled = true;

        if (!this.audioContext) {
             this.audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: sampling_rate });
        } else if (this.audioContext.state === 'suspended') {
             this.audioContext.resume();
        }
        
        const audioBuffer = this.audioContext.createBuffer(1, audio.length, sampling_rate);
        audioBuffer.getChannelData(0).set(audio);
        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.audioContext.destination);
        source.onended = () => {
            statusEl.classList.add('hidden');
            document.getElementById('listen-btn').disabled = false;
        };
        source.start();
    },
    
    loadNextSentence() {
        if (!this.allSentences || this.allSentences.length === 0) return;
        
        let pool;
        if (window.appState.currentLevel === 'All') {
            pool = this.allSentences;
        } else {
            pool = this.allSentences.filter(s => s.level === window.appState.currentLevel);
            if (pool.length === 0) {
                pool = this.allSentences.filter(s => s.level <= window.appState.currentLevel);
            }
        }
        if (!pool || pool.length === 0) pool = this.allSentences; // Absolute fallback
        
        // Pick random sentence
        const randomIndex = Math.floor(Math.random() * pool.length);
        this.currentSentence = pool[randomIndex];
        this.selectedWords = [];
        
        // Reset UI
        document.getElementById('target-sentence').textContent = this.currentSentence.english;
        document.getElementById('feedback-message').textContent = '';
        document.getElementById('feedback-message').className = 'text-lg font-semibold h-6 text-center';
        
        const selectedArea = document.getElementById('selected-words-area');
        selectedArea.innerHTML = '<span class="text-textSecondary text-sm italic">Drop words here...</span>';
        selectedArea.className = 'min-h-[90px] border border-dashed border-borderDark rounded-xl p-4 flex flex-wrap gap-3 items-center justify-center mb-8 bg-[#151515] transition-all';
        
        // Hide/Show Buttons
        document.getElementById('check-btn').classList.add('hidden');
        document.getElementById('next-btn').classList.add('hidden');
        document.getElementById('retry-btn').classList.remove('hidden');

        // Shuffle marathi words
        const shuffledWords = this.shuffleArray([...this.currentSentence.marathi]);
        this.renderOptions(shuffledWords);
        
        this.preloadCurrentSentenceAudio();
    },
    
    renderOptions(words) {
        const container = document.getElementById('word-options-area');
        container.innerHTML = '';
        
        words.forEach((wordObj, index) => {
            const btn = document.createElement('button');
            btn.className = 'word-option px-4 py-2 bg-highlight border border-borderDark rounded-md shadow-sm font-medium text-textPrimary hover:border-primary hover:text-primary focus:outline-none flex flex-col items-center leading-tight transition';
            btn.innerHTML = `<span class="text-lg">${wordObj.script}</span><span class="text-xs text-textSecondary capitalize">${wordObj.transliteration}</span>`;
            btn.dataset.word = wordObj.script;
            btn.dataset.id = `opt-${index}`;
            btn.dataset.translit = wordObj.transliteration;
            
            btn.addEventListener('click', () => this.selectWord(btn));
            container.appendChild(btn);
        });
    },

    selectWord(btnElement) {
        const word = btnElement.dataset.word;
        const id = btnElement.dataset.id;
        const translit = btnElement.dataset.translit;
        
        btnElement.classList.add('selected');
        
        this.selectedWords.push({ word, id, translit });
        this.renderSelectedWords();
        
        document.getElementById('check-btn').classList.remove('hidden');
    },

    deselectWord(wordObj) {
        this.selectedWords = this.selectedWords.filter(w => w.id !== wordObj.id);
        
        // Restore option button
        const btn = document.querySelector(`button[data-id="${wordObj.id}"]`);
        if (btn) btn.classList.remove('selected');
        
        this.renderSelectedWords();
        if (this.selectedWords.length === 0) {
            document.getElementById('check-btn').classList.add('hidden');
        }
    },
    
    renderSelectedWords() {
        const container = document.getElementById('selected-words-area');
        
        // Reset container classes, feedback message, and continue button whenever selection changes
        container.className = 'min-h-[90px] border border-dashed border-borderDark rounded-xl p-4 flex flex-wrap gap-3 items-center justify-center mb-8 bg-[#151515] transition-all';
        document.getElementById('feedback-message').textContent = '';
        document.getElementById('next-btn').classList.add('hidden');
        document.getElementById('retry-btn').classList.remove('hidden');

        container.innerHTML = '';
        
        if (this.selectedWords.length === 0) {
            container.innerHTML = '<span class="text-textSecondary text-sm italic">Drop words here...</span>';
            return;
        }

        this.selectedWords.forEach(wordItem => {
            const badge = document.createElement('div');
            badge.className = 'selected-word px-4 py-2 bg-primary text-[#121212] rounded-md shadow-lg shadow-primary/20 font-medium flex flex-col items-center leading-tight';
            badge.innerHTML = `<span class="font-bold">${wordItem.word}</span><span class="text-[10px] opacity-80 capitalize text-black font-semibold">${wordItem.translit}</span>`;
            badge.addEventListener('click', () => this.deselectWord(wordItem));
            container.appendChild(badge);
        });
    },

    resetSelectionArea() {
        this.selectedWords.forEach(wordObj => {
            const btn = document.querySelector(`button[data-id="${wordObj.id}"]`);
            if (btn) btn.classList.remove('selected');
        });
        this.selectedWords = [];
        this.renderSelectedWords();
        document.getElementById('check-btn').classList.add('hidden');
        document.getElementById('feedback-message').textContent = '';
        
        const selectedArea = document.getElementById('selected-words-area');
        selectedArea.className = 'min-h-[90px] border border-dashed border-borderDark rounded-xl p-4 flex flex-wrap gap-3 items-center justify-center mb-8 bg-[#151515] transition-all';
    },

    checkAnswer() {
        const userSen = this.selectedWords.map(w => w.word).join(' ');
        const targetSen = this.currentSentence.marathi.map(w => w.script).join(' ');
        
        const feedback = document.getElementById('feedback-message');
        const selectedArea = document.getElementById('selected-words-area');
        
        if (userSen === targetSen) {
            if (window.Profile) {
                window.Profile.recordAttempt(true);
            }
            feedback.textContent = 'Awesome! Correct Answer. 🎉';
            feedback.className = 'text-sm lg:text-base font-medium h-6 text-center text-primary';
            selectedArea.classList.remove('border-borderDark', 'bg-[#151515]', 'border-dashed');
            selectedArea.classList.add('border-primary', 'bg-primary/10', 'border-solid');
            
            if (window.Profile && this.currentSentence.id) {
                window.Profile.recordMastery(this.currentSentence.id);
            }
            
            document.getElementById('check-btn').classList.add('hidden');
            document.getElementById('retry-btn').classList.add('hidden');
            document.getElementById('next-btn').classList.remove('hidden');
            
            // Disable selecting/deselecting words temporarily if won 
            // (they reset when clicking next)
        } else {
            if (window.Profile) {
                window.Profile.recordAttempt(false);
            }
            feedback.textContent = 'Oops! Try again. ❌';
            feedback.className = 'text-sm lg:text-base font-medium h-6 text-center text-rose-500';
            selectedArea.classList.add('shake');
            setTimeout(() => selectedArea.classList.remove('shake'), 500);
        }
    },

    showHint() {
        const expectedWordObj = this.currentSentence.marathi[this.selectedWords.length];
        if (!expectedWordObj) return;
        
        const options = Array.from(document.querySelectorAll('.word-option:not(.selected)'));
        const hintBtn = options.find(btn => btn.dataset.word === expectedWordObj.script);
        
        if (hintBtn) {
            hintBtn.classList.add('ring-4', 'ring-yellow-400', 'ring-offset-2');
            setTimeout(() => {
                hintBtn.classList.remove('ring-4', 'ring-yellow-400', 'ring-offset-2');
            }, 1500);
        }
    },

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    initWorker() {
        try {
            this.worker = new Worker('js/whisperWorker.js', { type: 'module' });
            
            this.worker.onmessage = (event) => {
                const { status, message, info, text, error } = event.data;
                const statusEl = document.getElementById('model-status');
                
                if (status === 'loading') {
                    statusEl.classList.remove('hidden');
                    statusEl.textContent = message;
                } else if (status === 'progress') {
                    statusEl.classList.remove('hidden');
                    statusEl.textContent = `Loading model... ${Math.round(info.progress || 0)}%`;
                } else if (status === 'ready') {
                    statusEl.textContent = 'Models ready';
                    setTimeout(() => statusEl.classList.add('hidden'), 2000);
                    this.workerReady = true;
                    this.preloadCurrentSentenceAudio();
                } else if (status === 'transcribing') {
                    statusEl.classList.remove('hidden');
                    statusEl.textContent = 'Transcribing...';
                    document.getElementById('speak-btn').disabled = true;
                    document.getElementById('speak-btn').classList.add('opacity-50');
                } else if (status === 'success') {
                    statusEl.classList.add('hidden');
                    document.getElementById('speak-btn').disabled = false;
                    document.getElementById('speak-btn').classList.remove('opacity-50');
                    this.handleTranscription(text);
                } else if (status === 'error') {
                    statusEl.textContent = 'Error: ' + error;
                    document.getElementById('speak-btn').disabled = false;
                    document.getElementById('speak-btn').classList.remove('opacity-50');
                    if (this.isSynthesizing) {
                        this.isSynthesizing = false;
                        document.getElementById('listen-btn').disabled = false;
                    }
                } else if (status === 'tts-success') {
                    const { audio, sampling_rate } = event.data;
                    this.isSynthesizing = false;
                    this.preloadedAudio = { audio, sampling_rate };
                    
                    if (this.waitingForAudio) {
                        this.waitingForAudio = false;
                        this.playAudioData(audio, sampling_rate);
                    }
                }
            };
            
            // Add error handler for the worker itself
            this.worker.onerror = (error) => {
                console.error("Worker error:", error);
                const statusEl = document.getElementById('model-status');
                statusEl.classList.remove('hidden');
                statusEl.textContent = 'Worker Error (CORS or setup)';
                // Fallback attempt: recreate worker using blob if module worker fails
                // But typically if path is wrong or module worker fails, it's better to just log.
            };

            this.worker.postMessage({ type: 'init' });
        } catch (e) {
            console.error("Failed to create worker:", e);
            document.getElementById('model-status').textContent = "Speech feature unavailable";
            document.getElementById('model-status').classList.remove('hidden');
            document.getElementById('speak-btn').disabled = true;
            document.getElementById('speak-btn').classList.add('opacity-50');
            throw e; // rethrow to be caught by outer block
        }
    },

    async toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            await this.startRecording();
        }
    },

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            // Setup Analyzer for Volume Bar
            const analyzerCtx = new (window.AudioContext || window.webkitAudioContext)();
            const analyzer = analyzerCtx.createAnalyser();
            const sourceStream = analyzerCtx.createMediaStreamSource(stream);
            sourceStream.connect(analyzer);
            analyzer.fftSize = 256;
            const dataArray = new Uint8Array(analyzer.frequencyBinCount);
            
            document.getElementById('volume-container').classList.remove('hidden');
            const volumeBar = document.getElementById('volume-bar');
            
            const updateVolume = () => {
                if (!this.isRecording) return;
                analyzer.getByteFrequencyData(dataArray);
                let sum = 0;
                for(let i = 0; i < dataArray.length; i++) sum += dataArray[i];
                let average = sum / dataArray.length;
                let percent = Math.min(100, Math.max(0, average * 1.5));
                volumeBar.style.width = percent + '%';
                
                this.animationFrameId = requestAnimationFrame(updateVolume);
            };
            

            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) this.audioChunks.push(e.data);
            };

            this.mediaRecorder.onstop = async () => {
                if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
                document.getElementById('volume-container').classList.add('hidden');
                analyzerCtx.close();
                
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                await this.processAudioBlob(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            this.mediaRecorder.start();
            this.isRecording = true;
            this.animationFrameId = requestAnimationFrame(updateVolume);
            
            const btn = document.getElementById('speak-btn');
            btn.innerHTML = '🛑 Stop Recording';
            btn.classList.replace('bg-primary/20', 'bg-rose-500/20');
            btn.classList.replace('text-primary', 'text-rose-500');
            btn.classList.replace('border-primary/30', 'border-rose-500/30');
        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('Could not access microphone. Please ensure permissions are granted.');
        }
    },

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            const btn = document.getElementById('speak-btn');
            btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v10M8.5 6L12 2l3.5 4M12 22a8 8 0 0 0 8-8H4a8 8 0 0 0 8 8z"/></svg> Speak';
            btn.classList.replace('bg-rose-500/20', 'bg-primary/20');
            btn.classList.replace('text-rose-500', 'text-primary');
            btn.classList.replace('border-rose-500/30', 'border-primary/30');
        }
    },

    async processAudioBlob(blob) {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
        }
        
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        
        // Whisper expects 16kHz mono Float32Array
        let offlineCtx = new OfflineAudioContext(1, audioBuffer.duration * 16000, 16000);
        let source = offlineCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineCtx.destination);
        source.start();
        
        const renderedBuffer = await offlineCtx.startRendering();
        const float32Data = renderedBuffer.getChannelData(0);
        
        this.worker.postMessage({ type: 'transcribe', audioData: float32Data });
    },

    levenshteinDistance(s1, s2) {
        if (!s1 || !s2) return (s1 || s2 || "").length;
        const matrix = [];
        for (let i = 0; i <= s1.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= s2.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= s1.length; i++) {
            for (let j = 1; j <= s2.length; j++) {
                if (s1[i - 1] === s2[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        Math.min(
                            matrix[i][j - 1] + 1, // insertion
                            matrix[i - 1][j] + 1  // deletion
                        )
                    );
                }
            }
        }
        return matrix[s1.length][s2.length];
    },

    handleTranscription(text) {
        if (!text) return;
        
        // Clean up transcribed text
        const cleanText = text.trim().replace(/[.,?!।]/g, '').toLowerCase();
        const spokenWords = cleanText.split(/\s+/);
        
        const targetWords = this.currentSentence.marathi.map(w => w.script);
        const targetTranslit = this.currentSentence.marathi.map(w => w.transliteration.toLowerCase());
        
        const targetSentenceStr = targetWords.join(' ');
        const targetTranslitStr = targetTranslit.join(' ');
        
        // Remove spaces for full string similarity to avoid penalizing spacing issues
        const cleanTextNoSpace = cleanText.replace(/\s+/g, '');
        const targetStrNoSpace = targetSentenceStr.replace(/\s+/g, '');
        const translitStrNoSpace = targetTranslitStr.replace(/\s+/g, '');
        
        const isEnglish = /[a-z]/i.test(cleanTextNoSpace);
        
        let fullDist, maxFullDist;
        if (isEnglish) {
            fullDist = this.levenshteinDistance(cleanTextNoSpace, translitStrNoSpace);
            maxFullDist = Math.max(2, Math.floor(translitStrNoSpace.length * 0.50));
        } else {
            fullDist = this.levenshteinDistance(cleanTextNoSpace, targetStrNoSpace);
            maxFullDist = Math.max(2, Math.floor(targetStrNoSpace.length * 0.50));
        }
        
        const feedback = document.getElementById('feedback-message');
        this.resetSelectionArea();

        if (fullDist <= maxFullDist) {
            // Success! The transcription is close enough to the entire target phrase.
            feedback.textContent = `Heard: "${text}" - Beautiful! ✨`;
            feedback.className = 'text-lg font-semibold h-6 text-center text-green-500';
            
            // Disable interactions while animating
            document.getElementById('speak-btn').disabled = true;
            document.getElementById('retry-btn').disabled = true;
            
            // Visually animate selecting the words sequentially
            targetWords.forEach((tw, index) => {
                setTimeout(() => {
                    const btn = Array.from(document.querySelectorAll('.word-option:not(.selected)')).find(b => b.dataset.word === tw);
                    if (btn) this.selectWord(btn);
                    
                    // On the last word, automatically check answer
                    if (index === targetWords.length - 1) {
                         document.getElementById('speak-btn').disabled = false;
                         document.getElementById('retry-btn').disabled = false;
                         this.checkAnswer(); 
                    }
                }, index * 300);
            });
            return;
        }

        // 2. Individual word alignment
        spokenWords.forEach(sWord => {
            let bestOption = null;
            let minD = Infinity;

            const remainingOptions = Array.from(document.querySelectorAll('.word-option:not(.selected)'));
            remainingOptions.forEach(btn => {
                const targetWord = btn.dataset.word;
                const targetTranslit = btn.dataset.translit.toLowerCase();
                
                let d, maxD;
                if (isEnglish) {
                    d = this.levenshteinDistance(sWord, targetTranslit);
                    maxD = Math.max(1, Math.floor(targetTranslit.length * 0.60));
                } else {
                    d = this.levenshteinDistance(sWord, targetWord);
                    maxD = Math.max(1, Math.floor(targetWord.length * 0.60));
                }

                if (d < minD && d <= maxD) {
                    minD = d;
                    bestOption = btn;
                }
            });

            if (bestOption) {
                this.selectWord(bestOption);
            }
        });

        // Provide partial feedback
        if (this.selectedWords.length > 0) {
            feedback.textContent = `Got some words! Heard: "${text}"`;
            feedback.className = 'text-lg font-semibold h-6 text-center text-blue-500';
        } else {
            feedback.textContent = `Couldn't map those words. Heard: "${text}"`;
            feedback.className = 'text-lg font-semibold h-6 text-center text-red-500';
        }
    }
};
window.SentenceGame = SentenceGame;
