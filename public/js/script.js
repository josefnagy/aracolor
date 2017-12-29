const headerBckImg = document.querySelector('header');
const headerH1 = document.querySelector('h1');
const headerHeroText = document.querySelector('.header__text');
const prevArrow = document.querySelector('.header__arrows--prev img');
const nextArrow = document.querySelector('.header__arrows--next img');

const arrowLeft = document.querySelector('.header__arrows--prev');
const arrowRight = document.querySelector('.header__arrows--next');
const imgS = ['url(css/img/home-betonove-sterky-2.jpg)', 'url(css/img/home-malby.jpg)', 'url(css/img/home-natery.jpg)'];
const h1 = ['Betonové stěrky', 'Malování Interiérů a Exteriérů', 'Nátěry všech povrchů'];
const heroText = [
  "Setřeme Váš beton uplně nejlíp jak to jde, <a class='header__link' href='betonove-sterky.html'>více></a>",
  "Namalujem uplne všechno, <a class='header__link' href='betonove-sterky.html'>více></a>",
  "Natřem vám prdel na bílo, <a class='header__link' href='betonove-sterky.html'>více></a>",
];

const arrowImg = [
  'img/arrow-betonove-sterky.png',
  'img/arrow-malby.png',
  'img/arrow-natery.png',
]

let counter = 0;

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



