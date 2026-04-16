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

This project uses `electron-builder` to package the application into a standalone executable.

To create a distributable Windows installer (NSIS format), execute the following build script:
```bash
npm run dist
```

### Build Artifacts
Upon a successful build, the generated artifacts will be located in the `dist` directory. You will typically find:
*   **`LanguageApp Setup <version>.exe`**: The installer executable that users can run to install the application.
*   **`win-unpacked/`**: A directory containing the unpacked application and its resources, which is useful for testing the final build output without actually running the installer.

### Important Build Notes
*   **Target Configuration**: The build target is currently configured for Windows NSIS installers in `package.json` under `build.win.target`.
*   **Credentials**: Please note that when packaging for production, you should ensure that sensitive credentials (like `credentials.json`) are managed securely and handled properly during the application's runtime or built into env configurations, depending on how they are referenced in the source code.

## 📄 License
This project is licensed under the GNU General Public License v3.0 (GPL-3.0).
