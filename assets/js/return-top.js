/**
 * 返回顶部
 */
$().ready(function(){
	$(window).on('scroll', function() {
		var st = $(document).scrollTop();
		if (st > 100) {
			$('.return-top').fadeIn(function() {
				$(this).removeClass('dn');
			});
		} else {
			$('.return-top').fadeOut(function() {
				$(this).addClass('dn');
			});
		}
	});

	$('.return-top .go').on('click', function() {
		$('html,body').animate({
			'scrollTop' : 0
		}, 500);
	});
})