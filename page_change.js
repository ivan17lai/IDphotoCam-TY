document.addEventListener('DOMContentLoaded', function () {
    const homeButton = document.getElementById('home-page-bt');
    const shotButton = document.getElementById('shot-page-bt');
  
    const homePage = document.getElementById('home-page');
    const shotPage = document.getElementById('shot-page');
  
    homeButton.addEventListener('click', function () {
      togglePage(homePage);
    });
  
    shotButton.addEventListener('click', function () {
      togglePage(shotPage);
    });
  
    function togglePage(activePage) {
    const pages = [
        homePage,
        shotPage,
    ];

      pages.forEach(page => {
        page.style.display = 'none';
      });
      activePage.style.display = 'flex';
    }
  });
  