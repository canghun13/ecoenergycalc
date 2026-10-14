// Google Analytics
(function() {
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-VJ2TBL22CE';
  document.head.appendChild(script);
})();
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-VJ2TBL22CE');

document.addEventListener('DOMContentLoaded', function () {
  const nav = `
  <header class="site-header">
    <div class="container">
      <a href="/" class="logo">Eco<span>Energy</span>Calc</a>
      <nav class="site-nav">
        <button class="nav-toggle" aria-label="Toggle menu">&#9776;</button>
        <ul class="nav-links">
          <li id="nav-tools"><a href="/tools/">Tools</a></li>
          <li id="nav-compare"><a href="/compare/">Compare</a></li>
          <li id="nav-blog"><a href="/blog/">Blog</a></li>
          <li id="nav-glossary"><a href="/glossary/">Glossary</a></li>
          <li><a href="/about.html">About</a></li>
        </ul>
      </nav>
    </div>
  </header>`;

  const footer = `
  <footer class="site-footer">
    <div class="container">
      <div class="sf-row">
        <a href="/" class="logo">Eco<span>Energy</span>Calc</a>
        <nav class="sf-links" aria-label="Footer">
          <a href="/tools/">Tools</a>
          <a href="/compare/">Compare</a>
          <a href="/blog/">Blog</a>
          <a href="/glossary/">Glossary</a>
          <a href="/about.html">About</a>
          <a href="/contact.html">Contact</a>
          <a href="/privacy.html">Privacy</a>
          <a href="/disclosure.html">Advertising disclosure</a>
        </nav>
      </div>
      <p class="sf-note">&copy; ${new Date().getFullYear()} EcoEnergyCalc.com. Estimates are for information only; check major decisions with a qualified energy or financial professional.</p>
    </div>
  </footer>`;

  document.body.insertAdjacentHTML('afterbegin', nav);
  document.body.insertAdjacentHTML('beforeend', footer);

  const currentPath = window.location.pathname;

  if (currentPath.startsWith('/tools/') || currentPath === '/tools') {
    const toolsLink = document.querySelector('#nav-tools > a');
    if (toolsLink) toolsLink.classList.add('nav-active');
  }

  if (currentPath.startsWith('/compare/') || currentPath === '/compare') {
    const compareLink = document.querySelector('#nav-compare > a');
    if (compareLink) compareLink.classList.add('nav-active');
  }

  if (currentPath.startsWith('/blog/') || currentPath === '/blog') {
    const blogLink = document.querySelector('#nav-blog > a');
    if (blogLink) blogLink.classList.add('nav-active');
  }

  if (currentPath.startsWith('/glossary/') || currentPath === '/glossary') {
    const glossaryLink = document.querySelector('#nav-glossary > a');
    if (glossaryLink) glossaryLink.classList.add('nav-active');
  }

  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }
});

