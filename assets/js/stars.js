(function(){
  function createStars(){
    const starsContainer = document.getElementById('stars');
    if (!starsContainer) return;
    const starsCount = 100;
    for (let i = 0; i < starsCount; i++){
      const star = document.createElement('div');
      star.classList.add('star');
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = Math.random() * 2 + 1;
      const delay = Math.random() * 5;
      star.style.left = `${x}%`;
      star.style.top = `${y}%`;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.animationDelay = `${delay}s`;
      starsContainer.appendChild(star);
    }
  }
  window.AiSwapStars = { createStars };
})();
