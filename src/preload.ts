import { ipcRenderer, contextBridge } from 'electron';
import Elements from './renderer/elements';
import { renderMarkdown } from './renderer/markdown';

// ipcRenderer.on('file-opened', (_, content: string) => {
//   Elements.MarkdownView.value = content;
//   renderMarkdown(content);
// });

contextBridge.exposeInMainWorld('api', {
  onFileOpen: (callback: (content: string) => string) => {
    ipcRenderer.on('file-opened', (_, content: string) => {
      callback(content)
    })
  },
  showOpenDialog: () => {
    ipcRenderer.send('show-open-dialog');
  },
});
