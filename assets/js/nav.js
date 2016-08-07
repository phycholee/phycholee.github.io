$(document).ready(function (a) {
	var $body = document.body;
	var $toggle = document.querySelector('.navbar-toggle');
	var $navbar = document.querySelector('#huxblog_navbar');
	var $collapse = document.querySelector('.navbar-collapse');

	var handleMagic = {
        close: function(){
            $navbar.className = " ";
            // wait until animation end.
            setTimeout(function(){
                // prevent frequently toggle
                if($navbar.className.indexOf('in') < 0) {
                    $collapse.style.height = "0px";
                }
            },400)
        },
        open: function(){
            $collapse.style.height = "auto";
            $navbar.className += " in";
        }
    }
    // Bind Event
    $toggle.addEventListener('click', function(e){
        if ($navbar.className.indexOf('in') > 0) {
            handleMagic.close();
        }else{
            handleMagic.open();
        }
    });
    //点击外部，关闭菜单框
    document.addEventListener('click', function(e){
        if(e.target == $toggle) return;
        if(e.target.className == 'icon-bar') return;
        handleMagic.close();
    });
	
	var b = 1170;
	if (a(window).width() > b) {
		var c = a(".navbar-custom").height();
		a(window).on("scroll", {previousTop: 0}, function () {
			var b = a(window).scrollTop();
			b < this.previousTop ? b > 0 && a(".navbar-custom").hasClass("is-fixed") ? a(".navbar-custom").addClass("is-visible") : a(".navbar-custom").removeClass("is-visible is-fixed") : (a(".navbar-custom").removeClass("is-visible"), b > c && !a(".navbar-custom").hasClass("is-fixed") && a(".navbar-custom").addClass("is-fixed")), this.previousTop = b
		})
	}
});