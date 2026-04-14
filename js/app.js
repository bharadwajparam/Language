document.addEventListener('DOMContentLoaded', async () => {
    // 1. Navigation Logic
    const navDict = document.getElementById('nav-dictionary');
    const navSent = document.getElementById('nav-sentence');
    const dictView = document.getElementById('dictionary-view');
    const sentView = document.getElementById('sentence-view');

    function switchView(view) {
        if (view === 'dictionary') {
            dictView.classList.add('active-view');
            dictView.classList.remove('hidden');
            sentView.classList.remove('active-view');
            sentView.classList.add('hidden');
            
            navDict.classList.add('active', 'border-b-2', 'border-primary', 'text-primary');
            navDict.classList.remove('text-gray-500');
            navSent.classList.remove('active', 'border-b-2', 'border-primary', 'text-primary');
            navSent.classList.add('text-gray-500');
        } else {
            sentView.classList.add('active-view');
            sentView.classList.remove('hidden');
            dictView.classList.remove('active-view');
            dictView.classList.add('hidden');
            
            navSent.classList.add('active', 'border-b-2', 'border-primary', 'text-primary');
            navSent.classList.remove('text-gray-500');
            navDict.classList.remove('active', 'border-b-2', 'border-primary', 'text-primary');
            navDict.classList.add('text-gray-500');
        }
    }

    navDict.addEventListener('click', () => switchView('dictionary'));
    navSent.addEventListener('click', () => switchView('sentence'));

    // 2. Load Data and Initialize Apps
    const dictionaryData = await window.DataLoader.loadDictionary();
    const sentencesData = await window.DataLoader.loadSentences();

    window.Dictionary.init(dictionaryData);
    window.SentenceGame.init(sentencesData);
});
