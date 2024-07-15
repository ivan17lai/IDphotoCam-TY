document.addEventListener('DOMContentLoaded', function () {
  const homeButton = document.getElementById('home-page-bt');
  const shotButton = document.getElementById('shot-page-bt');

  const homePage = document.getElementById('home-page');
  const shotPage = document.getElementById('shot-page');

  homeButton.addEventListener('click', function () {
    showPage(homePage);
  });

  shotButton.addEventListener('click', function () {
    showPage(shotPage);
  });

  function showPage(activePage) {
    const pages = document.querySelectorAll('.columns');
    pages.forEach(page => {
      page.style.display = 'none';
    });
    activePage.style.display = 'block';
  }
});
