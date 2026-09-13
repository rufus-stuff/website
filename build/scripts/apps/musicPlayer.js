const musicPlayer = {
  explorer: {
    app: null,
    previewer: null,

    /**
     * Unloads previous state from the musicPlayer explorer and
     * loads a new playList with artist details
     */
    loadList: (event, listcode) => {
      document.querySelectorAll('.tracklist').forEach((tracklist) => {
        if(tracklist.classList.contains('active')) tracklist.classList.remove('active')
      })
      document.querySelectorAll('.artistProfile').forEach((profile) => {
        if(profile.classList.contains('active')) profile.classList.remove('active')
      })

      musicPlayer.explorer.previewer.src = `resources/albumArt/empty.jpg`

      document.getElementById(`artistTracklist-${listcode}`).classList.add('active')
      document.getElementById(`artistProfile-${listcode}`).classList.add('active')

      event.stopPropagation()
      rwm.window.minimizer(musicPlayer.explorer.app, true)
    },

    preview : (cover) => {
      musicPlayer.explorer.previewer.src = `resources/albumArt/${cover}`;
    }
  },
  player: {
    app: null,
    iframe: null,

    play (slug) {
      musicPlayer.player.iframe.src = `https://www.youtube-nocookie.com/embed/${slug}?autoplay=1&modestbranding=1&rel=0&playsinline=1`
      rwm.window.minimizer(musicPlayer.player.app, true)
    }
  },

  init : () => {
    musicPlayer.explorer.app = document.getElementById('app-explorer')
    musicPlayer.explorer.previewer = document.getElementById('coverPreviewer');
    musicPlayer.player.app = document.getElementById('app-player');
    musicPlayer.player.iframe = document.getElementById('player-iframe');

    document.querySelectorAll("table.tracklist tr").forEach(track => {
      const cover = track.dataset.cover;
      const slug = track.dataset.link;

      if (cover) {
        track.addEventListener("mouseenter", () => {
          musicPlayer.explorer.preview(cover)
        });
      }
      if (slug) {
        track.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          musicPlayer.player.play(slug)
        })
      }
    });
  },
}

document.addEventListener("DOMContentLoaded", musicPlayer.init);