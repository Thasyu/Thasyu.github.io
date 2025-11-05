// スクロールアニメーション
let lastScrollY = window.scrollY;

function onScrollAnimate() {
  const elements = Array.from(document.querySelectorAll('.fade-in-up'));
  const windowBottom = window.innerHeight + window.scrollY;

  const scrollingDown = window.scrollY > lastScrollY;
  lastScrollY = window.scrollY;

  if (!scrollingDown) {
    elements.reverse();
  }

  elements.forEach(el => {
    if (windowBottom > el.offsetTop + 100) {
      el.classList.add('visible');
    } else {
      el.classList.remove('visible');
    }
  });
}

document.addEventListener('scroll', onScrollAnimate);
window.addEventListener('load', onScrollAnimate);

