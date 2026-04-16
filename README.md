# LanguageApp - Marathi Language Learning

A modern desktop learning application designed to help users master the Marathi language. Built using Electron, Vanilla JS, and styled with Tailwind CSS, this app offers an engaging interface for learning vocabulary and sentence structure.

## 🚀 Features

*   **Interactive Dictionary**: An expansive, searchable glossary. Filter vocabulary by parts of speech (noun, verb, adjective, etc.) to focus your studying.
*   **Sentence Builder Game**: Put your vocabulary to the test! Reconstruct Marathi sentences from their English translations by selecting the correct words in order.
*   **Audio & Speech Integration**: 
    *   **Listen**: Hear correct native pronunciations generated using the **Google Cloud Text-to-Speech API**.
    *   **Speak**: Practice your pronunciation with the built-in speech recognition features powered by **OpenAI Whisper**.
*   **Multi-User Profiles**: Share the app with family or friends. Switch seamlessly between different user profiles.
*   **Progress Tracking**: The dashboard keeps track of your individual learner analytics, including your learning streak, total active days, mastered sentences, total attempts, and overall accuracy.

## 🛠️ Technologies Used

*   **Framework**: Electron
*   **Frontend**: Vanilla JavaScript, HTML5, Tailwind CSS
*   **Audio Synthesis**: `@google-cloud/text-to-speech`
*   **Speech Recognition**: OpenAI Whisper Model integration
*   **Packaging**: `electron-builder` & `electron-packager`

## ⚙️ Setup and Installation

### Prerequisites
*   Node.js and npm installed on your machine.
*   A Google Cloud Project with the Text-to-Speech API enabled, and a generated Service Account Key.

### 1. Clone & Install
Clone the repository and install the required dependencies:
```bash
git clone https://github.com/bharadwajparam/Language.git
cd Language
npm install
```

### 2. Configure Credentials
Place your Google Cloud service account JSON key file in the root directory of the application and name it `credentials.json`. 

### 3. Run Locally
Start the Electron development server:
```bash
npm start
```

## 📦 Building for Production

To create a distributable Windows executable (NSIS installer), run the following command. The output will be inside the `dist` folder.
```bash
npm run dist
```

## 📄 License
This project is licensed under the ISC License.
