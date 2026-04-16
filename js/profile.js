const Profile = {
    root: {
        activeProfileId: 'default',
        profiles: {
            'default': {
                name: 'Default User',
                masteredSentences: [], 
                lastActiveDate: null,
                currentStreak: 0,
                totalDaysActive: 0,
                totalAttempts: 0,
                correctAttempts: 0
            }
        }
    },

    get data() {
        return this.root.profiles[this.root.activeProfileId];
    },

    async init() {
        await this.loadProfile();
        this.bindEvents();
        this.recordDailyLogin();
    },

    bindEvents() {
        const selector = document.getElementById('profile-selector');
        const newBtn = document.getElementById('new-profile-btn');
        
        if (selector) {
            selector.addEventListener('change', (e) => {
                this.root.activeProfileId = e.target.value;
                this.recordDailyLogin();
                this.saveProfile();
                if (window.SentenceGame) window.SentenceGame.resetSelectionArea();
            });
        }
        if (newBtn) {
            const modal = document.getElementById('new-profile-modal');
            const saveBtn = document.getElementById('save-profile-btn');
            const cancelBtn = document.getElementById('cancel-profile-btn');
            const nameInput = document.getElementById('new-profile-name');

            newBtn.addEventListener('click', () => {
                if (modal) {
                    modal.classList.remove('hidden');
                    if (nameInput) {
                        nameInput.value = '';
                        nameInput.focus();
                    }
                }
            });

            if (cancelBtn && modal) {
                cancelBtn.addEventListener('click', () => {
                    modal.classList.add('hidden');
                });
            }

            if (saveBtn && modal && nameInput) {
                saveBtn.addEventListener('click', () => {
                    const name = nameInput.value;
                    if (name && name.trim().length > 0) {
                        const id = 'user_' + Date.now();
                        this.root.profiles[id] = {
                            name: name.trim(),
                            masteredSentences: [], 
                            lastActiveDate: null,
                            currentStreak: 0,
                            totalDaysActive: 0,
                            totalAttempts: 0,
                            correctAttempts: 0
                        };
                        this.root.activeProfileId = id;
                        this.recordDailyLogin();
                        this.saveProfile();
                        modal.classList.add('hidden');
                    }
                });
            }
        }
    },

    async loadProfile() {
        if (window.api && window.api.loadProfile) {
            const stored = await window.api.loadProfile();
            if (stored) {
                if (!stored.profiles) {
                    // Migrate old flat format
                    this.root.profiles['default'] = {
                        ...this.root.profiles['default'],
                        ...stored
                    };
                    this.root.activeProfileId = 'default';
                } else {
                    this.root = stored;
                }
            }
        }
        
        // Ensure integrity
        if (!this.root.profiles[this.root.activeProfileId]) {
            this.root.activeProfileId = Object.keys(this.root.profiles)[0] || 'default';
        }
        
        const active = this.data;
        if (!active.masteredSentences) active.masteredSentences = [];
        if (!active.lastActiveDate) active.lastActiveDate = null;
        if (!active.currentStreak) active.currentStreak = 0;
        if (!active.totalDaysActive) active.totalDaysActive = 0;
        if (!active.totalAttempts) active.totalAttempts = 0;
        if (!active.correctAttempts) active.correctAttempts = 0;
    },

    async saveProfile() {
        if (window.api && window.api.saveProfile) {
            await window.api.saveProfile(this.root);
        }
        this.renderProfileUI(); 
    },

    recordDailyLogin() {
        const today = new Date().toISOString().split('T')[0];
        
        if (this.data.lastActiveDate !== today) {
            this.data.totalDaysActive++;
            
            if (!this.data.lastActiveDate) {
                this.data.currentStreak = 1;
            } else {
                const lastDate = new Date(this.data.lastActiveDate);
                const currentDate = new Date(today);
                const diffTime = Math.abs(currentDate - lastDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                
                if (diffDays === 1) {
                    this.data.currentStreak++;
                } else if (diffDays > 1) {
                    this.data.currentStreak = 1; // Streak reset
                }
            }
            this.data.lastActiveDate = today;
            this.saveProfile();
        } else {
            this.renderProfileUI();
        }
    },

    recordMastery(sentenceId) {
        if (!this.data.masteredSentences.includes(sentenceId)) {
            this.data.masteredSentences.push(sentenceId);
            this.saveProfile();
            console.log(`Mastered sentence ID: ${sentenceId}`);
        }
    },

    recordAttempt(isCorrect) {
        this.data.totalAttempts++;
        if (isCorrect) {
            this.data.correctAttempts++;
        }
        this.saveProfile();
    },

    renderProfileUI() {
        const selector = document.getElementById('profile-selector');
        if (selector) {
            selector.innerHTML = '';
            for (const [id, profile] of Object.entries(this.root.profiles)) {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = profile.name;
                if (id === this.root.activeProfileId) option.selected = true;
                selector.appendChild(option);
            }
        }

        const streakEl = document.getElementById('stat-streak');
        const activeEl = document.getElementById('stat-active');
        const totalMasteredEl = document.getElementById('stat-mastered');
        const attemptsEl = document.getElementById('stat-attempts');
        const accuracyEl = document.getElementById('stat-accuracy');
        const masteredList = document.getElementById('mastered-sentences-list');
        
        if (!streakEl || !activeEl) return;
        
        streakEl.textContent = this.data.currentStreak;
        activeEl.textContent = this.data.totalDaysActive;
        
        // Populate custom stats
        if (attemptsEl) attemptsEl.textContent = this.data.totalAttempts;
        if (accuracyEl) {
            const accuracy = this.data.totalAttempts > 0 
                ? Math.round((this.data.correctAttempts / this.data.totalAttempts) * 100) 
                : 0;
            accuracyEl.textContent = `${accuracy}%`;
        }

        const safeSentences = window.SentenceGame ? window.SentenceGame.sentences : [];
        // SentenceGame.allSentences or SentenceGame.sentences? Actually they init with allSentences. Let's fallback to that too contextually if sentences is empty.
        const pool = (window.SentenceGame && window.SentenceGame.allSentences) ? window.SentenceGame.allSentences : (window.SentenceGame ? window.SentenceGame.sentences : []);
        const total = pool && pool.length > 0 ? pool.length : 40;
        
        totalMasteredEl.textContent = `${this.data.masteredSentences.length} / ${total}`;
        
        if (masteredList && pool && pool.length > 0) {
            masteredList.innerHTML = '';
            if (this.data.masteredSentences.length === 0) {
                masteredList.innerHTML = '<p class="text-textSecondary italic p-8 text-center bg-background/50 border border-borderDark border-dashed rounded-xl">No sentences mastered yet. Keep practicing!</p>';
            } else {
                this.data.masteredSentences.forEach(id => {
                    const mappedSentence = pool.find(s => s.id === id);
                    if (mappedSentence) {
                        const li = document.createElement('div');
                        li.className = 'p-4 bg-background/50 border border-borderDark hover:bg-surfaceHover transition rounded-lg flex flex-col mb-2 shadow-sm';
                        li.innerHTML = `
                            <span class="font-medium text-white mb-1">${mappedSentence.english}</span>
                            <span class="text-primary text-xl">${mappedSentence.marathi.map(m => m.script).join(' ')}</span>
                            <span class="text-textSecondary text-[10px] uppercase tracking-widest mt-1">${mappedSentence.marathi.map(m => m.transliteration).join(' ')}</span>
                        `;
                        masteredList.appendChild(li);
                    }
                });
            }
        }
    }
};
window.Profile = Profile;
