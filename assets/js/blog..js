/*!
 * Hux Blog v1.0.0 (http://huxpro.github.io)
 * Copyright 2015 Hux
 */

$(function () {
    $("[data-toggle='tooltip']").tooltip()
}), $(document).ready(function () {
    $("table").wrap("<div class='table-responsive'></div>"), $("table").addClass("table")
}), $(document).ready(function () {
    $('iframe[src*="youtube.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>'), $('iframe[src*="youtube.com"]').addClass("embed-responsive-item"), $('iframe[src*="vimeo.com"]').wrap('<div class="embed-responsive embed-responsive-16by9"></div>'), $('iframe[src*="vimeo.com"]').addClass("embed-responsive-item")
}), jQuery(document).ready(function (a) {
    var b = 1170;
    if (a(window).width() > b) {
        var c = a(".navbar-custom").height();
        a(window).on("scroll", {previousTop: 0}, function () {
            var b = a(window).scrollTop();
            b < this.previousTop ? b > 0 && a(".navbar-custom").hasClass("is-fixed") ? a(".navbar-custom").addClass("is-visible") : a(".navbar-custom").removeClass("is-visible is-fixed") : (a(".navbar-custom").removeClass("is-visible"), b > c && !a(".navbar-custom").hasClass("is-fixed") && a(".navbar-custom").addClass("is-fixed")), this.previousTop = b
        })
    }
});