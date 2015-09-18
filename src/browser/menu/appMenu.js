'use strict';

import app from 'app';
import Menu from 'menu';
import MenuItem from 'menu-item';

let template = [{
    label: 'File',
    submenu: [
        {
            label: 'Quit',
            accelerator: 'Command+Q',
            click: function () {app.quit();}
        },
        {
            label: 'Toggle Developer Tools',
            accelerator: (function () {
                if (process.platform == 'darwin') {
                    return 'Alt+Command+I';
                } else {
                    return 'Ctrl+Shift+I';
                }
            })(),
            click: function (item, focusedWindow) {
                if (focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            }
        },
    ]
}];

let appMenu = Menu.buildFromTemplate(template);

module.exports = appMenu;
