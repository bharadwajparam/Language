# ChatPat V1.0.0 Release Notes 🎉

Welcome to the official **V1.0.0** release of ChatPat - the cutting-edge Marathi language learning desktop application!

This release brings the application from a basic MVP to a full-fledged, premium platform equipped with native AI models and a modern interface.

### 🌿 Plantify Dark Mode Engine
- Completely overhauled the UI logic to utilize a sleek, dark aesthetic.
- Introduced charcoal glassmorphism panels (`#121212`) combined with vibrant green highlights (`#22c55e`).
- Designed a custom catalog sidebar offering immediate access to search, grammatical categories, and difficulty levels.

### 🎙️ Local AI Voices & Speech Recognition
- **Native TTS Offline:** Ripped out the cloud dependencies and incorporated the localized, high-speed **Huggingface Xenova MMS** model for flawless, offline native Marathi audio synthesis. 
- **OpenAI Whisper STT:** Integrated OpenAI's Whisper model completely offline allowing learners to practice their spoken pronunciations. 
- **Fuzzy Pronunciation Matching:** Added a native `Levenshtein distance` tolerance algorithm to provide users with a 30% margin of error on speech-to-text pronunciation matches.

### 🧩 Practice Arena (Sentence Builder)
- Reconstruct English phrases entirely natively in Marathi using dynamic, drag-and-drop animated word choices.

### 👥 Learner Profiles & Analytics
- Track your learning independently with local, multi-user secure Profiles. 
- Dashboard stats seamlessly compute **Active Streaks**, **Total Learning Days**, **Total Attempts**, and **Total Accuracy**.
- **Mastery Library**: Sentences executed flawlessly are instantly recorded and tracked inside a permanent Mastery Dictionary. 
