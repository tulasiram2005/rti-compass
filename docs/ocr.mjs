const vendor=new URL('./vendor/',import.meta.url);
export async function readReply(file,language,report){
 if(file.size>15*1024*1024)throw Error('Choose a scan smaller than 15 MB.');
 let worker,documentTask;
 async function recognize(input){
  if(!worker){
   const {default:engine}=await import('./vendor/tesseract.esm.min.js');
   worker=await engine.createWorker(language,1,{workerBlobURL:false,workerPath:new URL('worker.min.js',vendor).href,corePath:vendor.href,langPath:vendor.href,logger:message=>report(message.status)});
  }
  return (await worker.recognize(input)).data.text;
 }
 try{
  if(file.type!=='application/pdf'&&!file.name.toLowerCase().endsWith('.pdf'))return await recognize(file);
  const pdf=await import('./vendor/pdf.min.mjs');
  pdf.GlobalWorkerOptions.workerSrc=new URL('pdf.worker.min.mjs',vendor).href;
  documentTask=pdf.getDocument({data:await file.arrayBuffer(),isEvalSupported:false});
  const doc=await documentTask.promise;
  if(doc.numPages>12)throw Error('Split the PDF into files of at most 12 pages.');
  const parts=[];
  for(let n=1;n<=doc.numPages;n++){
   report('Reading page '+n+' of '+doc.numPages);
   const page=await doc.getPage(n);
   const text=(await page.getTextContent()).items.map(i=>i.str+(i.hasEOL?'\n':' ')).join('');
   if(text.trim()){parts.push(text);continue;}
   const size=page.getViewport({scale:1});
   const viewport=page.getViewport({scale:Math.min(2.2,2400/Math.max(size.width,size.height))});
   const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
   await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
   parts.push(await recognize(canvas));page.cleanup();
  }
  return parts.join('\n\n');
 }finally{if(worker)await worker.terminate();if(documentTask)await documentTask.destroy();}
}
