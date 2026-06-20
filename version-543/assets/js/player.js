(function () {
  const video = document.querySelector('.video-player');
  const playButton = document.querySelector('[data-play-button]');
  const status = document.querySelector('[data-player-status]');

  if (!video) {
    return;
  }

  const source = video.dataset.hlsSrc;

  function setStatus(text) {
    if (status) {
      status.textContent = text;
    }
  }

  function hidePlayButton() {
    if (playButton) {
      playButton.classList.add('is-hidden');
    }
  }

  function showPlayButton() {
    if (playButton) {
      playButton.classList.remove('is-hidden');
    }
  }

  function attachSource() {
    if (!source) {
      setStatus('播放源未配置');
      return;
    }

    if (source.indexOf('.m3u8') === -1) {
      video.src = source;
      setStatus('播放源已绑定');
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setStatus('播放源已就绪');
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus('播放源加载失败，请稍后重试');
        }
      });
      window.addEventListener('beforeunload', function () {
        hls.destroy();
      });
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', function () {
        setStatus('播放源已就绪');
      });
      return;
    }

    setStatus('当前浏览器需要 HLS 支持');
  }

  function startPlayback() {
    attachSource();
    const playPromise = video.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(function () {
          hidePlayButton();
          setStatus('正在播放');
        })
        .catch(function () {
          showPlayButton();
          setStatus('点击播放按钮开始播放');
        });
    } else {
      hidePlayButton();
      setStatus('正在播放');
    }
  }

  attachSource();

  if (playButton) {
    playButton.addEventListener('click', startPlayback);
  }

  video.addEventListener('play', function () {
    hidePlayButton();
    setStatus('正在播放');
  });

  video.addEventListener('pause', function () {
    showPlayButton();
    setStatus('已暂停');
  });
})();
