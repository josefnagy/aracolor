const headerBckImg = document.querySelector('header');
const headerH1 = document.querySelector('h1 span');
const headerHeroText = document.querySelector('header p span');

const arrowLeft = document.querySelector('.header__arrows--left');
const arrowRight = document.querySelector('.header__arrows--right');
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

$(document).ready(function() {
  var offset = 250;
  var duration = 300;
  $(window).scroll(function() {
    if($(this).scrollTop() > offset) {
      $('.btn--back-to-top').fadeIn(duration);
    } else {
      $('.btn--back-to-top').fadeOut(duration);
    }
  });

  $('.btn--back-to-top').click(function(event) {
    event.preventDefault();
    $('html, body').animate({scrollTop: 0}, duration);
    return false;
  })

});

$(".scroll-js").click(function(event){
  event.preventDefault();
  //calculate destination place
  var dest=0;
  if($(this.hash).offset().top > $(document).height()-$(window).height()){
    dest=$(document).height()-$(window).height();
    console.log(dest);
  }else{
    dest=$(this.hash).offset().top-50;
    console.log(dest);
  }
  //go to destination
  $('html,body').animate({scrollTop:dest}, 1000,'swing');
});



