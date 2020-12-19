/*
icons-font-desktop
Desktop application of icons-font-customization, a collection of over 33,000 high-quality free svg icons and tools
for generating customized icon font. All icons are completely free for personal or business requirements.
See all icons at: https://uuware.github.io/icons-font-customization/dist/
See detail information at icons-font-customization: https://github.com/uuware/icons-font-customization

author: uuware@gmail.com
license: MIT
*/
// Modules to control application life and create native browser window
const { app, ipcMain, dialog, Menu, BrowserWindow } = require('electron')
const path = require('path')
const { AppUtils } = require('./src/app-utils');

var mainWindow;
function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      enableRemoteModule: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('dist/index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  // mainWindow.setMenuBarVisibility(false)
  AppUtils.mainWindow = mainWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  Menu.setApplicationMenu(AppUtils.getMainMenu());
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('synchronous-command', async (event, arg) => {
  AppUtils.ipcMainCommand(event, arg);
})
