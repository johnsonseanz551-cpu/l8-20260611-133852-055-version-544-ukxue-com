(function () {
  const players = document.querySelectorAll('[data-player]');

  players.forEach(function (player) {
    player.addEventListener('click', function () {
      player.classList.add('is-active');
    });
  });
}());
