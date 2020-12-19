// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const remote = require('electron').remote;

window.showVersion = () => {
  var verUrl = 'https://uuware.github.io/icons-font-desktop/dist/version.html?ver=';
  var ver = remote.app.getVersion();
  document.getElementById('version').src = verUrl + ver + '.&t=' + Date.now;
}

window.addEventListener('DOMContentLoaded', () => {
  // const replaceText = (selector, text) => {
  //   const element = document.getElementById(selector)
  //   if (element) element.innerText = text
  // }

  // for (const type of ['chrome', 'node', 'electron']) {
  //   replaceText(`${type}-version`, process.versions[type])
  // }

  // Open all links in external browser
  var shell = require('electron').shell;
  document.addEventListener('click', function (event) {
    if (event.target.tagName === 'A' && event.target.href.startsWith('http')) {
      event.preventDefault()
      shell.openExternal(event.target.href)
    }
  })

  const { ipcRenderer } = require('electron')
  window.sendCommand = (arg) => {
    var result = ipcRenderer.sendSync('synchronous-command', arg);
    return result;
  }
})
