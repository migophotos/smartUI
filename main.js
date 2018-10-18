/* eslint-disable indent */

const {app, BrowserWindow} = require('electron');
const path = require('path');

// store reference on win as a global object to prevent eating it by garbage collector!
let win = null;
let sttipExample = null;

function createWindow() {
    win = new BrowserWindow({
        title: 'SmartWidgets Editor',
        icon: 'favicon.png',
        width: 1500,
        height: 900
    });
    win.loadFile('index.html');

    // win.webContents.openDevTools()

    win.on('closed', () => {
        win = null;
    });
}

// Electron is ready for windows creating
app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});

