const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    speakText: (text) => ipcRenderer.invoke('speak-text', text),
    loadProfile: () => ipcRenderer.invoke('load-profile'),
    saveProfile: (data) => ipcRenderer.invoke('save-profile', data)
});
