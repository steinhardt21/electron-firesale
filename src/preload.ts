import { ipcRenderer, contextBridge, ipcMain } from "electron"
import Elements from "./renderer/elements"
import { renderMarkdown } from "./renderer/markdown"

ipcRenderer.on('file-opened', (_, content: string, filePath: string) => {
  Elements.MarkdownView.value = content
  renderMarkdown(content)
})

contextBridge.exposeInMainWorld('api', {
  // things I want to show in the render process
  showOpenDialog: (): void => {
    ipcRenderer.send('show-open-dialog');
  }
})