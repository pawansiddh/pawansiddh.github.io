/* Nestlyra Focus v39 — live SVG dolls and polished sign-in interactions. */
(() => {
  'use strict';
  const colors=[['#9d385e','#ef8e68'],['#2875b7','#82d2f2'],['#da8b32','#f6c75e'],['#3e9b73','#8bd4a8'],['#7441a8','#c497e5'],['#d94d74','#f5a1b8'],['#2868a5','#70bce8']];
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const dollSvg=(index,[base,accent])=>`<svg viewBox="0 0 240 350" role="img" aria-label="Interactive Nestlyra focus doll ${index+1}">
    <defs><linearGradient id="dress${index}" x1="35" y1="42" x2="206" y2="319" gradientUnits="userSpaceOnUse"><stop stop-color="${accent}"/><stop offset=".38" stop-color="${base}"/><stop offset="1" stop-color="${base}"/></linearGradient><linearGradient id="face${index}" x1="85" y1="90" x2="153" y2="170"><stop stop-color="#fff6e8"/><stop offset="1" stop-color="#edc5a7"/></linearGradient></defs>
    <path class="shell" d="M120 18C72 18 47 55 47 100c0 27 8 49 18 67-26 33-39 72-39 113 0 36 31 53 94 53s94-17 94-53c0-41-13-80-39-113 10-18 18-40 18-67 0-45-25-82-73-82Z" fill="url(#dress${index})" stroke="#fff" stroke-opacity=".72" stroke-width="5"/>
    <path d="M57 112c12-42 35-69 63-69s51 27 63 69c-22-13-43-20-63-20s-41 7-63 20Z" fill="${base}" opacity=".95"/>
    <ellipse cx="120" cy="130" rx="48" ry="45" fill="url(#face${index})" stroke="#fff4e5" stroke-width="3"/>
    <path d="M78 112c17-27 67-34 87 3-24-13-51-14-87-3Z" fill="#5a3428" opacity=".92"/>
    <g class="eye-open" fill="#fff" stroke="#472f36" stroke-width="2"><ellipse cx="102" cy="132" rx="11" ry="13"/><ellipse cx="138" cy="132" rx="11" ry="13"/></g>
    <g class="eye-open pupil" fill="#272037"><circle cx="103" cy="134" r="5"/><circle cx="139" cy="134" r="5"/><circle cx="101" cy="131" r="1.5" fill="#fff"/><circle cx="137" cy="131" r="1.5" fill="#fff"/></g>
    <g class="eyelid" fill="none" stroke="#573438" stroke-width="4" stroke-linecap="round"><path d="M91 134q11 9 22 0"/><path d="M127 134q11 9 22 0"/></g>
    <path d="M111 154q9 8 18 0" fill="none" stroke="#a74f59" stroke-width="3" stroke-linecap="round"/>
    <circle cx="87" cy="152" r="8" fill="#eb8e95" opacity=".28"/><circle cx="153" cy="152" r="8" fill="#eb8e95" opacity=".28"/>
    <path d="M64 221c35-29 77-29 112 0" fill="none" stroke="#fff" stroke-opacity=".32" stroke-width="5"/>
    <g fill="${accent}" stroke="#fff" stroke-opacity=".7" stroke-width="2"><circle cx="120" cy="230" r="13"/><circle cx="120" cy="205" r="7"/><circle cx="96" cy="239" r="7"/><circle cx="144" cy="239" r="7"/></g>
    <g fill="#fff" opacity=".38"><circle cx="75" cy="255" r="5"/><circle cx="168" cy="274" r="4"/><circle cx="94" cy="291" r="4"/><circle cx="145" cy="304" r="5"/></g>
    <g class="doll-arm left-arm"><path d="M69 207Q46 222 48 250" fill="none" stroke="${accent}" stroke-width="17" stroke-linecap="round"/><circle cx="48" cy="252" r="11" fill="url(#face${index})"/><path d="M43 251h10" stroke="#b97665" stroke-width="2" stroke-linecap="round"/></g>
    <g class="doll-arm right-arm"><path d="M171 207Q194 222 196 250" fill="none" stroke="${accent}" stroke-width="17" stroke-linecap="round"/><circle cx="196" cy="252" r="11" fill="url(#face${index})"/><path d="M191 251h13" stroke="#b97665" stroke-width="2" stroke-linecap="round"/><path d="M203 248l9-5" stroke="#b97665" stroke-width="3" stroke-linecap="round"/></g>
  </svg>`;

  function setLiveState(stage,mode){
    stage.dataset.dollState=mode;
    const copy={point:['Following your focus','Every character responds to your cursor.'],watch:['Focus mode','The Nestlyra family is cheering while you type.'],idle:['Privacy pause','Hands up, eyes covered—your password stays yours.']}[mode];
    const title=document.querySelector('#dollStateTitle'),text=document.querySelector('#dollStateText');
    if(title)title.textContent=copy[0];if(text)text.textContent=copy[1];
  }
  function setupLiveDolls(){
    const stage=document.querySelector('.doll-stage'),stack=document.querySelector('#liveDollStack'),form=document.querySelector('#loginForm');
    if(!stage||!stack||!form)return;
    stack.innerHTML=colors.map((palette,index)=>`<div class="live-doll" style="--doll-index:${index}">${dollSvg(index,palette)}</div>`).join('');
    const dolls=[...stack.querySelectorAll('.live-doll')],fields=[...form.querySelectorAll('input')];let idleTimer;
    const point=event=>{
      if(fields.includes(document.activeElement))return;
      setLiveState(stage,'point');
      dolls.forEach((doll,index)=>{const r=doll.getBoundingClientRect(),dx=event.clientX-r.left-r.width/2,dy=event.clientY-r.top-r.height*.42,angle=Math.atan2(dy,dx)*180/Math.PI-44,scale=1-index*.055;doll.style.setProperty('--eye-x',`${clamp(dx/r.width*7,-4.5,4.5)}px`);doll.style.setProperty('--eye-y',`${clamp(dy/r.height*9,-3.5,3.5)}px`);doll.style.setProperty('--point-angle',`${clamp(angle,-128,42)}deg`);doll.style.setProperty('--body-tilt',`${clamp(dx/window.innerWidth*8,-3.5,3.5)*scale}deg`);doll.style.setProperty('--body-shift',`${clamp(dx/window.innerWidth*7,-4,4)*scale}px`)})
    };
    const watch=()=>{clearTimeout(idleTimer);setLiveState(stage,'watch');dolls.forEach(d=>{d.style.setProperty('--eye-x','3px');d.style.setProperty('--eye-y','2px')});idleTimer=setTimeout(()=>setLiveState(stage,'idle'),1450)};
    document.addEventListener('pointermove',point,{passive:true});
    fields.forEach(field=>{field.addEventListener('pointerenter',watch);field.addEventListener('focus',watch);field.addEventListener('input',watch);field.addEventListener('blur',()=>setTimeout(()=>setLiveState(stage,'point'),180))});
    setLiveState(stage,'point');
    const toggle=document.querySelector('#loginPasswordToggle'),password=document.querySelector('#loginPin');
    if(toggle&&password)toggle.addEventListener('click',()=>{password.type=password.type==='password'?'text':'password';toggle.textContent=password.type==='password'?'◉':'◌';toggle.setAttribute('aria-label',password.type==='password'?'Show password':'Hide password');watch()});
  }
  document.addEventListener('DOMContentLoaded',setupLiveDolls);
})();
