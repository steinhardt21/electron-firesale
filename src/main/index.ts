import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { join } from 'path';
import { readFile, writeFile } from 'node:fs/promises'

try {
  require('electron-reloader')(module)
} catch (_) {}

type MarkdownFile = {
  content?: string
  filePath?: string
}

let currentFile: MarkdownFile = {
  content: '',
  filePath: undefined
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    mainWindow.focus()
    // showOpenDialog(mainWindow)
  })

  mainWindow.webContents.openDevTools({
    mode: 'detach',
  });
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


const showOpenDialog = async (browserWindow: BrowserWindow) => {
  const result = await dialog.showOpenDialog(browserWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Markdown File', extensions: ['md']}]
  })

  if(result.canceled) return

  const [filepath] = result.filePaths
  openFile(browserWindow, filepath)
} 

const openFile = async(browserWindow: BrowserWindow, filePath: string) => {
  const content = await readFile(filePath, { encoding: 'utf-8' })

  browserWindow.webContents.send('file-opened', content, filePath)
  console.log(content)  
}

ipcMain.on('show-open-dialog', (event) => {
  const browserWindow = BrowserWindow.fromWebContents(event.sender)

  if(!browserWindow) return

  showOpenDialog(browserWindow)
})

ipcMain.on('show-export-html-dialog', async (event, html: string) => {
  // who sent me this event
  const browserWindow = BrowserWindow.fromWebContents(event.sender)

  if(!browserWindow) return

  showExportHtmlDialog(browserWindow, html)
})

const showExportHtmlDialog = async (browserWindow: BrowserWindow, html: string) => {
  const result = await dialog.showSaveDialog(browserWindow, {
    title: 'Export HTML',
    filters: [{ name: 'HTML file', extensions: ['html'] }]
  })

  if(result.canceled) return

  const { filePath } = result // It is the path (with name of the file included) that we for the file to be save

  if(!filePath) return

  exportHtml(filePath, html)
} 

const exportHtml = async (filePath: string, html: string) => {
  await writeFile(filePath, html, { encoding: 'utf-8' })
}

ipcMain.on('save-file', async (event, content: string) => {
  const browserWindow = BrowserWindow.fromWebContents(event.sender)

  if(!browserWindow) return

  await saveFile(browserWindow, content)
})

const showSaveDialog = async (browserWindow: BrowserWindow) => {
  const result = await dialog.showSaveDialog(browserWindow, {
    title: 'Save Markdown',
    filters: [{ name: 'Markdown file', extensions: ['md'] }]
  })

  if(result.canceled) return

  const { filePath } = result // It is the path (with name of the file included) that we for the file to be save

  if(!filePath) return

  return filePath
}

const saveFile = async (browserWindow: BrowserWindow, content: string) => {
  const filePath = currentFile.filePath ?? await showSaveDialog(browserWindow)

  if(!filePath) return

  await writeFile(filePath, content, { encoding: 'utf-8'})
}
