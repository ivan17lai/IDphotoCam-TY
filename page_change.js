document.addEventListener('DOMContentLoaded', function () {
    const homeButton = document.getElementById('home-page-bt');
    const shotButton = document.getElementById('shot-page-bt');
    const checkButton = document.getElementById('check-page-bt');
    const rename = document.getElementById('rename-page-bt');
  
    const homePage = document.getElementById('home-page');
    const shotPage = document.getElementById('shot-page');
    const checkPage = document.getElementById('check-page');
    const renamePage = document.getElementById('rename-page');
  
    homeButton.addEventListener('click', function () {
      togglePage(homePage);
    });
  
    shotButton.addEventListener('click', function () {
      togglePage(shotPage);
    });

    checkButton.addEventListener('click', function () {
      togglePage(checkPage);
    });

    rename.addEventListener('click', function () {
      togglePage(renamePage);
    });
  
    function togglePage(activePage) {
    const pages = [
        homePage,
        shotPage,
        checkPage,
        renamePage
    ];

      pages.forEach(page => {
        page.style.display = 'none';
      });
      activePage.style.display = 'flex';
    }
  });
  