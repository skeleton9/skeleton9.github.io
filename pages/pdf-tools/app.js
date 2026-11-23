import * as pdfjs from './vendor/pdf.min.mjs';
pdfjs.GlobalWorkerOptions.workerSrc = new URL('./vendor/pdf.worker.min.mjs', import.meta.url).href;
const $ = id => document.getElementById(id);
const mergeFiles = [];
let outputUrl;
function status(message, error = false) {
  $('status').textContent = message;
  $('status').classList.toggle('error', error);
}
function renderMergeFiles() {
  $('imageList').replaceChildren();
  mergeFiles.forEach((item, index) => {
    const row = document.createElement('li');
    const preview = document.createElement(item.isPdf ? 'strong' : 'img');
    if (item.isPdf) {
      preview.className = 'pdf-badge';
      preview.textContent = 'PDF';
    } else {
      preview.src = item.url;
      preview.alt = '';
    }
    const name = document.createElement('span');
    name.textContent = `${index + 1}. ${item.file.name}`;
    row.append(preview, name);
    for (const [label, delta] of [['上移', -1], ['下移', 1], ['移除', 0]]) {
      const button = document.createElement('button');
      button.className = 'secondary';
      button.textContent = label;
      button.setAttribute('aria-label', `${label} ${item.file.name}`);
      button.disabled = delta !== 0 && (index + delta < 0 || index + delta >= mergeFiles.length);
      button.onclick = () => {
        if (delta === 0) URL.revokeObjectURL(mergeFiles.splice(index, 1)[0].url);
        else [mergeFiles[index], mergeFiles[index + delta]] = [mergeFiles[index + delta], mergeFiles[index]];
        renderMergeFiles();
      };
      row.append(button);
    }
    $('imageList').append(row);
  });
  $('merge').disabled = mergeFiles.length === 0;
}
$('images').onchange = event => {
  const files = Array.from(event.target.files);
  const accepted = files.filter(file => /\.(jpe?g|png|webp|pdf)$/i.test(file.name));
  accepted.forEach(file => mergeFiles.push({file, url: URL.createObjectURL(file), isPdf: /\.pdf$/i.test(file.name)}));
  event.target.value = '';
  renderMergeFiles();
  status(`已添加 ${accepted.length} 个文件${accepted.length < files.length ? '，已跳过不支持的格式' : ''}`);
};
$('clear').onclick = () => {
  mergeFiles.forEach(item => URL.revokeObjectURL(item.url));
  mergeFiles.length = 0;
  renderMergeFiles();
};
$('pdf').onchange = () => {
  const file = $('pdf').files[0];
  $('pdfName').textContent = file ? file.name : '尚未选择文件';
  $('exportPages').disabled = $('exportLong').disabled = !file;
};
function canvasBlob(canvas, type) {
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('图片导出失败，请降低清晰度或使用按页导出。')), type, 0.92));
}
function deliver(blob, filename) {
  outputUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = outputUrl;
  link.download = filename;
  link.textContent = `下载 ${filename}`;
  $('result').append(link);
  link.click();
}
async function run(action) {
  $('imageControls').disabled = $('pdfControls').disabled = true;
  if (outputUrl) URL.revokeObjectURL(outputUrl);
  $('result').replaceChildren();
  status('正在处理，请稍候…');
  try { await action(); }
  catch (error) {
    const message = error.name === 'PasswordException' ? 'PDF 需要正确密码，请填写后重试。' : error.message;
    status(`处理失败：${message}`, true);
  } finally { $('imageControls').disabled = $('pdfControls').disabled = false; }
}
$('merge').onclick = () => run(async () => {
  const doc = await PDFLib.PDFDocument.create();
  for (let i = 0; i < mergeFiles.length; i++) {
    status(`正在处理第 ${i + 1} / ${mergeFiles.length} 个文件…`);
    const item = mergeFiles[i];
    if (item.isPdf) {
      let source;
      try {
        source = await PDFLib.PDFDocument.load(await item.file.arrayBuffer());
      } catch (error) {
        if (error instanceof PDFLib.EncryptedPDFError) {
          throw new Error(`“${item.file.name}”已加密，请先解密再加入合并。`);
        }
        throw new Error(`无法读取 PDF“${item.file.name}”，请检查文件是否损坏。`);
      }
      const pages = await doc.copyPages(source, source.getPageIndices());
      pages.forEach(page => doc.addPage(page));
      continue;
    }
    const image = new Image();
    image.src = mergeFiles[i].url;
    await image.decode();
    const ratio = Math.min(1, 4096 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
    const embedded = await doc.embedPng(await (await canvasBlob(canvas, 'image/png')).arrayBuffer());
    const size = $('paper').value === 'a4' ? [595.28, 841.89] : [canvas.width * .75, canvas.height * .75];
    const margin = $('paper').value === 'a4' ? 24 : 0;
    const scale = Math.min((size[0] - margin * 2) / canvas.width, (size[1] - margin * 2) / canvas.height);
    const width = canvas.width * scale, height = canvas.height * scale;
    doc.addPage(size).drawImage(embedded, {x: (size[0] - width) / 2, y: (size[1] - height) / 2, width, height});
    canvas.width = canvas.height = 0;
  }
  deliver(new Blob([await doc.save()], {type: 'application/pdf'}), 'merged.pdf');
  status(`完成，共 ${doc.getPageCount()} 页。图片长边最高保留 4096 像素。`);
});
async function exportPdf(longImage) {
  const file = $('pdf').files[0];
  const task = pdfjs.getDocument({data: await file.arrayBuffer(), password: $('password').value, isEvalSupported: false, cMapUrl: new URL('./vendor/cmaps/', import.meta.url).href, cMapPacked: true, standardFontDataUrl: new URL('./vendor/standard_fonts/', import.meta.url).href});
  try {
    const doc = await task.promise;
    const dimensions = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      dimensions.push(page.getViewport({scale: 1}));
    }
    const requestedScale = Number($('scale').value);
    let scale = requestedScale;
    let canvas;
    if (longImage) {
      const width = Math.max(...dimensions.map(size => size.width));
      const height = dimensions.reduce((sum, size) => sum + size.height, 0);
      scale = Math.min(scale, 12000 / (height + dimensions.length), 8192 / width, Math.sqrt(16000000 / (width * (height + dimensions.length))));
      canvas = document.createElement('canvas');
      canvas.width = Math.ceil(width * scale);
      canvas.height = dimensions.reduce((sum, size) => sum + Math.ceil(size.height * scale), 0);
      canvas.getContext('2d').fillStyle = '#fff';
      canvas.getContext('2d').fillRect(0, 0, canvas.width, canvas.height);
    }
    const zip = new JSZip();
    const format = $('format').value;
    const extension = format === 'jpeg' ? 'jpg' : 'png';
    let top = 0;
    for (let i = 1; i <= doc.numPages; i++) {
      status(`正在导出第 ${i} / ${doc.numPages} 页…`);
      const page = await doc.getPage(i);
      const base = dimensions[i - 1];
      const pageScale = Math.min(scale, 8192 / Math.max(base.width, base.height), Math.sqrt(16000000 / (base.width * base.height)));
      const viewport = page.getViewport({scale: pageScale});
      const rendered = document.createElement('canvas');
      rendered.width = Math.ceil(viewport.width);
      rendered.height = Math.ceil(viewport.height);
      await page.render({canvasContext: rendered.getContext('2d'), viewport, background: '#ffffff'}).promise;
      if (longImage) {
        canvas.getContext('2d').drawImage(rendered, Math.floor((canvas.width - rendered.width) / 2), top);
        top += rendered.height;
      } else zip.file(`page-${String(i).padStart(4, '0')}.${extension}`, await (await canvasBlob(rendered, `image/${format}`)).arrayBuffer());
      rendered.width = rendered.height = 0;
      page.cleanup();
    }
    const name = file.name.replace(/\.pdf$/i, '');
    if (longImage) {
      deliver(await canvasBlob(canvas, `image/${format}`), `${name}-long.${extension}`);
      status(`完成，共 ${doc.numPages} 页，长图 ${canvas.width} × ${canvas.height} 像素${scale < requestedScale ? '（已自动缩小以适应浏览器）' : ''}。`);
      canvas.width = canvas.height = 0;
    } else {
      status('正在打包 ZIP…');
      deliver(await zip.generateAsync({type: 'blob'}), `${name}-images.zip`);
      status(`完成，共 ${doc.numPages} 个文件。单页最高 1600 万像素。`);
    }
  } finally { await task.destroy(); }
}
$('exportPages').onclick = () => run(() => exportPdf(false));
$('exportLong').onclick = () => run(() => exportPdf(true));

