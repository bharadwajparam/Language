const Dictionary = {
    words: [],
    currentCategory: 'All',
    
    init(words) {
        this.words = words;
        this.filterWords(); // Replaces renderGrid to apply initial level filter
        this.setupSearch();
        this.setupCategoryFilters();
    },
    
    renderGrid(wordsToRender) {
        const grid = document.getElementById('dictionary-grid');
        grid.innerHTML = '';
        
        if (wordsToRender.length === 0) {
            grid.innerHTML = '<div class="text-center text-textSecondary col-span-full py-10">No words found.</div>';
            return;
        }

        wordsToRender.forEach(item => {
            const card = document.createElement('div');
            const emoji = item.emoji || item.word.charAt(0).toUpperCase();

            card.className = 'dict-card relative bg-surface p-6 rounded-xl shadow-lg border border-borderDark flex flex-col justify-center items-center text-center';
            card.innerHTML = `
                <span class="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider text-textSecondary">${item.category || ''}</span>
                <button class="absolute top-3 right-3 text-textSecondary hover:text-rose-500 transition">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>
                <div class="w-20 h-20 rounded-full bg-highlight border border-borderDark flex items-center justify-center mb-4 mt-2 shadow-inner overflow-hidden relative">
                    <span class="text-4xl text-white ${item.emoji ? '' : 'opacity-50 text-gray-400 font-bold'}">${emoji}</span>
                </div>
                <h3 class="text-xl text-white font-medium mb-1 capitalize">${item.word}</h3>
                <div class="text-3xl filter font-bold text-primary mb-1 mt-1">${item.marathi.script}</div>
                <div class="text-xs text-textSecondary font-medium tracking-widest mt-1 uppercase">${item.marathi.transliteration}</div>
            `;
            grid.appendChild(card);
        });
    },

    filterWords() {
        const term = document.getElementById('searchInput').value.toLowerCase();
        // Support both string tiers and cached legacy numeric levels seamlessly
        const weights = { "Beginner": 1, "Intermediate": 2, "Advanced": 3, 1: 1, 2: 2, 3: 3, 4: 3 };
        
        const filtered = this.words.filter(item => {
            const textMatch = item.word.toLowerCase().includes(term) || 
                              item.marathi.script.includes(term) ||
                              item.marathi.transliteration.toLowerCase().includes(term);
            const levelMatch = window.appState.currentLevel === 'All' || 
                               (weights[item.level] && weights[item.level] === weights[window.appState.currentLevel]);
            const categoryMatch = this.currentCategory === 'All' || item.category === this.currentCategory;
            return textMatch && levelMatch && categoryMatch;
        });
        this.renderGrid(filtered);
    },

    setupSearch() {
        document.getElementById('searchInput').addEventListener('input', () => this.filterWords());
    },

    setupCategoryFilters() {
        const btns = document.querySelectorAll('.cat-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active classes from all
                btns.forEach(b => {
                    b.classList.remove('border-primary', 'bg-surface/80', 'text-white', 'active');
                    b.classList.add('border-transparent', 'text-textSecondary');
                });
                
                // Add active to clicked
                const target = e.currentTarget;
                target.classList.remove('border-transparent', 'text-textSecondary');
                target.classList.add('border-primary', 'bg-surface/80', 'text-white', 'active');
                
                this.currentCategory = target.dataset.cat;
                this.filterWords();
            });
        });
    }
};
window.Dictionary = Dictionary;
