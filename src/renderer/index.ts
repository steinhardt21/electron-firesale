import { renderMarkdown } from './markdown';
import Elements from './elements';

Elements.MarkdownView.addEventListener('input', async () => {
  const markdown = Elements.MarkdownView.value;
  renderMarkdown(markdown);
});

Elements.OpenFileButton.addEventListener('click', () => {
  window.api.showOpenDialog();
})

window.api.onFileOpen((content: string) => {
  Elements.MarkdownView.value = content
  renderMarkdown(content)
})

Elements.ExportHtmlButton.addEventListener('click', () => {
  const html = Elements.RenderedView.innerHTML;
  window.api.showExportHtmlDialog(html);
})