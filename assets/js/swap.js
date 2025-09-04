(function(){
  // Integration notes:
  // - Use AiSwapSwap.getState() to read current form state {from:{chain,token,amount}, to:{chain,token,amount}}
  // - Use AiSwapSwap.setState(partialState) to programmatically update state; icons will auto-sync
  // - Subscribe to changes via window.addEventListener('swap:changed', handler)
  // - Optional callbacks you can set later:
  //     AiSwapSwap.onChanged(state)
  //     AiSwapSwap.onQuote(state) -> implement pricing logic and update toAmountInput
  //     AiSwapSwap.onExecute(state) -> implement real swap execution

  var els = null;
  function query(){
    if (els) return els;
    els = {
      swapButton: document.getElementById('swapButton'),
      fromChain: document.getElementById('fromChainSelect'),
      toChain: document.getElementById('toChainSelect'),
      fromToken: document.getElementById('fromTokenSelect'),
      toToken: document.getElementById('toTokenSelect'),
      fromAmount: document.getElementById('fromAmountInput'),
      toAmount: document.getElementById('toAmountInput'),
      fromIcon: document.getElementById('fromTokenIcon'),
      toIcon: document.getElementById('toTokenIcon'),
      fromLabel: document.getElementById('fromTokenLabel'),
      toLabel: document.getElementById('toTokenLabel')
    };
    return els;
  }

  function syncLabels(){
    var e = query();
    if (e.fromLabel && e.fromToken) e.fromLabel.textContent = e.fromToken.value || '—';
    if (e.toLabel && e.toToken) e.toLabel.textContent = e.toToken.value || '—';
  }

  function getState(){
    var e = query();
    return {
      from: { chain: e.fromChain && e.fromChain.value, token: e.fromToken && e.fromToken.value, amount: e.fromAmount && e.fromAmount.value },
      to:   { chain: e.toChain && e.toChain.value,   token: e.toToken && e.toToken.value,   amount: e.toAmount && e.toAmount.value }
    };
  }

  function updateIcons(){
    var e = query();
    var map = (window.AiSwapSwap && window.AiSwapSwap.tokenIconMap) || {};
    if (e.fromIcon && e.fromToken && map[e.fromToken.value]) e.fromIcon.src = map[e.fromToken.value];
    if (e.toIcon && e.toToken && map[e.toToken.value]) e.toIcon.src = map[e.toToken.value];
  }

  function setState(partial){
    var e = query();
    if (partial && partial.from){
      if (e.fromChain && partial.from.chain != null) e.fromChain.value = partial.from.chain;
      if (e.fromToken && partial.from.token != null) e.fromToken.value = partial.from.token;
      if (e.fromAmount && partial.from.amount != null) e.fromAmount.value = partial.from.amount;
    }
    if (partial && partial.to){
      if (e.toChain && partial.to.chain != null) e.toChain.value = partial.to.chain;
      if (e.toToken && partial.to.token != null) e.toToken.value = partial.to.token;
      if (e.toAmount && partial.to.amount != null) e.toAmount.value = partial.to.amount;
    }
    updateIcons();
    syncLabels();
    emitChanged();
  }

  function emitChanged(){
    var state = getState();
    var ev = new CustomEvent('swap:changed', { detail: state });
    window.dispatchEvent(ev);
    if (window.AiSwapSwap && typeof window.AiSwapSwap.onChanged === 'function'){
      try { window.AiSwapSwap.onChanged(state); } catch(_){}
    }
    if (window.AiSwapSwap && typeof window.AiSwapSwap.onQuote === 'function'){
      // Allow integrators to asynchronously quote and set toAmount
      try { window.AiSwapSwap.onQuote(state); } catch(_){}
    }
  }

  function setupSwapButton(){
    var e = query();
    if (!e.swapButton) return;

    // Keep labels/icons in sync on manual change
    if (e.fromToken) e.fromToken.addEventListener('change', function(){ updateIcons(); syncLabels(); emitChanged(); });
    if (e.toToken) e.toToken.addEventListener('change', function(){ updateIcons(); syncLabels(); emitChanged(); });

    e.swapButton.addEventListener('click', function(){
      e.swapButton.classList.toggle('rotate-icon');

      if (e.fromChain && e.toChain){ var v1 = e.fromChain.value, v2 = e.toChain.value; e.fromChain.value = v2; e.toChain.value = v1; }
      if (e.fromToken && e.toToken){ var t1 = e.fromToken.value, t2 = e.toToken.value; e.fromToken.value = t2; e.toToken.value = t1; }
      if (e.fromAmount && e.toAmount){ var a1 = e.fromAmount.value, a2 = e.toAmount.value; e.fromAmount.value = a2; e.toAmount.value = a1; }
      if (e.fromIcon && e.toIcon){ var s1 = e.fromIcon.src, s2 = e.toIcon.src, al1 = e.fromIcon.alt, al2 = e.toIcon.alt; e.fromIcon.src = s2; e.toIcon.src = s1; e.fromIcon.alt = al2 || ''; e.toIcon.alt = al1 || ''; }

      syncLabels();
      emitChanged();
    });
  }

  // Default token icon mapping (extendable by integrators)
  var tokenIconMap = {
    BNB: 'png/bnb.png',
    USDT: 'png/usdt.png'
  };

  window.AiSwapSwap = Object.assign(window.AiSwapSwap || {}, {
    setupSwapButton: setupSwapButton,
    getState: getState,
    setState: setState,
    tokenIconMap: tokenIconMap,
    onChanged: null,
    onQuote: null,
    onExecute: null
  });
})();
