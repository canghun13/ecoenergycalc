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
          <li><a href="/">Home</a></li>
          <li class="dropdown" id="nav-calculators">
            <a href="#">Calculators ▾</a>
            <ul class="dropdown-menu">
              <li><a href="/tools/home-energy-cost.html">Home Energy Cost</a></li>
              <li><a href="/tools/electric-bill.html">Electric Bill Calculator</a></li>
              <li><a href="/tools/led-vs-incandescent.html">LED vs Incandescent Savings</a></li>
              <li><a href="/tools/insulation-savings.html">Insulation Savings</a></li>
              <li><a href="/tools/heating-vs-cooling.html">Heating vs Cooling Cost</a></li>
              <li><a href="/tools/heating-cost-by-fuel.html">Heating Cost by Fuel Type</a></li>
              <li><a href="/tools/appliance-energy-cost.html">Appliance Energy Cost</a></li>
              <li><a href="/tools/solar-panel-savings.html">Solar Panel Savings</a></li>
              <li><a href="/tools/solar-panel-roi.html">Solar Panel ROI</a></li>
              <li><a href="/tools/wind-turbine.html">Wind Turbine Calculator</a></li>
              <li><a href="/tools/battery-storage.html">Battery Storage Calculator</a></li>
              <li><a href="/tools/carbon-footprint.html">Carbon Footprint</a></li>
              <li><a href="/tools/flight-carbon.html">Flight Carbon Calculator</a></li>
              <li><a href="/tools/car-vs-ev-carbon.html">Car vs EV Carbon</a></li>
              <li><a href="/tools/diet-carbon.html">Diet Carbon Calculator</a></li>
              <li><a href="/tools/home-carbon-footprint.html">Home Carbon Footprint</a></li>
              <li><a href="/tools/water-usage.html">Water Usage Calculator</a></li>
              <li><a href="/tools/rainwater-harvesting.html">Rainwater Harvesting</a></li>
              <li><a href="/tools/tree-planting-offset.html">Tree Planting Offset</a></li>
              <li><a href="/tools/green-home-upgrade-roi.html">Green Home Upgrade ROI</a></li>
              <li><a href="/tools/space-heater-cost-calculator.html">Space Heater Cost Calculator</a></li>
            </ul>
          </li>
          <li id="nav-blog"><a href="/blog/">Blog</a></li>
          <li><a href="/about.html">About</a></li>
        </ul>
      </nav>
    </div>
  </header>`;

  const footer = `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="/" class="logo">Eco<span>Energy</span>Calc</a>
          <p>Free energy & climate calculators — no signup, no fees, instant results.</p>
        </div>
        <div class="footer-links">
          <h4>Calculators</h4>
          <ul>
            <li><a href="/tools/home-energy-cost.html">Home Energy Cost</a></li>
            <li><a href="/tools/electric-bill.html">Electric Bill</a></li>
            <li><a href="/tools/solar-panel-savings.html">Solar Panel Savings</a></li>
            <li><a href="/tools/solar-panel-roi.html">Solar Panel ROI</a></li>
            <li><a href="/tools/carbon-footprint.html">Carbon Footprint</a></li>
            <li><a href="/tools/car-vs-ev-carbon.html">Car vs EV Carbon</a></li>
            <li><a href="/tools/flight-carbon.html">Flight Carbon</a></li>
            <li><a href="/tools/green-home-upgrade-roi.html">Green Home Upgrade ROI</a></li>
          </ul>
        </div>
        <div class="footer-links">
          <h4>Site</h4>
          <ul>
            <li><a href="/blog/">Blog</a></li>
            <li><a href="/about.html">About</a></li>
            <li><a href="/privacy.html">Privacy Policy</a></li>
            <li><a href="/contact.html">Contact</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} EcoEnergyCalc.com &middot; <a href="/privacy.html">Privacy</a> &middot; <a href="/contact.html">Contact</a></p>
        <p class="disclaimer">This site provides estimates for informational purposes only. Always consult a qualified energy or financial professional before making major decisions.</p>
      </div>
    </div>
  </footer>`;

  document.body.insertAdjacentHTML('afterbegin', nav);
  document.body.insertAdjacentHTML('beforeend', footer);

  const currentPath = window.location.pathname;

  if (currentPath === '/' || currentPath === '/index.html') {
    const homeLink = document.querySelector('.nav-links > li > a[href="/"]');
    if (homeLink) homeLink.classList.add('nav-active');
  }

  if (currentPath.startsWith('/tools/')) {
    const calcToggle = document.querySelector('#nav-calculators > a');
    if (calcToggle) calcToggle.classList.add('nav-active');
    document.querySelectorAll('#nav-calculators .dropdown-menu a').forEach(link => {
      if (new URL(link.href, window.location.origin).pathname === currentPath) {
        link.classList.add('nav-active');
      }
    });
  }

  if (currentPath.startsWith('/blog/') || currentPath === '/blog') {
    const blogToggle = document.querySelector('#nav-blog > a');
    if (blogToggle) blogToggle.classList.add('nav-active');
    document.querySelectorAll('#nav-blog .dropdown-menu a').forEach(link => {
      if (new URL(link.href, window.location.origin).pathname === currentPath) {
        link.classList.add('nav-active');
      }
    });
  }

  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  document.querySelectorAll('.dropdown').forEach(drop => {
    const dropToggle = drop.querySelector(':scope > a');
    drop.addEventListener('mouseenter', () => {
      if (window.innerWidth > 768) drop.classList.add('active');
    });
    drop.addEventListener('mouseleave', () => {
      if (window.innerWidth > 768) drop.classList.remove('active');
    });
    if (dropToggle) {
      dropToggle.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          const isActive = drop.classList.contains('active');
          document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
          if (!isActive) drop.classList.add('active');
        }
      });
    }
  });
});
