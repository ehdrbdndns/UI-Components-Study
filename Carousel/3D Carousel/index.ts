// tsc script.ts --watch
(function () {
  const CARD_LIST = document.getElementById('cardList');
  const NAV_LEFT = document.getElementById('navLeft');
  const NAV_RIGHT = document.getElementById('navRight');
  const CARDS = document.getElementsByClassName('cardContainer');

  const TOTAL_CARD_INDEX = 3; // 0 ~ 2
  const LEFT = 1;
  const RIGHT = -1;
  const CENTER = 0;

  let curDirection = CENTER;
  let curCardIndex = 1;

  // Animation for a moving card
  function animation() {
    if (CARD_LIST) {
      // 1. Move card
      CARD_LIST.style.transform = `translate3d(${curDirection * 91}rem, 0, 0)`;

      // 2. Change card form
      for (let i = 0; i < TOTAL_CARD_INDEX; i++) {
        // init classList
        CARDS[i].classList.remove('cur');
        CARDS[i].classList.remove('left');
        CARDS[i].classList.remove('right');

        // direction = 1 0 -1
        // i = 0 1 2
        if (i === curCardIndex) {
          // add .cur class
          CARDS[i].classList.add('cur');
        } else if (i < curCardIndex) {
          // add .left class
          CARDS[i].classList.add('left');
        } else {
          // add .right class
          CARDS[i].classList.add('right');
        }
      }
    }
  }

  // Set an animation trigger
  function setEventHandler() {
    if (NAV_LEFT && NAV_RIGHT) {
      NAV_LEFT.addEventListener('click', () => {
        if (curDirection <= CENTER) {
          curDirection += LEFT;
          curCardIndex--;
          animation();
        }
      });
      NAV_RIGHT.addEventListener('click', () => {
        if (curDirection >= CENTER) {
          curDirection += RIGHT;
          curCardIndex++;
          animation();
        }
      });
    }
  }

  function init() {
    // init values
    curDirection = CENTER;

    // todo animation
    animation();

    // set event handler
    setEventHandler();

    console.log('start init');
  }

  init();
})();
