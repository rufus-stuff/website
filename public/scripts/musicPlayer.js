const musicPlayer = {
  player: {},
  previewer: null,

  init : () => {
    document.querySelectorAll("table.tracklist tr").forEach(track => {
      const cover = track.dataset.cover;
      const slug = track.dataset.link;

      if (cover) {
        track.addEventListener("mouseenter", (e) => {
          musicPlayer.preview(e, track, cover)
        });
      }
      if (slug) {
        track.addEventListener("click", (e) => {
          e.preventDefault();
          musicPlayer.play(slug)
        })
      }
    });
    musicPlayer.previewer = document.getElementById('coverPreviewer');
    musicPlayer.player.app = document.getElementById('app-player');
    musicPlayer.player.iframe = document.getElementById('player-iframe');
  },

  play (slug) {
    musicPlayer.player.iframe.src = `https://www.youtube-nocookie.com/embed/${slug}?autoplay=1&modestbranding=1&rel=0&playsinline=1`
  },

  preview : (e, row, cover) => {
    musicPlayer.previewer.src = `resources/albumArt/${cover}`;
    musicPlayer.previewer.style.top = `${e.clientY}px`;
    musicPlayer.previewer.style.left = `${e.clientX}px`;
    musicPlayer.previewer.style.visibility = `visible`;

    const onMove = (ev) => {
      musicPlayer.previewer.style.top = `${ev.clientY}px`;
      musicPlayer.previewer.style.left = `${ev.clientX}px`;
    }
    const onStop = () => {
      window.removeEventListener('mousemove', onMove);
      row.removeEventListener('mouseleave', onStop);
      musicPlayer.previewer.style.visibility = `hidden`;
    }

    window.addEventListener('mousemove', onMove);
    row.addEventListener('mouseleave', (row) => onStop(row));
  }
}

document.addEventListener("DOMContentLoaded", musicPlayer.init);