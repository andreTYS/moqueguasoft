// Oculta el spinner de carga sin depender de jQuery, para que nunca se quede
// bloqueando la página si algún script externo falla en cargar.
(function () {
    setTimeout(function () {
        var el = document.getElementById('spinner');
        if (el) el.classList.remove('show');
    }, 300);
})();

(function ($) {
    "use strict";

    if (!$) return;

    // Sticky navbar shadow on scroll
    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
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

    // WOW.js animations
    if (window.WOW) {
        new WOW().init();
    }

    // Owl carousel (team / testimonial)
    if ($.fn.owlCarousel) {
        $('.testimonial-carousel').owlCarousel({
            autoplay: true,
            smartSpeed: 1000,
            items: 1,
            dots: true,
            loop: true,
            margin: 25,
            responsive: {
                0: { items: 1 },
                768: { items: 2 }
            }
        });

        $('.team-carousel').owlCarousel({
            autoplay: true,
            smartSpeed: 1000,
            items: 1,
            dots: true,
            loop: true,
            margin: 25,
            responsive: {
                0: { items: 1 },
                576: { items: 2 },
                992: { items: 4 }
            }
        });
    }

    // Animated counters (waypoints)
    if ($.fn.waypoint) {
        $('.counter-value').each(function () {
            var $this = $(this);
            $this.waypoint(function () {
                var target = parseInt($this.attr('data-count') || $this.text(), 10) || 0;
                $({ Counter: 0 }).animate({ Counter: target }, {
                    duration: 2000,
                    easing: 'swing',
                    step: function () {
                        $this.text(Math.ceil(this.Counter));
                    },
                    complete: function () {
                        $this.text(target);
                    }
                });
            }, { offset: '90%' });
        });
    }
})(window.jQuery);
