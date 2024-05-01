import { ipcRenderer, contextBridge, ipcMain } from "electron"
import Elements from "./renderer/elements"
import { renderMarkdown } from "./renderer/markdown"

// ipcRenderer.on('file-opened', (_, content: string, filePath: string) => {
//   Elements.MarkdownView.value = content
//   renderMarkdown(content)
// })

contextBridge.exposeInMainWorld('api', {
  // things I want to show in the render process
  showOpenDialog: (): void => {
    ipcRenderer.send('show-open-dialog');
  },
  onFileOpen: (callback: (content: string) => string) => {
    ipcRenderer.on('file-opened', (_, content: string) => {
      callback(content)
    })
  },
  showExportHtmlDialog: (html: string) => {
    ipcRenderer.send('show-export-html-dialog', html)
  },
  saveFile: (content: string) => {
    ipcRenderer.send('save-file', content)
  }
})