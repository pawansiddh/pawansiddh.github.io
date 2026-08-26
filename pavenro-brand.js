/* PAVENRO Focus v45 — public-facing rebrand without changing stored-data compatibility keys. */
(()=>{
  const replaceBrand=value=>typeof value==='string'
    ?value.replace(/NESTLYRA/g,'PAVENRO').replace(/Nestlyra/g,'PAVENRO')
    :value;
  const sourceFor=image=>{
    const source=image.getAttribute('src')||'';
    if(/nestlyra-mark-gold/i.test(source)) return 'pavenro-mark.svg';
    if(/nestlyra-(?:wordmark-gold|brand-gold|logo)/i.test(source)) return 'pavenro-lockup.svg';
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
    if(node.nodeType!==Node.ELEMENT_NODE)return;
    if(/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/i.test(node.tagName))return;
    if(node instanceof HTMLImageElement){
      const nextSource=sourceFor(node);
      if(nextSource){
        node.src=nextSource;
        node.dataset.pavenroBrand=nextSource.includes('mark')?'mark':'lockup';
      }
    }
    for(const name of ['alt','title','aria-label','placeholder']){
      if(node.hasAttribute(name)){
        const current=node.getAttribute(name);
        const next=replaceBrand(current);
        if(next!==current)node.setAttribute(name,next);
      }
    }
    for(const child of [...node.childNodes])process(child);
  };
  document.title='PAVENRO Focus';
  const description=document.querySelector('meta[name="description"]');
  if(description)description.content='PAVENRO Focus is a private-first, customizable learning, exam, planning and career workspace.';
  process(document.body);
  new MutationObserver(records=>{
    for(const record of records){
      if(record.type==='characterData')process(record.target);
      if(record.type==='attributes')process(record.target);
      for(const node of record.addedNodes)process(node);
    }
  }).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['src','alt','title','aria-label','placeholder']});
  window.PAVENRO_BRAND={name:'PAVENRO',product:'Focus',version:'45',process};
})();
