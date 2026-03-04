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

  // Load images from JSON, then initialize galleries
  loadImagesFromJSON()
    .then(function() {
      initProductGalleries();
    })
    .catch(function(err) {
      console.error('Failed to load images:', err);
      initProductGalleries(); // still init with whatever is in HTML
    });

  // Load pricelist from JSON (malirske-prace page)
  if (document.getElementById('price-grid')) {
    loadPricelistFromJSON();
  }

  // Initialize reference page carousels
  initRefCarousels();

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

function loadImagesFromJSON() {
  return fetch('/api/images')
    .then(function(response) { return response.json(); })
    .then(function(data) {
      var handledCategories = {};

      $('.product-card__image-wrap[data-category]').each(function() {
        var $wrap = $(this);
        var category = $wrap.data('category');
        handledCategories[category] = true;
        var catData = data.categories[category];
        if (!catData) return;

        // Update the product card title from API
        var $card = $wrap.closest('.product-card');
        var $name = $card.find('.product-card__name');
        if ($name.length && catData.title) {
          $name.text(catData.title);
        }

        // Update the product card description from API
        var $desc = $card.find('.product-card__desc');
        if ($desc.length && catData.description) {
          $desc.text(catData.description);
        }

        // Get images sorted by order
        var sortedImages = catData.imageIds
          .map(function(id) { return data.images[id]; })
          .filter(Boolean)
          .sort(function(a, b) { return a.order - b.order; });

        if (sortedImages.length === 0) return;

        // Find hero image, fallback to first
        var heroId = catData.heroImageId;
        var heroImage = data.images[heroId] || sortedImages[0];

        // Set main image to hero
        var $mainLink = $wrap.find('> a:first-child');
        var $mainImg = $mainLink.find('img');
        var altText = $mainImg.attr('alt') || catData.title;
        $mainLink.attr('href', heroImage.src);
        $mainImg.attr('src', heroImage.src);

        // Build ordered list: hero first, then rest in order
        var orderedImages = [heroImage];
        sortedImages.forEach(function(img) {
          if (img.src !== heroImage.src) orderedImages.push(img);
        });

        // Add remaining images as hidden <a> links after the overlay
        for (var i = 1; i < orderedImages.length; i++) {
          $wrap.append('<a href="' + orderedImages[i].src + '" alt="' + altText + '"></a>');
        }
      });

      // Create dynamic cards for categories not in the Pug template
      var $dynamicContainer = $('#dynamic-products');
      if (!$dynamicContainer.length) return;

      var dynamicIndex = 0;
      Object.keys(data.categories).forEach(function(slug) {
        if (handledCategories[slug]) return;
        var catData = data.categories[slug];
        if (!catData || !catData.imageIds || catData.imageIds.length === 0) return;

        var sortedImages = catData.imageIds
          .map(function(id) { return data.images[id]; })
          .filter(Boolean)
          .sort(function(a, b) { return a.order - b.order; });

        if (sortedImages.length === 0) return;

        var heroId = catData.heroImageId;
        var heroImage = data.images[heroId] || sortedImages[0];
        var title = catData.title || slug;
        var reverseClass = dynamicIndex % 2 === 1 ? ' product-card--reverse' : '';

        // Build gallery links HTML
        var galleryLinks = '';
        var orderedImages = [heroImage];
        sortedImages.forEach(function(img) {
          if (img.src !== heroImage.src) orderedImages.push(img);
        });
        for (var i = 1; i < orderedImages.length; i++) {
          galleryLinks += '<a href="' + orderedImages[i].src + '" alt="' + title + '"></a>';
        }

        var descHtml = catData.description ? '<p class="product-card__desc">' + catData.description + '</p>' : '';

        var cardHtml =
          '<div class="product-divider"><div class="product-divider__line"></div></div>' +
          '<div class="product-card' + reverseClass + '">' +
            '<div class="product-card__image-wrap" data-category="' + slug + '">' +
              '<a href="' + heroImage.src + '"><img src="' + heroImage.src + '" alt="' + title + '"></a>' +
              '<div class="decor-img__overlay"><p class="decor-img__text">Otevřít Galerii</p></div>' +
              galleryLinks +
            '</div>' +
            '<div class="product-card__content">' +
              '<h3 class="product-card__name">' + title + '</h3>' +
              descHtml +
              '<div class="product-card__accent"></div>' +
              '<div class="product-card__icons">' +
                '<a class="product-card__icon-link product-card__gallery-trigger" href="#">' +
                  '<svg width="100%" height="100%" viewBox="0 0 90 69"><use xlink:href="#gallery-icon"></use></svg>' +
                '</a>' +
              '</div>' +
            '</div>' +
          '</div>';

        $dynamicContainer.append(cardHtml);
        dynamicIndex++;
      });

      // Reorder DOM to match categories order from API
      var $section = $('.section-products');
      if (!$section.length) return;

      // Build map of slug -> card element (includes hardcoded + dynamic)
      var cardsBySlug = {};
      $section.find('.product-card').each(function() {
        var $c = $(this);
        var slug = $c.find('.product-card__image-wrap[data-category]').data('category');
        if (slug) cardsBySlug[slug] = $c;
      });

      // Detach all product cards and dividers (but not the header or #dynamic-products)
      $section.find('.product-card, .product-divider').detach();

      // Re-append in API order before #dynamic-products
      var $dynContainer = $section.find('#dynamic-products');
      var cardIndex = 0;
      Object.keys(data.categories).forEach(function(slug) {
        var $c = cardsBySlug[slug];
        if (!$c) return;

        // Add divider between cards (not before first)
        if (cardIndex > 0) {
          $dynContainer.before('<div class="product-divider"><div class="product-divider__line"></div></div>');
        }

        // Update number
        var num = String(cardIndex + 1).padStart(2, '0');
        $c.find('.product-card__number').text(num);

        // Update reverse class (odd-indexed = reverse)
        $c.removeClass('product-card--reverse');
        if (cardIndex % 2 === 1) {
          $c.addClass('product-card--reverse');
        }

        $dynContainer.before($c);
        cardIndex++;
      });
    });
}

function initProductGalleries() {
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
}

function initRefCarousels() {
  var carousels = document.querySelectorAll('.ref-section__carousel');
  if (!carousels.length) return;

  carousels.forEach(function(carousel) {
    var track = carousel.querySelector('.ref-section__carousel-track');
    var prevBtn = carousel.querySelector('.ref-section__carousel-prev');
    var nextBtn = carousel.querySelector('.ref-section__carousel-next');
    if (!track) return;

    function getScrollAmount() {
      var img = track.querySelector('img');
      return img ? img.offsetWidth + 16 : 300;
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
      });
    }

    // Touch swipe
    var touchStartX = 0;
    track.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', function(e) {
      var diff = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(diff) > 50) {
        track.scrollBy({ left: diff < 0 ? getScrollAmount() : -getScrollAmount(), behavior: 'smooth' });
      }
    }, { passive: true });

    // Keyboard navigation when carousel is focused/hovered
    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
      }
    });
  });

  // Featherlight gallery for each carousel section
  if (typeof $.fn.featherlightGallery !== 'undefined') {
    $('.ref-section__carousel-track').each(function() {
      $(this).find('a[data-featherlight]').featherlightGallery({
        previousIcon: '«',
        nextIcon: '»',
        galleryFadeIn: 300,
        openSpeed: 300,
      });
    });
  }
}

function loadPricelistFromJSON() {
  fetch('/api/pricelist')
    .then(function(response) { return response.json(); })
    .then(function(data) {
      var $left = $('#price-grid-left');
      var $right = $('#price-grid-right');
      if (!$left.length || !$right.length) return;

      var categories = (data.categories || []).slice().sort(function(a, b) {
        return a.order - b.order;
      });

      categories.forEach(function(cat) {
        var items = (cat.items || []).slice().sort(function(a, b) {
          return a.order - b.order;
        });

        var itemsHtml = '';
        items.forEach(function(item) {
          var noteHtml = item.note ? '<span class="mp-price-item__note">' + item.note + '</span>' : '';
          itemsHtml +=
            '<div class="mp-price-item">' +
              '<span class="mp-price-item__name">' + item.name + '</span>' +
              noteHtml +
              '<span class="mp-price-item__price">' + item.price + '</span>' +
            '</div>';
        });

        var cardHtml =
          '<div class="mp-price-card">' +
            '<div class="mp-price-header">' +
              '<h3 class="mp-price-header__title">' + cat.title + '</h3>' +
            '</div>' +
            '<div class="mp-price-card__body">' +
              itemsHtml +
            '</div>' +
          '</div>';

        if (cat.column === 'left') {
          $left.append(cardHtml);
        } else {
          $right.append(cardHtml);
        }
      });
    })
    .catch(function(err) {
      console.error('Failed to load pricelist:', err);
    });
}
