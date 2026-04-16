const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const textToSpeech = require('@google-cloud/text-to-speech');
let ttsClient;
try {
  ttsClient = new textToSpeech.TextToSpeechClient({
    keyFilename: path.join(__dirname, 'credentials.json')
  });
} catch (e) {
  console.log("TTS init failed, expecting credentials:", e.message);
}

ipcMain.handle('speak-text', async (event, text) => {
    if (!ttsClient) return null;
    try {
        const request = {
            input: { text: text },
            voice: { languageCode: 'mr-IN', name: 'mr-IN-Wavenet-A' },
            audioConfig: { audioEncoding: 'MP3' },
        };
        const [response] = await ttsClient.synthesizeSpeech(request);
        return response.audioContent.toString('base64');
    } catch(err) {
        console.error(err);
        return null;
    }
});

// Profile Data Management
ipcMain.handle('load-profile', async (event) => {
    const profilePath = path.join(app.getPath('userData'), 'profile.json');
    try {
        if (fs.existsSync(profilePath)) {
            const data = fs.readFileSync(profilePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error("Failed to load profile:", err);
    }
    return null;
});

ipcMain.handle('save-profile', async (event, profileData) => {
    const profilePath = path.join(app.getPath('userData'), 'profile.json');
    try {
        fs.writeFileSync(profilePath, JSON.stringify(profileData, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error("Failed to save profile:", err);
        return false;
    }
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
