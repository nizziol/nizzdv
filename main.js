  const audio = document.getElementById('audio');
  const playPauseBtn = document.getElementById('playPause');
  const seekBar = document.getElementById('seekBar');
  const volumeBar = document.getElementById('volumeBar');
  const startTime = document.getElementById('startTime');
  const endTime = document.getElementById('endTime');
  const introScreen = document.getElementById('introScreen');
  const container = document.querySelector('.container');

  audio.volume = 0.1;
  audio.addEventListener('loadedmetadata', () => {
    seekBar.max = audio.duration;
    endTime.textContent = formatTime(audio.duration);
  });
  audio.addEventListener('timeupdate', () => {
    seekBar.value = audio.currentTime;
    startTime.textContent = formatTime(audio.currentTime);
  });
  seekBar.addEventListener('input', () => {
    audio.currentTime = seekBar.value;
  });
  volumeBar.addEventListener('input', () => {
    audio.volume = volumeBar.value;
  });
  playPauseBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
      audio.pause();
      playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
});
    window.addEventListener('DOMContentLoaded', () => {

introScreen.addEventListener("click", () => {
  introScreen.classList.add("hide");
  setTimeout(() => {
    introScreen.style.display = "none";
    container.classList.remove("hidden");
    container.classList.add("show");
    audio.play().then(() => {
      playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }).catch(err => {
      console.log("Autoplay blocked:", err);
    });
  }, 300);
});
      window.addEventListener('click', () => {
        introScreen.style.opacity = '0';
        introScreen.style.pointerEvents = 'none';

        setTimeout(() => {
          introScreen.style.display = 'none';
          container.classList.remove('hidden');
          container.classList.add('show');
        }, 500);
      }, { once: true });
});

const card = document.querySelector('.container hidden');

card.addEventListener('mousemove', (e) => {
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left; // pozycja kursora względem elementu
  const y = e.clientY - rect.top;

  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const rotateX = ((y - centerY) / centerY) * 10; // do 10 stopni
  const rotateY = ((x - centerX) / centerX) * -10;

  card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
});

card.addEventListener('mouseleave', () => {
  card.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`;
});
fetch('https://api.countapi.xyz/update/nizzdv.pl/main/?amount=1')
  .then(res => res.json())
  .then(data => {
    document.getElementById('visitCount').textContent = data.value;
  });
