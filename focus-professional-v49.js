/* TULSHII Focus v49 — audited shell behavior and compatibility repairs. */
(()=>{
  if(window.__TULSHII_FOCUS_V49__)return;
  window.__TULSHII_FOCUS_V49__=true;
  const q=(selector,root=document)=>root.querySelector(selector);
  const all=(selector,root=document)=>[...root.querySelectorAll(selector)];

  function mountTulshiiBrand(){
    const brand=q('.sidebar>.focus-brand');if(!brand)return;
    brand.setAttribute('aria-label','TULSHII Focus');brand.title='TULSHII | FOCUS';
    const copy=q('.focus-brand-copy',brand);
    if(copy&&!q('.tulshii-wordmark',copy))copy.innerHTML='<span class="tulshii-wordmark" role="img" aria-label="TULSHII"><b>TULSH</b><span class="tulshii-ii" aria-hidden="true"><i></i><i></i></span></span><i class="focus-brand-divider">|</i><small>FOCUS</small>';
    const mark=q('.focus-brand-mark',brand);if(mark)mark.src='tulshii-mark.svg';
  }

  function showEveryEnabledSection(){
    const navigation=q('#nav');if(!navigation)return;
    all('.nav-entry',navigation).forEach(entry=>{
      entry.classList.remove('focus-nav-overflow');
      if(!['settings','help'].includes(entry.dataset.navEntry))entry.style.removeProperty('display');
    });
  }

  function mountMessagesInTopbar(){
    const button=q('#floatingMessages'),notification=q('#notifBtn'),actions=q('.top-actions');
    if(!button||!notification||!actions)return;
    button.classList.add('topbar-message');button.title='Messages';
    button.setAttribute('aria-label','Open messages');
    if(button.parentElement!==actions)actions.insertBefore(button,notification);
  }

  function repairSettings(){
    all('[data-setting-category="data"]').forEach(card=>card.classList.remove('module-disabled-setting'));
    const dataButton=q('[data-setting-nav="data"]');
    if(dataButton&&!q('[data-setting-category="data"]'))dataButton.hidden=true;
  }

  function removeRepeatedBranding(){
    all('#app .product-credit,#app .parent-product-credit').forEach(node=>node.remove());
    all('#view .eyebrow').filter(node=>/^(?:TULSHII|PAVENRO|PAWANRO|NESTLYRA)\s+FOCUS$/i.test(node.textContent.trim())).forEach(node=>node.remove());
  }

  function updateBrowserColor(){
    const meta=q('meta[name="theme-color"]'),accent=getComputedStyle(document.body).getPropertyValue('--accent').trim();
    if(meta&&accent)meta.content=accent;
  }

  function sync(){mountTulshiiBrand();showEveryEnabledSection();mountMessagesInTopbar();repairSettings();removeRepeatedBranding();updateBrowserColor()}

  const priorRender=window.render;
  window.render=()=>{priorRender();sync()};
  try{render=window.render}catch{}
  const priorApplyTheme=window.applyTheme;
  window.applyTheme=(...args)=>{const result=priorApplyTheme?.(...args);queueMicrotask(updateBrowserColor);return result};
  try{applyTheme=window.applyTheme}catch{}

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(sync,0),{once:true});else setTimeout(sync,0);
  window.TULSHII_FOCUS_AUDIT={version:'49',refresh:sync};
})();
