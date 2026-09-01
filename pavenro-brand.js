/* TULSHII Focus brand owner. Legacy filenames and storage keys remain for compatibility. */
(()=>{
  const replaceBrand=value=>typeof value==='string'
    ?value
      .replace(/PAVENRO|PAWANRO|NESTLYRA/gi,match=>match===match.toUpperCase()?'TULSHII':'Tulshii')
      .replace(/pavenro|pawanro|nestlyra/gi,'Tulshii')
    :value;
  const sourceFor=image=>{
    const source=image.getAttribute('src')||'';
    if(/(?:pavenro|pawanro|nestlyra).*(?:mark|icon)/i.test(source))return 'tulshii-mark.svg';
    if(/(?:pavenro|pawanro|nestlyra).*(?:wordmark|brand|logo)/i.test(source))return 'tulshii-wordmark.svg';
    return '';
  };
  const process=node=>{
    if(node.nodeType===Node.TEXT_NODE){
      if(!/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/i.test(node.parentElement?.tagName||'')){
        const next=replaceBrand(node.nodeValue);
        if(next!==node.nodeValue)node.nodeValue=next;
      }
      return;
    }
    if(node.nodeType!==Node.ELEMENT_NODE||/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/i.test(node.tagName))return;
    if(node instanceof HTMLImageElement){
      const nextSource=sourceFor(node);
      if(nextSource&&node.getAttribute('src')!==nextSource)node.src=nextSource;
    }
    for(const name of ['alt','title','aria-label','placeholder']){
      if(!node.hasAttribute(name))continue;
      const current=node.getAttribute(name),next=replaceBrand(current);
      if(next!==current)node.setAttribute(name,next);
    }
    for(const child of [...node.childNodes])process(child);
  };
  document.title='TULSHII Focus';
  const description=document.querySelector('meta[name="description"]');
  if(description)description.content='TULSHII Focus is a private-first, customizable learning, exam, planning and career workspace.';
  process(document.body);
  new MutationObserver(records=>{
    for(const record of records){
      if(record.type==='characterData')process(record.target);
      if(record.type==='attributes')process(record.target);
      for(const node of record.addedNodes)process(node);
    }
  }).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['src','alt','title','aria-label','placeholder']});
  window.TULSHII_BRAND={name:'TULSHII',product:'Focus',version:'49',process};
  window.PAVENRO_BRAND=window.TULSHII_BRAND;
})();
