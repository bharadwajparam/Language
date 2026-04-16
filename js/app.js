document.addEventListener('DOMContentLoaded', async () => {
    // Global State
    window.appState = { currentLevel: 'All' };

    // 1. Navigation Logic
    const navDict = document.getElementById('nav-dictionary');
    const navSent = document.getElementById('nav-sentence');
    const navProf = document.getElementById('nav-profile');
    const dictView = document.getElementById('dictionary-view');
    const sentView = document.getElementById('sentence-view');
    const profView = document.getElementById('profile-view');

    function switchView(view) {
        // Reset all
        [dictView, sentView, profView].forEach(v => {
            v.classList.remove('active-view');
            v.classList.add('hidden');
        });
        
        [navDict, navSent, navProf].forEach(n => {
            n.classList.remove('active', 'border-b-2', 'border-primary', 'text-primary');
            n.classList.add('text-gray-500');
        });

        // Set active
        if (view === 'dictionary') {
            dictView.classList.add('active-view');
            dictView.classList.remove('hidden');
            navDict.classList.add('active', 'border-b-2', 'border-primary', 'text-primary');
            navDict.classList.remove('text-gray-500');
        } else if (view === 'sentence') {
            sentView.classList.add('active-view');
            sentView.classList.remove('hidden');
            navSent.classList.add('active', 'border-b-2', 'border-primary', 'text-primary');
            navSent.classList.remove('text-gray-500');
        } else if (view === 'profile') {
            profView.classList.add('active-view');
            profView.classList.remove('hidden');
            navProf.classList.add('active', 'border-b-2', 'border-primary', 'text-primary');
            navProf.classList.remove('text-gray-500');
            // Refresh explicitly on view
            if (window.Profile) window.Profile.renderProfileUI();
        }
    }

    navDict.addEventListener('click', () => switchView('dictionary'));
    navSent.addEventListener('click', () => switchView('sentence'));
    if (navProf) navProf.addEventListener('click', () => switchView('profile'));

    // 2. Load Data and Initialize Apps
    const dictionaryData = await window.DataLoader.loadDictionary();
    const sentencesData = await window.DataLoader.loadSentences();

    window.Dictionary.init(dictionaryData);
    window.SentenceGame.init(sentencesData);
    if (window.Profile) await window.Profile.init();

    // Global Level Selector Binding
    const levelSelector = document.getElementById('global-level');
    levelSelector.addEventListener('change', (e) => {
        const val = e.target.value;
        window.appState.currentLevel = val === 'All' ? 'All' : parseInt(val);
        window.Dictionary.filterWords();
        window.SentenceGame.loadNextSentence();
    });
});
