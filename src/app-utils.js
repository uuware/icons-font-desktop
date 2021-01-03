var { app, dialog, shell, Menu } = require('electron')
var { IconsFontLite, Utils } = require('icons-font-command');

exports.AppUtils = class AppUtils {
    static mainWindow;

    static async ipcMainCommand(event, arg) {
        if (!arg || !arg.id) {
            console.log('Wrong parameter for synchronous-command: ', arg)
            return;
        }

        var result;
        console.log('synchronous-command: ', arg.id);
        switch (arg.id) {
            case 'selectDirectoryDialog':
                var title = arg.title || 'Select a directory';
                var path = arg.path || '';
                result = await this.selectDirectoryDialog(title, path);
                break;
            case 'openLocation':
                var path = arg.path || '';
                if (path !== '' && Utils.dExist(path)) {
                    shell.openPath(path);
                } else {
                    result = `Folder doesn't exist`;
                }
                break;
            case 'generateFonts':
                result = await this.generateFonts(arg.paras);
                break;
            default:
                console.log('No implementation for: ', arg.id)
        }

        event.returnValue = result;
        return;
    }

    static async selectDirectoryDialog(title, path) {
        var path = dialog.showOpenDialogSync(this.mainWindow, {
            title: title,
            defaultPath: path,
            properties: ['openDirectory']
        });
        return path;
    }

    static alert(msg, title) {
        dialog.showMessageBoxSync(this.mainWindow, {
            type: 'info',
            title: title,
            message: msg,
        });
    }

    static createIconHeader(pngNumbers) {
        var buf = Buffer.alloc(6);
        // icon header
        buf.writeUInt16LE(0, 0); // Reserved. Must always be 0.
        buf.writeUInt16LE(1, 2); // Specifies image type: 1 for icon (.ICO) image
        buf.writeUInt16LE(pngNumbers, 4); // Specifies number of images in the file.
        return buf;
    }

    static createIconPngHeader(savedSize, pngSize, w, h) {
        var buf = Buffer.alloc(16);
        var width = w >= 256 ? 0 : w;
        var height = h >= 256 ? 0 : h;

        // png header
        buf.writeUInt8(width, 0); // Specifies image width in pixels.
        buf.writeUInt8(height, 1); // Specifies image height in pixels.
        buf.writeUInt8(0, 2); // Should be 0 if the image does not use a color palette.
        buf.writeUInt8(0, 3); // Reserved. Should be 0.
        buf.writeUInt16LE(1, 4); // Specifies color planes. Should be 0 or 1.
        buf.writeUInt16LE(32, 6); // Specify 32 bits per pixel (bit depth)
        buf.writeUInt32LE(pngSize, 8); // Specifies the size of the image's data in bytes
        buf.writeUInt32LE(savedSize + 16, 12); // Specifies the offset of BMP or PNG data from the beginning of the ICO/CUR file
        return buf;
    }

    static async generateFonts(paras) {
        var result = {
            ok: true
        };

        if (!Utils.dExist(paras.outputPath)) {
            Utils.dCreate(paras.outputPath, true);
        }
        if (!Utils.fExist(paras.outputPath)) {
            this.alert(`Can't create outputPath: ${paras.outputPath}`);
            result.ok = false;
            return result;
        }

        if (paras['sel-fmt']) {
            var fmt = paras['sel-fmt'];
            var fileFmt = fmt === 'jpeg' ? 'jpg' : (fmt === 'x-icon' ? 'ico' : fmt);
            paras.icons.forEach(icon => {
                // { path: src, name: name, data: }
                if (icon.data) {
                    var data = icon.data;
                    var data2 = data.replace('vnd.microsoft.icon', 'icon').replace(/^data:image\/\w+;base64,/, '');
                    var buf = Buffer.from(data2, 'base64');
                    Utils.fWrite(paras.outputPath + `/${icon.name}.${fileFmt}`, buf);
                }
            });
        }

        var defaultConfig = IconsFontLite.getDefaultConfig();
        var parameters = {
            '--config': {
                fontName: paras.fontName,
                outputPath: paras.outputPath,
                outputName: paras.outputName,
                startChar: paras.startChar || 10000,
                svgicons2svgfont: {
                    fontHeight: paras.fontHeight || 1024
                },
                icons: paras.icons,
                fontType: {
                    'woff2': paras['chk-woff2'],
                    'woff': paras['chk-woff'],
                    'ttf': paras['chk-ttf'],
                    'eot': paras['chk-eot'],
                    'svg': paras['chk-svg'],
                },
                cssTemplate: defaultConfig.cssTemplate,
                htmlTemplate: defaultConfig.htmlTemplate,
                noExit: true,
            }
        };
        var ret = await IconsFontLite.generateFont(parameters);
        if (ret !== true) {
            this.alert('Failed to generate fonts.');
            result.ok = false;
        }

        return result;
    }

    static getMainMenu() {
        const isMac = process.platform === 'darwin';
        const template = [
            {
                label: 'File',
                submenu: [
                    {
                        label: 'Exit',
                        click() {
                            app.quit()
                        }
                    },
                ]
            },
            {
                label: 'Edit',
                submenu: [
                    { role: 'undo' },
                    { role: 'redo' },
                    { type: 'separator' },
                    { role: 'cut' },
                    { role: 'copy' },
                    { role: 'paste' },
                    ...(isMac ? [
                        { role: 'pasteAndMatchStyle' },
                        { role: 'delete' },
                        { role: 'selectAll' },
                        { type: 'separator' },
                        {
                            label: 'Speech',
                            submenu: [
                                { role: 'startSpeaking' },
                                { role: 'stopSpeaking' }
                            ]
                        }
                    ] : [
                            { role: 'delete' },
                            { type: 'separator' },
                            { role: 'selectAll' }
                        ]),
                        { role: 'toggleDevTools' },
                        { role: 'forceReload' },
                    ]
            },
            {
                label: 'About',
                submenu: [
                    {
                        label: `About icons-font-desktop`,
                        click() {
                            AppUtils.alert(`icons-font-desktop\n\nDesktop version of free-icons-customization, a collection of free svg icons and tools for generating icon font.`);
                        }
                    },
                    {
                        label: 'Project Home',
                        click() {
                            shell.openExternal('https://github.com/uuware/icons-font-desktop');
                        }
                    },
                ]
            },
        ];
        var applicationMenu = Menu.buildFromTemplate(template);
        return applicationMenu;
    }
}
