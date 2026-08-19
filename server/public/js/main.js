// Oculta el spinner de carga sin depender de jQuery, para que nunca se quede
// bloqueando la página si algún script externo falla en cargar.
(function () {
    setTimeout(function () {
        var el = document.getElementById('spinner');
        if (el) el.classList.remove('show');
    }, 300);
})();

// Nav: fondo con blur al hacer scroll + menú móvil (vanilla JS, sin jQuery).
(function () {
    var nav = document.getElementById('msNav');
    var toggle = document.getElementById('navToggle');
    var mobile = document.getElementById('navMobile');

    if (nav) {
        var onScroll = function () {
            nav.classList.toggle('is-scrolled', window.scrollY > 12);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }
    if (toggle && mobile) {
        toggle.addEventListener('click', function () {
            mobile.classList.toggle('show');
            var icon = toggle.querySelector('i');
            if (icon) icon.className = mobile.classList.contains('show') ? 'fas fa-xmark' : 'fas fa-bars';
        });
    }
})();

// Hero: si hay más de un slide activo, va alternando título/subtítulo con fundido.
(function () {
    var root = document.getElementById('heroSlides');
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero__slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('#heroDots button'));
    if (slides.length < 2) return;

    var current = 0;
    function show(i) {
        slides.forEach(function (s, idx) {
            s.style.opacity = idx === i ? '1' : '0';
            s.style.position = idx === i ? 'relative' : 'absolute';
            s.style.pointerEvents = idx === i ? 'auto' : 'none';
        });
        dots.forEach(function (d, idx) { d.classList.toggle('active', idx === i); });
        current = i;
    }
    dots.forEach(function (d, idx) {
        d.addEventListener('click', function () { show(idx); restart(); });
    });

    var timer;
    function restart() {
        clearInterval(timer);
        timer = setInterval(function () { show((current + 1) % slides.length); }, 6000);
    }
    show(0);
    restart();
})();

(function ($) {
    "use strict";
    if (!$) return;

    // Back to top
    $(window).scroll(function () {
        if ($(this).scrollTop() > 200) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function (e) {
        e.preventDefault();
        $('html, body').animate({ scrollTop: 0 }, 800, 'easeInOutExpo');
        return false;
    });

    // Contadores animados (waypoints)
    if ($.fn.waypoint) {
        $('.stat__value').each(function () {
            var $this = $(this);
            $this.waypoint(function () {
                var target = parseInt($this.attr('data-count') || $this.text(), 10) || 0;
                $({ Counter: 0 }).animate({ Counter: target }, {
                    duration: 1600,
                    easing: 'swing',
                    step: function () { $this.text(Math.ceil(this.Counter)); },
                    complete: function () { $this.text(target); }
                });
            }, { offset: '90%' });
        });
    }

    // Flechas del carrusel de testimonios (scroll-snap nativo)
    var $row = $('.quote-row');
    if ($row.length) {
        $('.quote-nav [data-dir]').on('click', function () {
            var dir = $(this).data('dir');
            var card = $row.find('.quote-card').first();
            var step = (card.outerWidth() || 360) + 20;
            $row.animate({ scrollLeft: $row.scrollLeft() + (dir === 'next' ? step : -step) }, 400);
        });
    }
})(window.jQuery);
