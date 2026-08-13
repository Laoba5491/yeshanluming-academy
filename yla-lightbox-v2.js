(() => {
  let overlay;
  let image;
  let stage = 'closed';
  let savedHtmlOverflow = '';
  let savedBodyOverflow = '';

  const eligible = (target) =>
    target && target.closest &&
    target.closest('img.article-hero, .article-illustration img');

  function ensureStyles() {
    if (document.getElementById('yla-lightbox-v2-styles')) return;
    const style = document.createElement('style');
    style.id = 'yla-lightbox-v2-styles';
    style.textContent = `
      .yla-v2-lightbox{position:fixed!important;inset:0!important;z-index:2147483647!important;display:none!important;align-items:center!important;justify-content:center!important;box-sizing:border-box!important;padding:24px!important;overflow:hidden!important;background:rgba(0,0,0,.9)!important}
      .yla-v2-lightbox.open{display:flex!important}
      .yla-v2-lightbox img{display:block!important;width:auto!important;height:auto!important;max-width:min(1200px,96vw)!important;max-height:92vh!important;object-fit:contain!important;cursor:zoom-in!important}
      .yla-v2-lightbox.open.original{display:block!important;padding:24px!important;overflow:auto!important}
      .yla-v2-lightbox.original img{width:auto!important;height:auto!important;max-width:none!important;max-height:none!important;margin:0 auto!important;object-fit:none!important;cursor:zoom-out!important}
    `;
    document.head.appendChild(style);
  }

  function ensureOverlay() {
    if (overlay) return;
    ensureStyles();
    overlay = document.createElement('div');
    overlay.className = 'yla-v2-lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    image = document.createElement('img');
    image.alt = '';
    overlay.appendChild(image);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (event) => {
      event.preventDefault();
      if (event.target !== image) {
        close();
        return;
      }
      if (stage === 'large') {
        showOriginal();
      } else if (stage === 'original') {
        close();
      }
    });
  }

  function open(source) {
    if (!source) return;
    ensureOverlay();
    savedHtmlOverflow = document.documentElement.style.overflow;
    savedBodyOverflow = document.body.style.overflow;
    image.src = source.dataset.fullSrc || source.currentSrc || source.src;
    image.alt = source.alt || '';
    overlay.classList.remove('original');
    overlay.classList.add('open');
    overlay.scrollTop = 0;
    overlay.scrollLeft = 0;
    overlay.setAttribute('aria-hidden', 'false');
    stage = 'large';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  function showOriginal() {
    if (!overlay || !image) return;
    stage = 'original';
    overlay.classList.add('original');
    overlay.scrollTop = 0;
    overlay.scrollLeft = Math.max(0, (image.naturalWidth - overlay.clientWidth) / 2);
  }

  function close() {
    if (overlay) {
      overlay.classList.remove('open', 'original');
      overlay.setAttribute('aria-hidden', 'true');
      overlay.scrollTop = 0;
      overlay.scrollLeft = 0;
    }
    if (image) {
      image.removeAttribute('src');
      image.alt = '';
    }
    stage = 'closed';
    document.documentElement.style.overflow = savedHtmlOverflow;
    document.body.style.overflow = savedBodyOverflow;
  }

  document.addEventListener('click', (event) => {
    const target = eligible(event.target);
    if (!target || (overlay && overlay.contains(target))) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    open(target);
  }, true);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
  window.addEventListener('pagehide', close);
  window.addEventListener('pageshow', close);

  document.addEventListener('DOMContentLoaded', () => {
    ensureStyles();
    window.openYlaLightbox = open;
    window.closeYlaLightbox = close;
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  });
})();
