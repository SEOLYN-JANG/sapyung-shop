/* =====================================================================
   SAPYUNG (사평) Cafe24 skin — sapyung.js
   의존성 없음(바닐라 JS). 카페24 기본 jQuery/EC 스크립트와 충돌하지 않도록
   전역은 window.SAPYUNG 하나만 사용.
   ===================================================================== */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var num = function (v) { var n = parseInt(String(v == null ? '' : v).replace(/[^0-9]/g, ''), 10); return isNaN(n) ? 0 : n; };
  var fmt = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); };

  /* ---------- 헤더: 드로어 / 검색 / GNB ---------- */
  function header() {
    var drawer = $('#drawer');
    $$('[data-open-drawer]').forEach(function (b) { b.addEventListener('click', function () { drawer.classList.add('open'); document.body.style.overflow = 'hidden'; }); });
    $$('[data-close-drawer]').forEach(function (b) { b.addEventListener('click', function () { drawer.classList.remove('open'); document.body.style.overflow = ''; }); });
    var sl = $('#searchLayer');
    $$('[data-toggle-search]').forEach(function (b) { b.addEventListener('click', function () { sl.classList.toggle('open'); if (sl.classList.contains('open')) { var i = $('input', sl); i && i.focus(); } }); });
    $$('.gnb > li > button').forEach(function (b) { b.addEventListener('click', function () { b.parentNode.classList.toggle('open'); }); });
    /* 현재 분류 표시: GNB / 목록 탭에서 현재 주소와 같은 링크에 on */
    var cur = (location.pathname + location.search).replace(/[?&]page=\d+/, '');
    var curCate = (location.search.match(/cate_no=(\d+)/) || [])[1];
    $$('.gnb > li > a, .cate-tabs a, .m-cats a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var ac = (href.match(/cate_no=(\d+)/) || [])[1];
      var hit = (curCate && ac === curCate) || (!curCate && href.split('#')[0] === cur);
      if (hit) {
        a.classList.add('on');
        if (a.closest('.cate-tabs')) $$('.cate-tabs a').forEach(function (x) { if (x !== a) x.classList.remove('on'); });
        /* 모바일 카테고리 바: 현재 분류가 보이도록 스크롤 */
        if (a.closest('.m-cats')) { var mc = a.closest('.container'); if (mc && a.offsetLeft > mc.clientWidth * .6) mc.scrollLeft = a.offsetLeft - 20; }
      }
    });
    /* 브랜드 스토리 사진: 터치 기기에서는 첫 탭에 제품 사진으로 뒤집고, 두 번째 탭에 링크 이동 */
    $$('.story-pics li').forEach(function (li) {
      li.addEventListener('click', function (e) {
        if (!window.matchMedia('(hover:none)').matches || li.classList.contains('on')) return;
        e.preventDefault();
        $$('.story-pics li').forEach(function (x) { x.classList.toggle('on', x === li); });
      });
    });
    /* 메가메뉴: 분류에 마우스를 올리면 해당 패널 표시 */
    $$('.mega-cats a[data-tab]').forEach(function (a) {
      var show = function () {
        $$('.mega-cats a').forEach(function (x) { x.classList.toggle('on', x === a); });
        $$('.mega-prds').forEach(function (p) { p.classList.toggle('on', p.dataset.panel === a.dataset.tab); });
      };
      a.addEventListener('mouseenter', show); a.addEventListener('focus', show);
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('.gnb')) $$('.gnb > li.open').forEach(function (l) { l.classList.remove('open'); }); });
  }

  /* ---------- 히어로 슬라이더 ---------- */
  function heroSlider() {
    var h = $('.hero-slider'); if (!h) return;
    var slides = $$('.slide', h), dots = $('.hero-dots', h), idx = 0, timer = null;
    var iv = parseInt(h.dataset.interval || '5000', 10);
    h.style.setProperty('--hero-interval', iv + 'ms');
    if (slides.length < 2) { if (dots) dots.style.display = 'none'; var nv = $('.hero-nav', h); if (nv) nv.style.display = 'none'; return; }
    slides.forEach(function (s, i) { var li = document.createElement('li'); li.addEventListener('click', function () { go(i); restart(); }); dots.appendChild(li); });
    var dl = $$('li', dots);
    var go = function (i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('on', k === idx); });
      dl.forEach(function (d, k) { d.classList.remove('on'); if (k === idx) { void d.offsetWidth; d.classList.add('on'); } });
    };
    var start = function () { if (document.documentElement.hasAttribute('data-shot')) return; timer = setInterval(function () { go(idx + 1); }, iv); }; /* ?shot=1 캡처 시 자동 넘김 정지 */
    var stop = function () { clearInterval(timer); };
    var restart = function () { stop(); start(); };
    $('.hero-nav .prev', h).addEventListener('click', function () { go(idx - 1); restart(); });
    $('.hero-nav .next', h).addEventListener('click', function () { go(idx + 1); restart(); });
    h.addEventListener('mouseenter', stop); h.addEventListener('mouseleave', start);
    var sx = 0;
    h.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; stop(); }, { passive: true });
    h.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) go(dx < 0 ? idx + 1 : idx - 1); start(); });
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : restart(); });
    go(0); start();
  }

/* ---------- 가로 트랙 좌우 버튼 ---------- */
  function tracks() {
    $$('.track-wrap').forEach(function (w) {
      var t = $('.track', w); if (!t) return;
      var step = function () { var card = t.firstElementChild; return card ? card.getBoundingClientRect().width + 16 : 300; };
      var next = function () {
        if (t.scrollLeft + t.clientWidth >= t.scrollWidth - 4) t.scrollTo({ left: 0, behavior: 'smooth' });
        else t.scrollBy({ left: step(), behavior: 'smooth' });
      };
      $$('.track-nav button', w).forEach(function (b) {
        b.addEventListener('click', function () { if (b.dataset.dir === 'prev') t.scrollBy({ left: -step(), behavior: 'smooth' }); else next(); restart(); });
      });
      /* 자동 슬라이드 (data-auto="ms") */
      var iv = parseInt(w.dataset.auto || '0', 10), timer = null;
      var start = function () { if (iv > 0) timer = setInterval(next, iv); };
      var stop = function () { clearInterval(timer); };
      var restart = function () { stop(); start(); };
      if (iv > 0) {
        w.addEventListener('mouseenter', stop); w.addEventListener('mouseleave', start);
        t.addEventListener('touchstart', stop, { passive: true }); t.addEventListener('touchend', start);
        document.addEventListener('visibilitychange', function () { document.hidden ? stop() : restart(); });
        start();
      }
    });
  }

  /* ---------- 상품 카드: 소비자가 대비 할인율 계산 + 썸네일 2장 슬라이드(모바일 터치) ---------- */
  function discountRates() {
    $$('.prd').forEach(function (p) {
      var s2 = $('.thumb-slides .s2', p), dots = $$('.thumb-dots i', p);
      if (s2) {
        /* 2번째 이미지가 없거나 깨지면 슬라이드 비활성 */
        s2.addEventListener('error', function () { p.classList.add('single'); var d = $('.thumb-dots', p); if (d) d.style.display = 'none'; s2.remove(); });
        dots.forEach(function (d, i) { d.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); p.classList.toggle('alt', i === 1); }); });
        var sx = 0, th = $('.thumb', p);
        th.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
        th.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 30) p.classList.toggle('alt', dx < 0); });
      }
      var c = num(($('.custom', p) || {}).textContent), s = num(($('.sale', p) || {}).textContent), r = $('.rate', p);
      if (r && c > s && s > 0) r.textContent = Math.round((1 - s / c) * 100) + '%';
      var so = $('.icon img[alt*="품절"], .icon img[alt*="SOLD"]', p);
      if (so) { var sb = $('.soldout-badge', p); if (sb) sb.style.display = 'flex'; }
    });
  }

  /* ---------- 상품 상세 ---------- */
  function detail() {
    var root = $('.detail'); if (!root) return;

    /* 1) 가격: 카페24 detaildesign 테이블(숨김)에서 값 추출 → 커스텀 price-box에 표시 */
    var box = $('.price-box', root);
    if (box) {
      var sale = $('#span_product_price_text') || $('.product_price_css td') ;
      var custom = $('#span_product_price_custom') || $('.product_custom_css td');
      var s = num(sale && sale.textContent), c = num(custom && custom.textContent);
      if (s) { $('.sale', box).innerHTML = fmt(s) + '<em>원</em>'; }
      if (c > s && s) { $('.custom', box).textContent = fmt(c) + '원'; $('.rate', box).textContent = Math.round((1 - s / c) * 100) + '%'; }
      var ml = $('#span_product_mileage_text') || $('.product_mileage_css td');
      if (ml && ml.textContent.trim()) { var m = $('.mileage', box); if (m) m.textContent = '적립금 ' + ml.textContent.trim(); }
    }

    /* 1-1) 배지: 상품 요약설명("a | b | c")을 배지로 분리 */
    var bd = $('.badges[data-summary]', root);
    if (bd) {
      var parts = (bd.getAttribute('data-summary') || '').split('|').map(function (s) { return s.trim(); }).filter(Boolean);
      parts.forEach(function (p) { var sp = document.createElement('span'); sp.textContent = p; bd.insertBefore(sp, bd.firstChild); });
      if (!bd.children.length) bd.style.display = 'none';
    }

    /* 2) 갤러리: 카페24 addimage 목록을 썸네일로, 메인 슬라이드 동기화 */
    var g = $('.gallery', root);
    if (g) {
      var slides = $('.slides', g), thumbs = $$('.thumbs li', g), idx = 0, counter = $('.counter', g);
      var go = function (i) {
        if (!thumbs.length) return;
        idx = (i + thumbs.length) % thumbs.length;
        slides.style.transform = 'translateX(' + (-100 * idx) + '%)';
        thumbs.forEach(function (t, k) { t.classList.toggle('on', k === idx); });
        if (counter) counter.textContent = (idx + 1) + ' / ' + thumbs.length;
      };
      thumbs.forEach(function (t, k) { t.addEventListener('click', function () { go(k); }); });
      var pv = $('.arrow.prev', g), nx = $('.arrow.next', g);
      pv && pv.addEventListener('click', function () { go(idx - 1); });
      nx && nx.addEventListener('click', function () { go(idx + 1); });
      var sx = 0;
      slides.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
      slides.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) go(dx < 0 ? idx + 1 : idx - 1); });
      go(0);
    }

    /* 3) 옵션 아코디언 */
    $$('.opt-acc', root).forEach(function (a) {
      var h = $('.head', a); h && h.addEventListener('click', function () { a.classList.toggle('open'); });
      /* 옵션이 없는 상품(모듈 테이블이 비어있음)이면 아코디언 자체 숨김 */
      var hasOpt = $('.xans-product-option select, .xans-product-option ul li', a);
      if (!hasOpt) a.style.display = 'none';
    });

    /* 4) 탭 스크롤 스파이 */
    var tabs = $$('.dtabs li', root);
    tabs.forEach(function (li) {
      var a = $('a', li);
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href'); var tg = id && $(id);
        if (tg) { e.preventDefault(); var top = tg.getBoundingClientRect().top + window.pageYOffset - 130; window.scrollTo({ top: top, behavior: 'smooth' }); }
      });
    });
    var secs = tabs.map(function (li) { return $($('a', li).getAttribute('href')); });
    window.addEventListener('scroll', function () {
      var y = window.pageYOffset + 160, cur = 0;
      secs.forEach(function (s, i) { if (s && s.offsetTop <= y) cur = i; });
      tabs.forEach(function (li, i) { li.classList.toggle('on', i === cur); });
    }, { passive: true });

    /* 5) 상세 더보기 */
    var mw = $('#prdDetail .more-wrap'), mb = $('#prdDetail .more-btn button');
    if (mw && mb) {
      if (mw.scrollHeight <= 3600) { mw.classList.add('open'); mb.parentNode.style.display = 'none'; }
      mb.addEventListener('click', function () { mw.classList.toggle('open'); mb.querySelector('span').textContent = mw.classList.contains('open') ? '상세정보 접기' : '상세정보 더보기'; });
    }

    /* 6) 접이식 안내 */
    $$('.fold .ttl', root).forEach(function (t) { t.addEventListener('click', function () { t.parentNode.classList.toggle('open'); }); });

    /* 7) 모바일 하단 고정 구매바 → 실제 카페24 버튼 클릭 위임 */
    var sb = $('.sticky-buy');
    if (sb) {
      document.body.classList.add('has-sticky');
      $$('[data-proxy]', sb).forEach(function (b) {
        b.addEventListener('click', function () { var t = $(b.dataset.proxy); if (t) t.click(); });
      });
    }

    /* 7-1) 선택 상품 목록의 금액(숫자만 출력됨)을 천단위 콤마 + 원으로 표시 */
    var tp = $('#totalProducts');
    var fmtPrices = function () {
      $$('#totalProducts td.right > span:first-child, #totalProducts .quantity_price', tp).forEach(function (s) {
        var t = s.textContent.trim();
        if (/^\d+$/.test(t)) s.textContent = fmt(t) + '원';
      });
    };
    if (tp) { fmtPrices(); if ('MutationObserver' in window) new MutationObserver(fmtPrices).observe(tp, { childList: true, subtree: true }); }

    /* 8) 리뷰/상세 탭 카운트: 카페24가 렌더한 게시글 수 추정 */
    var rvRows = $$('#prdReview .board-list tbody tr'), rvCnt = $('.dtabs .cnt-review');
    if (rvCnt && !rvCnt.textContent.trim() && rvRows.length) rvCnt.textContent = rvRows.length;
    var qnRows = $$('#prdQnA .board-list tbody tr'), qnCnt = $('.dtabs .cnt-qna');
    if (qnCnt && !qnCnt.textContent.trim() && qnRows.length) qnCnt.textContent = qnRows.length;

    /* 9) 공유: URL 복사 */
    var cp = $('[data-copy-url]', root);
    cp && cp.addEventListener('click', function () {
      var u = location.href;
      if (navigator.clipboard) navigator.clipboard.writeText(u).then(function () { alert('상품 링크가 복사되었습니다.'); });
      else { var i = document.createElement('input'); i.value = u; document.body.appendChild(i); i.select(); document.execCommand('copy'); i.remove(); alert('상품 링크가 복사되었습니다.'); }
    });
  }

  /* ---------- 신제품/스토리 등 숫자 카운트업(가벼운 연출) ---------- */
  function reveal() {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12 });
    $$('[data-reveal]').forEach(function (el) { io.observe(el); });
  }

  function init() { header(); heroSlider(); tracks(); discountRates(); detail(); reveal(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.SAPYUNG = { init: init, discountRates: discountRates };
})();
