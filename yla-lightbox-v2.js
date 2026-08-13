(() => {
  let overlay, stage, image, closeButton, hint, mode = 'fit';
  let savedHtmlOverflow = '', savedBodyOverflow = '';
  const eligible = (target) => target && target.closest && target.closest('img.article-hero, .article-illustration img');
  function ensureOverlay() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'yla-global-lightbox-v2';
    overlay.setAttribute('role','dialog'); overlay.setAttribute('aria-modal','true'); overlay.setAttribute('aria-hidden','true');
    stage = document.createElement('div'); stage.className = 'yla-lightbox-v2-stage';
    image = document.createElement('img');
    closeButton = document.createElement('button'); closeButton.className = 'yla-lightbox-v2-close'; closeButton.type = 'button'; closeButton.setAttribute('aria-label','關閉大圖 / Close'); closeButton.textContent = '×';
    hint = document.createElement('div'); hint.className = 'yla-lightbox-v2-hint';
    stage.appendChild(image); overlay.append(stage, closeButton, hint); document.body.appendChild(overlay);
    overlay.addEventListener('click', (event) => { if (event.target === overlay || event.target === stage) close(); });
    image.addEventListener('click', (event) => { event.stopPropagation(); if (mode === 'fit') setMode('actual'); else close(); });
    closeButton.addEventListener('click', close);
  }
  function setMode(nextMode) {
    mode = nextMode; overlay.classList.toggle('fit',mode === 'fit'); overlay.classList.toggle('actual',mode === 'actual');
    hint.textContent = mode === 'fit' ? '再次點擊查看原始像素 · Click again for actual size' : '原始像素模式 · 再次點擊返回正文 · Actual size · Click again to return to article';
    if (mode === 'fit') { overlay.scrollTop = 0; overlay.scrollLeft = 0; }
  }
  function open(source) {
    if (!source) return; ensureOverlay(); savedHtmlOverflow = document.documentElement.style.overflow; savedBodyOverflow = document.body.style.overflow;
    image.src = source.dataset.fullSrc || source.currentSrc || source.src; image.alt = source.alt || ''; setMode('fit'); overlay.classList.add('open'); overlay.setAttribute('aria-hidden','false'); document.documentElement.style.overflow='hidden'; document.body.style.overflow='hidden';
  }
  function close() {
    if (!overlay) return; overlay.classList.remove('open','fit','actual'); overlay.setAttribute('aria-hidden','true'); image.removeAttribute('src'); image.alt=''; document.documentElement.style.overflow=savedHtmlOverflow; document.body.style.overflow=savedBodyOverflow;
  }
  document.addEventListener('click',(event)=>{const target=eligible(event.target);if(!target)return;event.preventDefault();event.stopImmediatePropagation();open(target)},true);
  document.addEventListener('keydown',(event)=>{if(event.key==='Escape')close();if((event.key==='Enter'||event.key===' ')&&overlay&&overlay.classList.contains('open')){event.preventDefault();if(mode==='fit')setMode('actual');else close()}});
  window.addEventListener('pagehide',close); window.addEventListener('pageshow',close);
})();
