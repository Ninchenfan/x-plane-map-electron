// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import path from 'path';
import url from 'url';
import { app, Menu, shell } from 'electron';
import { devMenuTemplate } from './menu/dev_menu_template';
import createWindow from './helpers/window';
import UDPListener from './udp';
import MapServer from './server';

const defaultMenu = require('electron-default-menu');
require('electron-context-menu')();

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from './env';

var mainWindow;

var setApplicationMenu = function () {
    const menu = defaultMenu(app, shell);
    if (env.name !== 'production') {
        menu.push(devMenuTemplate);
    }
    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
};

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== 'production') {
    var userDataPath = app.getPath('userData');
    app.setPath('userData', userDataPath + ' (' + env.name + ')');
}

app.on('ready', function () {
    setApplicationMenu();

    var mainWindow = createWindow('main', {
        width: 1000,
        height: 800,
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'config.html'),
        protocol: 'file:',
        slashes: true,
        hash: '#single'
    }));

    if (env.name === 'development') {
        //mainWindow.openDevTools();
    }
});

app.on('window-all-closed', function () {
    app.quit();
});

var planesList = {};

var mapServer = new MapServer(planesList).listen(8080);
var udpClient = new UDPListener(planesList).listen(49003);
