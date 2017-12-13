const headerBckImg = document.querySelector('header');
const headerH1 = document.querySelector('h1 span');
const headerHeroText = document.querySelector('header p span');

const arrowLeft = document.querySelector('.arrow-left');
const arrowRight = document.querySelector('.arrow-right');
const imgS = ['url(resources/css/img/home-betonove-sterky-2.jpg)', 'url(resources/css/img/home-malby.jpg)', 'url(resources/css/img/home-natery.jpg)'];
const h1 = ['Betonové stěrky', 'Malování Interiérů a Exteriérů', 'Nátěry všech povrchů'];
const heroText = [
  'Setřeme Váš beton uplně nejlíp jak to jde,',
  'Namalujem uplne všechno,',
  'Natřem vám prdel,'];
let counter = 0;


arrowRight.addEventListener('click', function(e) {
  counter++;
  if( counter > imgS.length - 1 ) {
    counter = 0;
  }
  headerBckImg.style.backgroundImage = imgS[ counter ];
  headerH1.innerText = h1[ counter ];
  headerHeroText.innerText = heroText[ counter ];
})

arrowLeft.addEventListener('click', function(e) {
  counter--;
  if( counter < 0 ) {
    counter = imgS.length - 1;
  }
  headerBckImg.style.backgroundImage = imgS[ counter ];
  headerH1.innerText = h1[ counter ];
  headerHeroText.innerText = heroText[ counter ];
})

// $(function() {
//   $('a[href*=#]').on('click', function(e) {
//     e.preventDefault();
//     $('html, body').animate({ scrollTop: $($(this).attr('href')).offset().top}, 500, 'linear');
//   });
// });

$(document).ready(function() {
  var offset = 250;
  var duration = 300;
  $(window).scroll(function() {
    if($(this).scrollTop() > offset) {
      $('.back-to-top').fadeIn(duration);
    } else {
      $('.back-to-top').fadeOut(duration);
    }
  });

  $('.back-to-top').click(function(event) {
    event.preventDefault();
    $('html, body').animate({scrollTop: 0}, duration);
    return false;
  })

});



