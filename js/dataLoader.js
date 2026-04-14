const DataLoader = {
    async loadDictionary() {
        try {
            const res = await fetch('data/dictionary.json');
            return await res.json();
        } catch (e) {
            console.error("Failed to load dictionary:", e);
            return [];
        }
    },
    async loadSentences() {
        try {
            const res = await fetch('data/sentences.json');
            return await res.json();
        } catch (e) {
            console.error("Failed to load sentences:", e);
            return [];
        }
    }
};
window.DataLoader = DataLoader;
