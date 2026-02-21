const headerBckImg = document.querySelector('header .hero');
const headerH1 = document.querySelector('h1');
const headerHeroText = document.querySelector('.header__text');
const prevArrow = document.querySelector('.header__arrows--prev img');
const nextArrow = document.querySelector('.header__arrows--next img');

const galleryConcrete = document.querySelector('.galleryButton-concrete-js');
const thumbGalleryConcrete = document.querySelector('.thumb-concrete-js');

const galleryAureum = document.querySelector('.galleryButton-aureum-js');
const thumbGalleryAureum = document.querySelector('.thumb-aureum-js');

const galleryEncanto = document.querySelector('.galleryButton-encanto-js');
const thumbGalleryEncanto = document.querySelector('.thumb-encanto-js');

const galleryOttocento = document.querySelector('.galleryButton-ottocento-js');
const thumbGalleryOttocento = document.querySelector('.thumb-ottocento-js');

const galleryRomano = document.querySelector('.galleryButton-romano-js');
const thumbGalleryRomano = document.querySelector('.thumb-romano-js');

const galleryArteviva = document.querySelector('.galleryButton-arteviva-js');
const thumbGalleryArteviva = document.querySelector('.thumb-arteviva-js');

const galleryZero = document.querySelector('.galleryButton-zero-js');
const thumbGalleryZero = document.querySelector('.thumb-zero-js');

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

  // const imagesCounter = $('.ref-gallery__photo').length;
  // console.log(imagesCounter);
  // if(imagesCounter < 5) {
  //   // $('.ref-gallery__photo--img').each(function () {
  //   //   this.style.setProperty('column-count', '3', 'important');
  //   // });
  //   $('.ref-gallery__photo').css('column-count', "3");
  // }


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

  // check if loaded page is index.html
  // console.log(location.pathname.substr(-10, 5));
  if (!document.getElementById('features')) {
    $('.ref-gallery__link-js').featherlightGallery({
      previousIcon: '«',
      nextIcon: '»',
      galleryFadeIn: 300,
      closeOnEsc: false,

      openSpeed: 300,
    });

    // Clicking on the gallery button
    if (galleryAureum) {
      galleryAureum.addEventListener('click', function (e) {
        e.preventDefault();
        $.featherlightGallery($('a.gallery-aureum-js'), {
          previousIcon: '«',
          nextIcon: '»',
          galleryFadeIn: 300,
          closeOnEsc: false,

          openSpeed: 300,
        });
      });
    }

    //clicking on the thumbnail
    if (thumbGalleryAureum) {
      thumbGalleryAureum.addEventListener('click', function (e) {
        e.preventDefault();
        $.featherlightGallery($('a.gallery-aureum-js'), {
          previousIcon: '«',
          nextIcon: '»',
          galleryFadeIn: 300,
          closeOnEsc: false,

          openSpeed: 300,
        });
      });
    }

    if (galleryEncanto) {
      galleryEncanto.addEventListener('click', function (e) {
        e.preventDefault();
        $.featherlightGallery($('a.gallery-encanto-js'), {
          previousIcon: '«',
          nextIcon: '»',
          galleryFadeIn: 300,
          closeOnEsc: false,

          openSpeed: 300,
        });
      });
    }

    //clicking on the thumbnail
    if (thumbGalleryEncanto) {
      thumbGalleryEncanto.addEventListener('click', function (e) {
        e.preventDefault();
        $.featherlightGallery($('a.gallery-encanto-js'), {
          previousIcon: '«',
          nextIcon: '»',
          galleryFadeIn: 300,
          closeOnEsc: false,

          openSpeed: 300,
        });
      });
    }

    if (galleryOttocento) {
      galleryOttocento.addEventListener('click', function (e) {
        e.preventDefault();
        $.featherlightGallery($('a.gallery-ottocento-js'), {
          previousIcon: '«',
          nextIcon: '»',
          galleryFadeIn: 300,
          closeOnEsc: false,

          openSpeed: 300,
        });
      });
    }

    //clicking on the thumbnail
    if (thumbGalleryOttocento) {
      thumbGalleryOttocento.addEventListener('click', function (e) {
        e.preventDefault();
        $.featherlightGallery($('a.gallery-ottocento-js'), {
          previousIcon: '«',
          nextIcon: '»',
          galleryFadeIn: 300,
          closeOnEsc: false,

          openSpeed: 300,
        });
      });
    }

    if (galleryRomano) {
      galleryRomano.addEventListener('click', function (e) {
        e.preventDefault();
        $.featherlightGallery($('a.gallery-romano-js'), {
          previousIcon: '«',
          nextIcon: '»',
          galleryFadeIn: 300,
          closeOnEsc: false,

          openSpeed: 300,
        });
      });
    }

    //clicking on the thumbnail
    if (thumbGalleryRomano) {
      thumbGalleryRomano.addEventListener('click', function (e) {
        e.preventDefault();
        $.featherlightGallery($('a.gallery-romano-js'), {
          previousIcon: '«',
          nextIcon: '»',
          galleryFadeIn: 300,
          closeOnEsc: false,

          openSpeed: 300,
        });
      });
    }

    if (galleryArteviva) {
      galleryArteviva.addEventListener('click', function (e) {
        e.preventDefault();
        $.featherlightGallery($('a.gallery-arteviva-js'), {
          previousIcon: '«',
          nextIcon: '»',
          galleryFadeIn: 300,
          closeOnEsc: false,

          openSpeed: 300,
        });
      });
    }

    //clicking on the thumbnail
    if (thumbGalleryArteviva) {
      thumbGalleryArteviva.addEventListener('click', function (e) {
        e.preventDefault();
        $.featherlightGallery($('a.gallery-arteviva-js'), {
          previousIcon: '«',
          nextIcon: '»',
          galleryFadeIn: 300,
          closeOnEsc: false,

          openSpeed: 300,
        });
      });
    }

    if (galleryZero) {
      galleryZero.addEventListener('click', function (e) {
        e.preventDefault();
        $.featherlightGallery($('a.gallery-zero-js'), {
          previousIcon: '«',
          nextIcon: '»',
          galleryFadeIn: 300,
          closeOnEsc: false,

          openSpeed: 300,
        });
      });
    }

    //clicking on the thumbnail
    if (thumbGalleryZero) {
      thumbGalleryZero.addEventListener('click', function (e) {
        e.preventDefault();
        $.featherlightGallery($('a.gallery-zero-js'), {
          previousIcon: '«',
          nextIcon: '»',
          galleryFadeIn: 300,
          closeOnEsc: false,

          openSpeed: 300,
        });
      });
    }

    if (galleryConcrete) {
      galleryConcrete.addEventListener('click', function (e) {
        e.preventDefault();
        $.featherlightGallery($('a.gallery-concrete-js'), {
          previousIcon: '«',
          nextIcon: '»',
          galleryFadeIn: 300,
          closeOnEsc: false,

          openSpeed: 300,
        });
      });
    }

    //clicking on the thumbnail
    if (thumbGalleryConcrete) {
      thumbGalleryConcrete.addEventListener('click', function (e) {
        e.preventDefault();
        $.featherlightGallery($('a.gallery-concrete-js'), {
          previousIcon: '«',
          nextIcon: '»',
          galleryFadeIn: 300,
          closeOnEsc: false,

          openSpeed: 300,
        });
      });
    }

  }

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





