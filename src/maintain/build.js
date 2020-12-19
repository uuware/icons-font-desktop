function buildHtml() {
    var Path = require('path');
    var Fs = require('fs');
    var { Utils } = require('icons-font-command');

    var currentPath = Path.resolve(__dirname, '../../');
    var tempPath = Path.resolve(currentPath, 'dist/template.html');
    console.log(`Template Path: ${tempPath}`);
    var template = Utils.fRead(tempPath).toString();

    var htmlPath = Path.resolve(currentPath, './node_modules/icons-font-customization/dist/index.html');
    var html = Utils.fRead(htmlPath).toString();
    var tagStart = '<!-- DESKTOP-START -->';
    var indexStart = html.indexOf(tagStart);
    var indexEnd = html.indexOf('<!-- DESKTOP-END -->');
    var insertPart = html.substring(indexStart + tagStart.length, indexEnd);
    console.log(`DESKTOP-START: ${indexStart}, END: ${indexEnd}, LEN: ${insertPart.length}`);

    const result = template.replace('<!-- ICONS-LIST -->', insertPart);
    var outputPath = Path.resolve(currentPath, 'dist/index.html');
    Fs.writeFileSync(outputPath, result);

    console.log(`Output: ${outputPath}`);
}
buildHtml();