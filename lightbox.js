/* Shared across all pages: click a photo to view it full-size, hover and
   pause the mouse over a photo to see a small unclipped preview frame. */
(function () {
  'use strict';

  function hasLoadedImage(img) {
    return img.complete && img.naturalWidth > 0;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Full-size photo');
    overlay.innerHTML =
      '<button class="lightbox-close" type="button" aria-label="Close full-size photo">&times;</button>' +
      '<figure class="lightbox-figure">' +
        '<img class="lightbox-img" alt="">' +
        '<figcaption class="lightbox-caption"></figcaption>' +
      '</figure>';
    document.body.appendChild(overlay);

    var overlayImg = overlay.querySelector('.lightbox-img');
    var overlayCaption = overlay.querySelector('.lightbox-caption');
    var closeBtn = overlay.querySelector('.lightbox-close');

    var preview = document.createElement('div');
    preview.className = 'hover-preview';
    preview.setAttribute('aria-hidden', 'true');
    preview.innerHTML = '<img alt="">';
    document.body.appendChild(preview);
    var previewImg = preview.querySelector('img');

    var lastFocused = null;
    var isOpen = false;

    function openLightbox(img) {
      var src = img.currentSrc || img.src;
      if (!src) return;
      lastFocused = document.activeElement;
      overlayImg.src = src;
      overlayImg.alt = img.alt || '';
      overlayCaption.textContent = img.alt || '';
      overlay.classList.add('open');
      document.body.classList.add('lightbox-open');
      isOpen = true;
      hidePreview();
      closeBtn.focus();
    }

    function closeLightbox() {
      if (!isOpen) return;
      overlay.classList.remove('open');
      document.body.classList.remove('lightbox-open');
      isOpen = false;
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeLightbox();
    });
    closeBtn.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) closeLightbox();
    });

    var hoverTimer = null;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

    function hidePreview() {
      preview.classList.remove('visible');
    }

    function positionPreview(x, y) {
      var margin = 16;
      var w = preview.offsetWidth || 220;
      var h = preview.offsetHeight || 220;
      var left = x + margin;
      var top = y + margin;
      if (left + w > window.innerWidth - margin) left = x - w - margin;
      if (top + h > window.innerHeight - margin) top = y - h - margin;
      left = Math.max(margin, left);
      top = Math.max(margin, top);
      preview.style.left = left + 'px';
      preview.style.top = top + 'px';
    }

    function showPreview(img, x, y) {
      var src = img.currentSrc || img.src;
      if (!src) return;
      previewImg.src = src;
      previewImg.alt = img.alt || '';
      positionPreview(x, y);
      preview.classList.add('visible');
    }

    document.querySelectorAll('.photo-slot img[data-photo]').forEach(function (img) {
      img.addEventListener('load', function () {
        img.setAttribute('tabindex', '0');
        img.setAttribute('role', 'button');
        img.setAttribute('aria-label', (img.alt || 'Photo') + ', view full size');
      });
      if (hasLoadedImage(img)) {
        img.setAttribute('tabindex', '0');
        img.setAttribute('role', 'button');
        img.setAttribute('aria-label', (img.alt || 'Photo') + ', view full size');
      }

      img.addEventListener('click', function () {
        if (hasLoadedImage(img)) openLightbox(img);
      });

      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          if (hasLoadedImage(img)) {
            e.preventDefault();
            openLightbox(img);
          }
        }
      });

      if (isCoarsePointer || reducedMotion) return;

      img.addEventListener('mousemove', function (e) {
        if (!hasLoadedImage(img)) return;
        hidePreview();
        clearTimeout(hoverTimer);
        var x = e.clientX;
        var y = e.clientY;
        hoverTimer = setTimeout(function () {
          showPreview(img, x, y);
        }, 350);
      });

      img.addEventListener('mouseleave', function () {
        clearTimeout(hoverTimer);
        hidePreview();
      });
    });
  });
})();
