const headerBckImg = document.querySelector('header .hero');
const headerH1 = document.querySelector('h1');
const headerHeroText = document.querySelector('.header__text');
const prevArrow = document.querySelector('.header__arrows--prev img');
const nextArrow = document.querySelector('.header__arrows--next img');

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
  "Kompletní malířské práce v interiéru a exteriéru ve špičkové kvalitě. Odborná aplikace vnitřních i vnějších barev na stěny, stropy, fasády atd, <a class='header__link' href='betonove-sterky.html'>více></a>",
  "Natřem vám prdel na bílo, <a class='header__link' href='betonove-sterky.html'>více></a>",
];


const arrowImg = [
  'resources/img/arrow-betonove-sterky-2.jpg',
  'resources/img/arrow-malby.png',
  'resources/img/arrow-natery.png',
]

let counter = 0;

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

  // $(".scrolldown-anim__link").click(function(event){
  //   event.preventDefault();
  // });

  /// responsive navigation
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
  if (location.pathname.substr(-10, 5) !== "index") {
    console.log('qq');
    $('.ref-gallery__link-js').featherlightGallery({
      previousIcon: '«',
      nextIcon: '»',
      galleryFadeIn: 300,
      closeOnEsc: false,

      openSpeed: 300,
    });

    // Clicking on the gallery button
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

    //clicking on the thumbnail
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

    //clicking on the thumbnail
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

    //clicking on the thumbnail
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

    //clicking on the thumbnail
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

    //clicking on the thumbnail
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

    //clicking on the thumbnail
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

  }//----------- end IF


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

  $(".scroll-js").click(function( event ){
    //event.preventDefault();
    //calculate destination place
    var dest=0;
    if ($(this.hash).offset().top > $(document).height()-$(window).height()){
      dest=$(document).height()-$(window).height();
      // console.log(dest);
    } else {
      dest=$(this.hash).offset().top-50;
      // console.log(dest);
    }
    //go to destination
    $('html,body').animate({scrollTop:dest}, 1000,'swing');
  });
});




