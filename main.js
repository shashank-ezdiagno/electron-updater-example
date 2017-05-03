// Copyright (c) The LHTML team
// See LICENSE for details.

const {app, BrowserWindow, Menu, protocol, ipcMain} = require('electron');
const {dialog} = require('electron');
const log = require('electron-log');
const {autoUpdater} = require("electron-updater");
const isDev = require('electron-is-dev');
const path = require('path')
const url = require('url')
var eNotify = null
const isNetworkConnected = require('is-online');
var config = {
  onstart : true,
  status : 'offline'
}

//-------------------------------------------------------------------
// Logging
//
// THIS SECTION IS NOT REQUIRED
//
// This logging setup is not required for auto-updates to work,
// but it sure makes debugging easier :)
//-------------------------------------------------------------------
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

//-------------------------------------------------------------------
// Define the menu
//
// THIS SECTION IS NOT REQUIRED
//-------------------------------------------------------------------
  const name = app.getName();
  template = [{
        label: name,
        submenu: [
            { label: "About " + name, role: 'about' },
            { type: "separator" },
            { label: "Force Reload", accelerator: "CmdOrCtrl+Shift+R", click: function() { win.webContents.reloadIgnoringCache(); }},
            { label: "Quit", accelerator: "CmdOrCtrl+Q", click: function() { app.quit(); }}
        ]}, {
        label: "Edit",
        submenu: [
            { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
            { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
            { type: "separator" },
            { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
            { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
            { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
            { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
        ]}
    ]
function isOnline(user_callback){
    /**
     * Show a warning to the user.
     * You can retry in the dialog until a internet connection
     * is active.
     */
    var message = function(){
        return dialog.showMessageBox({
            title:"There's no internet",
            message:"No internet available, do you want to try again?",
            type:'warning',
            buttons:["Try again please","I don't want to work anyway"],
            defaultId: 0
        },function(index){
            // if clicked "Try again please"
            if(index == 0){
                execute(true);
            }
        })
    };

    var execute = function(force_message){
        isNetworkConnected().then(online=> {
          if(online){
              // Execute action if internet available.
              log.info(config.status)
              if(config.status=='offline'||config.onstart){
                  user_callback()
                  // win.loadURL(url.format({
                  //   pathname: path.join('192.168.0.105:8000', 'lab', 'lab'),
                  //   protocol: 'http:',
                  //   slashes: true
                  // }));
                  win.loadURL(url.format({
                    pathname: path.join(__dirname, 'browser.html'),
                    protocol: 'file:',
                    slashes: true
                  }));
              }
              config.status = 'online'
          }else{
              // Show warning to user
              // And "retry" to connect
              if (config.status == 'online' || force_message || config.onstart){
                message();
              }
              config.status = 'offline'
          }
          config.onstart = false
        })
    };

    // Verify for first time
    execute(false);
}

//-------------------------------------------------------------------
// Open a window that displays the version
//
// THIS SECTION IS NOT REQUIRED
//
// This isn't required for auto-updates to work, but it's easier
// for the app to show a window than to have to click "About" to see
// that updates are working.
//-------------------------------------------------------------------
let win;

function sendStatusToWindow(text) {
  log.info(text);
  console.log(text);
}
function createDefaultWindow() {
  win = new BrowserWindow({width: 1600, height: 1200,
        // webPreferences: {
        //     nodeIntegration: false
        // }
    });
  if(isDev){
    win.webContents.openDevTools();
  }
  win.on('closed', () => {
    win = null;
  });
  win.loadURL(url.format({
                    pathname: path.join(__dirname, 'browser.html'),
                    protocol: 'file:',
                    slashes: true
                  }));
  //win.setFullScreen(true)
  var eNotify = require('electron-notify');
  // Change config options
  eNotify.setConfig({
      appIcon: path.join(__dirname, 'images/icon.png'),
      displayTime: 3000
  });
  // Use it, will be executed only if there's an active internet connection.
  //var interval = setInterval(function() { isOnline(function(){eNotify.notify({ title: 'Internet Status', text: 'Internet Connected,reloading page' });}); }, 10000);
  return win;
}
autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (ev, info) => {
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (ev, info) => {
  sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (ev, err) => {
  sendStatusToWindow('Error in auto-updater.'+err+ev);
})
autoUpdater.on('download-progress', (ev, progressObj) => {
  sendStatusToWindow('Download progress...');
})
autoUpdater.on('update-downloaded', (ev, info) => {
  sendStatusToWindow('Update downloaded; will install in 5 seconds');
});
app.on('ready', function() {
  // Create the Menu
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  createDefaultWindow();
});
app.on('window-all-closed', () => {
  app.quit();
});

//-------------------------------------------------------------------
// Auto updates
//
// For details about these events, see the Wiki:
// https://github.com/electron-userland/electron-builder/wiki/Auto-Update#events
//
// The app doesn't need to listen to any events except `update-downloaded`
//
// Uncomment any of the below events to listen for them.  Also,
// look in the previous section to see them being used.
//-------------------------------------------------------------------
// autoUpdater.on('checking-for-update', () => {
// })
// autoUpdater.on('update-available', (ev, info) => {
// })
// autoUpdater.on('update-not-available', (ev, info) => {
// })
// autoUpdater.on('error', (ev, err) => {
// })
// autoUpdater.on('download-progress', (ev, progressObj) => {
// })
autoUpdater.on('update-downloaded', (ev, info) => {
  // Wait 5 seconds, then quit and install
  // In your application, you don't need to wait 5 seconds.
  // You could call autoUpdater.quitAndInstall(); immediately
  setTimeout(function() {
    autoUpdater.quitAndInstall();
  }, 5000)
})

app.on('ready', function()  {
  autoUpdater.checkForUpdates();
});
