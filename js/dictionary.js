const Dictionary = {
    words: [],
    
    init(words) {
        this.words = words;
        this.renderGrid(this.words);
        this.setupSearch();
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
            card.className = 'dict-card bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col justify-center items-center text-center';
            card.innerHTML = `
                <h3 class="text-xl text-gray-400 font-medium mb-2 capitalize">${item.word}</h3>
                <div class="text-4xl filter font-bold text-primary mb-1">${item.marathi.script}</div>
                <div class="text-md text-secondary font-medium tracking-wide">${item.marathi.transliteration}</div>
            `;
            grid.appendChild(card);
        });
    },

    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = this.words.filter(item => 
                item.word.toLowerCase().includes(term) || 
                item.marathi.script.includes(term) ||
                item.marathi.transliteration.toLowerCase().includes(term)
            );
            this.renderGrid(filtered);
        });
    }
};
window.Dictionary = Dictionary;
