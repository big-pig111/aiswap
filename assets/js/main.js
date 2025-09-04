(function(){
  function init(){
    if (window.AiSwapStars && window.AiSwapStars.createStars) window.AiSwapStars.createStars();
    if (window.AiSwapSwap && window.AiSwapSwap.setupSwapButton) window.AiSwapSwap.setupSwapButton();
    if (window.AiSwapWallet && window.AiSwapWallet.initWallet) window.AiSwapWallet.initWallet();
    if (window.AiSwapChains && window.AiSwapChains.init) window.AiSwapChains.init();

    var getBtn = document.getElementById('getWalletBtn');
    if (getBtn) getBtn.addEventListener('click', function(){ window.open('https://metamask.io','_blank'); });
  }
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 0);
  } else {
    window.addEventListener('load', init);
  }
})();
