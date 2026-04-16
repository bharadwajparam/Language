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
            grid.innerHTML = '<div class="text-center text-gray-500 col-span-full py-10">No words found.</div>';
            return;
        }

        wordsToRender.forEach(item => {
            const card = document.createElement('div');
            card.className = 'dict-card relative bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col justify-center items-center text-center';
            card.innerHTML = `
                <span class="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider text-gray-300">${item.category || ''}</span>
                <h3 class="text-xl text-gray-400 font-medium mt-2 mb-2 capitalize">${item.word}</h3>
                <div class="text-4xl filter font-bold text-primary mb-1">${item.marathi.script}</div>
                <div class="text-md text-secondary font-medium tracking-wide">${item.marathi.transliteration}</div>
            `;
            grid.appendChild(card);
        });
    },

    filterWords() {
        const term = document.getElementById('searchInput').value.toLowerCase();
        const filtered = this.words.filter(item => {
            const textMatch = item.word.toLowerCase().includes(term) || 
                              item.marathi.script.includes(term) ||
                              item.marathi.transliteration.toLowerCase().includes(term);
            const levelMatch = item.level === window.appState.currentLevel;
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
                    b.classList.remove('bg-primary', 'text-white', 'shadow-sm', 'active');
                    b.classList.add('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
                });
                
                // Add active to clicked
                const target = e.currentTarget;
                target.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
                target.classList.add('bg-primary', 'text-white', 'shadow-sm', 'active');
                
                this.currentCategory = target.dataset.cat;
                this.filterWords();
            });
        });
    }
};
window.Dictionary = Dictionary;
