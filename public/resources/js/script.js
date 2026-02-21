const headerBckImg = document.querySelector('header .hero');
const headerH1 = document.querySelector('h1');
const headerHeroText = document.querySelector('.header__text');
const prevArrow = document.querySelector('.header__arrows--prev img');
const nextArrow = document.querySelector('.header__arrows--next img');

const thumb = document.querySelectorAll('.ref-gallery__link-js');

const arrowLeft = document.querySelector('.header__arrows--prev');
const arrowRight = document.querySelector('.header__arrows--next');
const imgS = ['url(resources/css/img/home-betonove-sterky-3.jpg)', 'url(resources/css/img/home-malby.jpg)', 'url(resources/css/img/home-natery.jpg)'];
const h1 = ['Dekorační stěrky', 'Malování Interiérů a Exteriérů', 'Nátěry všech povrchů'];
const heroText = [
  "Luxusní interiérové stěrky, originální design i maximální odolnost, neomezené množství dekorů a barevných kombinací, <a class='header__link' href='betonove-sterky.html'>více></a>",
  "Kompletní malířské práce v interiéru a exteriéru ve špičkové kvalitě. Odborná aplikace vnitřních i vnějších barev na stěny, stropy, fasády atd.</a>",
  "Provádíme veškeré natěračské práce a malířské práce na stavbách, v interiérech, bytech, ocelových a dřevěných konstrukcích, budovách, výrobních halách i v terénu.</a>",
];

const arrowImg = [
  'resources/img/arrow-betonove-sterky-2.jpg',
  'resources/img/arrow-malby.png',
  'resources/img/arrow-natery.png',
]

let counter = 1;


if( arrowRight !== null && arrowLeft !== null ) {
  arrowRight.addEventListener('click', function(e) {
    counter++;
    if( counter > imgS.length - 1 ) {
      counter = 0;
    }
    headerBckImg.style.backgroundImage = imgS[ counter ];
    headerH1.innerText = h1[ counter ];
    headerHeroText.innerHTML = heroText[ counter ];

    prevArrow.src = arrowImg[ counter===0 ? 2 : counter-1 ];
    nextArrow.src = arrowImg[ counter===2 ? 0 : counter+1 ];
  })

  arrowLeft.addEventListener('click', function(e) {
    counter--;
    if( counter < 0 ) {
      counter = imgS.length - 1;
    }
    headerBckImg.style.backgroundImage = imgS[ counter ];
    headerH1.innerText = h1[ counter ];
    headerHeroText.innerHTML = heroText[ counter ];

    prevArrow.src = arrowImg[ counter===0 ? 2 : counter-1 ];
    nextArrow.src = arrowImg[ counter===2 ? 0 : counter+1 ];
  })
}

$(document).ready(function() {

  //-----  responsive navigation
  $('.js--nav-icon').click(function(event) {
    var nav = $('.js--nav__list');
    var icon = $('.js--nav-icon i');

    nav.slideToggle(200);

    if( icon.hasClass('ion-navicon-round') ) {
      icon.addClass('ion-close-round');
      icon.removeClass('ion-navicon-round');
    } else {
      icon.addClass('ion-navicon-round');
      icon.removeClass('ion-close-round');
    }
  });

  // Featherlight for reference pages (non-index pages)
  if (!document.getElementById('features')) {
    $('.ref-gallery__link-js').featherlightGallery({
      previousIcon: '«',
      nextIcon: '»',
      galleryFadeIn: 300,
      closeOnEsc: false,
      openSpeed: 300,
    });
  }

  // ---- Inline carousel gallery for product cards ----
  $('.product-card').each(function() {
    var $card = $(this);
    var $imageWrap = $card.find('.product-card__image-wrap');
    var $mainImg = $imageWrap.find('> a:first-child img');
    var $galleryLinks = $imageWrap.find('> a[href]');
    var $trigger = $card.find('.product-card__gallery-trigger');

    if ($galleryLinks.length < 2) return;

    // Collect image URLs and alt texts
    var images = [];
    $galleryLinks.each(function() {
      images.push({
        src: $(this).attr('href'),
        alt: $(this).attr('alt') || $mainImg.attr('alt') || ''
      });
    });

    var currentIndex = 0;

    // Build gallery UI elements
    var $thumbnails = $('<div class="product-card__thumbnails"></div>');
    images.forEach(function(img, i) {
      var activeClass = i === 0 ? ' product-card__thumb--active' : '';
      $thumbnails.append(
        '<img class="product-card__thumb' + activeClass + '" src="' + img.src + '" alt="' + img.alt + '" data-index="' + i + '">'
      );
    });

    var $arrowPrev = $('<button class="product-card__arrow product-card__arrow--prev" aria-label="Previous image"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>');
    var $arrowNext = $('<button class="product-card__arrow product-card__arrow--next" aria-label="Next image"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg></button>');
    var $closeBtn = $('<button class="product-card__gallery-close" aria-label="Close gallery"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>');

    $imageWrap.append($arrowPrev, $arrowNext, $closeBtn);
    $imageWrap.after($thumbnails);

    function showImage(index) {
      currentIndex = index;
      $mainImg.addClass('product-card__img--fading');
      setTimeout(function() {
        $mainImg.attr('src', images[index].src);
        $mainImg.attr('alt', images[index].alt);
        $mainImg.removeClass('product-card__img--fading');
      }, 200);
      $thumbnails.find('.product-card__thumb').removeClass('product-card__thumb--active');
      $thumbnails.find('.product-card__thumb[data-index="' + index + '"]').addClass('product-card__thumb--active');
    }

    function openGallery() {
      // Close any other open galleries first
      $('.product-card--gallery-open').not($card).each(function() {
        $(this).removeClass('product-card--gallery-open');
      });
      $card.addClass('product-card--gallery-open');
      // Scroll card into view
      setTimeout(function() {
        $('html, body').animate({
          scrollTop: $card.offset().top - 20
        }, 400);
      }, 100);
    }

    function closeGallery() {
      $card.removeClass('product-card--gallery-open');
    }

    // Open gallery on image click
    $imageWrap.on('click', function(e) {
      if ($(e.target).closest('.product-card__arrow, .product-card__gallery-close').length) return;
      e.preventDefault();
      if ($card.hasClass('product-card--gallery-open')) return;
      openGallery();
    });

    // Open gallery on gallery icon button click
    $trigger.on('click', function(e) {
      e.preventDefault();
      openGallery();
    });

    // Thumbnail click
    $thumbnails.on('click', '.product-card__thumb', function() {
      showImage(parseInt($(this).data('index'), 10));
    });

    // Arrow navigation
    $arrowPrev.on('click', function(e) {
      e.stopPropagation();
      showImage(currentIndex <= 0 ? images.length - 1 : currentIndex - 1);
    });

    $arrowNext.on('click', function(e) {
      e.stopPropagation();
      showImage(currentIndex >= images.length - 1 ? 0 : currentIndex + 1);
    });

    // Close button
    $closeBtn.on('click', function(e) {
      e.stopPropagation();
      closeGallery();
    });

    // Keyboard navigation (when this card's gallery is open)
    $(document).on('keydown', function(e) {
      if (!$card.hasClass('product-card--gallery-open')) return;
      if (e.key === 'Escape') {
        closeGallery();
      } else if (e.key === 'ArrowLeft') {
        showImage(currentIndex <= 0 ? images.length - 1 : currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        showImage(currentIndex >= images.length - 1 ? 0 : currentIndex + 1);
      }
    });

    // Touch swipe support
    var touchStartX = 0;
    $imageWrap[0].addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    $imageWrap[0].addEventListener('touchend', function(e) {
      if (!$card.hasClass('product-card--gallery-open')) return;
      var diff = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(diff) > 50) {
        if (diff < 0) {
          showImage(currentIndex >= images.length - 1 ? 0 : currentIndex + 1);
        } else {
          showImage(currentIndex <= 0 ? images.length - 1 : currentIndex - 1);
        }
      }
    }, { passive: true });
  });

  $(".scroll-js").click(function (event) {
    var href = $(this).attr('href');
    var currentPage = location.pathname.split('/').pop() || 'index.html';
    var linkPage = href.split('#')[0] || currentPage;

    // Only smooth-scroll if target is on the current page
    if (linkPage === currentPage || linkPage === '') {
      event.preventDefault();
      //calculate destination place
      var dest = 0;
      if ($(this.hash).offset().top > $(document).height() - $(window).height()) {
        dest = $(document).height() - $(window).height();
      } else {
        dest = $(this.hash).offset().top - 50;
      }
      //go to destination
      $('html,body').animate({ scrollTop: dest }, 1000, 'swing');
    }
  });


  // back to top button
  var offset = 250;
  var duration = 300;
  $(window).scroll(function() {
    if($(this).scrollTop() > offset) {
      $('.btn--back-to-top').fadeIn(duration);
    } else {
      $('.btn--back-to-top').fadeOut(duration);
    }
  });

  $( '.btn--back-to-top' ).click(function( event ) {
    event.preventDefault();
    $('html, body').animate({scrollTop: 0}, duration);
    return false;
  });


});
