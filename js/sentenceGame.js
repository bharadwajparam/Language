const SentenceGame = {
    sentences: [],
    currentSentence: null,
    score: 0,
    selectedWords: [],
    
    init(sentences) {
        this.sentences = sentences;
        this.score = parseInt(localStorage.getItem('langAppScore')) || 0;
        this.updateScoreDisplay();
        this.bindEvents();
        this.loadNextSentence();
    },
    
    updateScoreDisplay() {
        document.getElementById('score-display').textContent = this.score;
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
    },
    
    loadNextSentence() {
        if (!this.sentences || this.sentences.length === 0) return;
        
        // Pick random sentence
        const randomIndex = Math.floor(Math.random() * this.sentences.length);
        this.currentSentence = this.sentences[randomIndex];
        this.selectedWords = [];
        
        // Reset UI
        document.getElementById('target-sentence').textContent = this.currentSentence.english;
        document.getElementById('feedback-message').textContent = '';
        document.getElementById('feedback-message').className = 'text-lg font-semibold h-6 text-center';
        
        const selectedArea = document.getElementById('selected-words-area');
        selectedArea.innerHTML = '<span class="text-gray-400 italic">Select words from below...</span>';
        selectedArea.className = 'min-h-[80px] border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-wrap gap-3 items-center justify-center mb-8 bg-gray-50 transition-colors';
        
        // Hide/Show Buttons
        document.getElementById('check-btn').classList.add('hidden');
        document.getElementById('next-btn').classList.add('hidden');
        document.getElementById('retry-btn').classList.remove('hidden');

        // Shuffle marathi words
        const shuffledWords = this.shuffleArray([...this.currentSentence.marathi]);
        this.renderOptions(shuffledWords);
    },
    
    renderOptions(words) {
        const container = document.getElementById('word-options-area');
        container.innerHTML = '';
        
        words.forEach((wordObj, index) => {
            const btn = document.createElement('button');
            btn.className = 'word-option px-4 py-2 bg-white border-2 border-gray-200 rounded-xl shadow-sm font-medium text-dark hover:border-primary hover:text-primary focus:outline-none flex flex-col items-center leading-tight';
            btn.innerHTML = `<span class="text-lg">${wordObj.script}</span><span class="text-xs text-gray-400 capitalize">${wordObj.transliteration}</span>`;
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
        container.innerHTML = '';
        
        if (this.selectedWords.length === 0) {
            container.innerHTML = '<span class="text-gray-400 italic">Select words from below...</span>';
            return;
        }

        this.selectedWords.forEach(wordItem => {
            const badge = document.createElement('div');
            badge.className = 'selected-word px-4 py-2 bg-primary text-white rounded-xl shadow-sm font-medium border-2 border-transparent flex flex-col items-center leading-tight';
            badge.innerHTML = `<span>${wordItem.word}</span><span class="text-[10px] opacity-80 capitalize">${wordItem.translit}</span>`;
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
        selectedArea.className = 'min-h-[80px] border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-wrap gap-3 items-center justify-center mb-8 bg-gray-50 transition-colors';
    },

    checkAnswer() {
        const userSen = this.selectedWords.map(w => w.word).join(' ');
        const targetSen = this.currentSentence.marathi.map(w => w.script).join(' ');
        
        const feedback = document.getElementById('feedback-message');
        const selectedArea = document.getElementById('selected-words-area');
        
        if (userSen === targetSen) {
            feedback.textContent = 'Awesome! Correct Answer. 🎉';
            feedback.className = 'text-lg font-semibold h-6 text-center text-green-600';
            selectedArea.classList.remove('border-gray-300', 'bg-gray-50');
            selectedArea.classList.add('border-green-400', 'bg-green-50');
            
            // Update Score
            this.score += 10;
            localStorage.setItem('langAppScore', this.score);
            this.updateScoreDisplay();
            
            document.getElementById('check-btn').classList.add('hidden');
            document.getElementById('retry-btn').classList.add('hidden');
            document.getElementById('next-btn').classList.remove('hidden');
            
            // Disable selecting/deselecting words temporarily if won 
            // (they reset when clicking next)
        } else {
            feedback.textContent = 'Oops! Try again. ❌';
            feedback.className = 'text-lg font-semibold h-6 text-center text-red-500';
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
    }
};
window.SentenceGame = SentenceGame;
