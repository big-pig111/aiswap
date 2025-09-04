(function(){
  var chains = [
    { label: 'BNB Chain', value: 'BNB Chain' },
    { label: 'Ethereum', value: 'Ethereum' },
    { label: 'Polygon', value: 'Polygon' },
    { label: 'Avalanche', value: 'Avalanche' },
    { label: 'Arbitrum', value: 'Arbitrum' },
    { label: 'Optimism', value: 'Optimism' },
    { label: 'Scroll', value: 'Scroll' },
    { label: 'Mantle', value: 'Mantle' },
    { label: 'Blast', value: 'Blast' },
    { label: 'zkSync', value: 'zkSync' }
  ];

  var modal, overlay, listEl, inputEl, closeBtn;
  var targetSelect = null;

  function render(filter){
    if (!listEl) return;
    listEl.innerHTML = '';
    var term = (filter || '').toLowerCase();
    chains.filter(function(c){ return !term || c.label.toLowerCase().indexOf(term) !== -1; })
      .forEach(function(c){
        var li = document.createElement('button');
        li.setAttribute('type', 'button');
        li.className = 'w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg text-left';
        li.setAttribute('data-value', c.value);
        li.innerHTML = '<span class="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">' + c.label.charAt(0) + '</span>' +
                       '<span class="text-sm">' + c.label + '</span>';
        li.addEventListener('click', function(){
          if (targetSelect) {
            targetSelect.value = c.value;
            var evt = new Event('change');
            targetSelect.dispatchEvent(evt);
          }
          hide();
        });
        listEl.appendChild(li);
      });
  }

  function show(selectEl){
    targetSelect = selectEl;
    if (!modal) return;
    modal.classList.remove('hidden');
    inputEl.value = '';
    render('');
    setTimeout(function(){ inputEl.focus(); }, 0);
  }

  function hide(){
    if (!modal) return;
    modal.classList.add('hidden');
    targetSelect = null;
  }

  function init(){
    modal = document.getElementById('chainSelectModal');
    if (!modal) return;
    overlay = document.getElementById('chainOverlay');
    listEl = document.getElementById('chainList');
    inputEl = document.getElementById('chainSearch');
    closeBtn = document.getElementById('chainCloseBtn');

    if (overlay) overlay.addEventListener('click', hide);
    if (closeBtn) closeBtn.addEventListener('click', hide);
    if (inputEl) inputEl.addEventListener('input', function(){ render(inputEl.value); });

    ['fromChainSelect', 'toChainSelect'].forEach(function(id){
      var sel = document.getElementById(id);
      if (!sel) return;
      sel.addEventListener('mousedown', function(e){ e.preventDefault(); show(sel); });
      sel.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(sel); } });
    });
  }

  window.AiSwapChains = { init: init, show: show, hide: hide };
})();
