const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
if (menuButton && mainNav) {
	menuButton.addEventListener('click', () => {
		const open = mainNav.classList.toggle('is-open');
		menuButton.setAttribute('aria-expanded', String(open));
	});
}

const slides = [...document.querySelectorAll('.hero-slide')];
const dots = [...document.querySelectorAll('.hero-dots button')];
let currentSlide = 0;
let slideTimer;
function showSlide(index) {
	if (!slides.length) return;
	currentSlide = (index + slides.length) % slides.length;
	slides.forEach((slide, i) => slide.classList.toggle('is-active', i === currentSlide));
	dots.forEach((dot, i) => dot.classList.toggle('is-active', i === currentSlide));
}
function restartSlider() {
	clearInterval(slideTimer);
	slideTimer = setInterval(() => showSlide(currentSlide + 1), 6500);
}
document.querySelector('.hero-prev')?.addEventListener('click', () => { showSlide(currentSlide - 1); restartSlider(); });
document.querySelector('.hero-next')?.addEventListener('click', () => { showSlide(currentSlide + 1); restartSlider(); });
dots.forEach((dot, index) => dot.addEventListener('click', () => { showSlide(index); restartSlider(); }));
if (slides.length) restartSlider();

document.querySelector('[data-header]')?.classList.add('is-ready');
