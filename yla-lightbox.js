(() => {
  let overlay;
  let image;
  let savedHtmlOverflow = '';
  let savedBodyOverflow = '';

  const eligible = (target) =>
    target && target.closest &&
    target.closest('img.article-hero, .article-illustration img');

  function ensureOverlay() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'yla-global-lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-hidden', 'true');
    image = document.createElement('img');
    image.alt = '';
    overlay.appendChild(image);
    document.body.appendChild(overlay);
    overlay.addEventListener('click', close);
  }

  function open(source) {
    if (!source) return;
    ensureOverlay();
    savedHtmlOverflow = document.documentElement.style.overflow;
    savedBodyOverflow = document.body.style.overflow;
    image.src = source.currentSrc || source.src;
    image.alt = source.alt || '';
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (overlay) {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
    }
    if (image) {
      image.removeAttribute('src');
      image.alt = '';
    }
    document.documentElement.style.overflow = savedHtmlOverflow;
    document.body.style.overflow = savedBodyOverflow;
  }

  document.addEventListener('click', (event) => {
    const target = eligible(event.target);
    if (!target) return;
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
    window.openYlaLightbox = open;
    window.closeYlaLightbox = close;
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  });
})();
