(function(){
  let web3Modal = null;
  let externalProvider = null;
  let ethersProvider = null;
  let selectedAddress = null;

  function shortenAddress(addr){
    return addr ? addr.substring(0, 6) + '...' + addr.substring(addr.length - 4) : '';
  }

  async function ensureBscNetwork(){
    if (!externalProvider || !externalProvider.request) return;
    try {
      await externalProvider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x38' }] });
    } catch (switchError) {
      if (switchError.code === 4902 || (switchError && switchError.message && switchError.message.includes('Unrecognized chain ID'))) {
        try {
          await externalProvider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x38',
              chainName: 'BNB Smart Chain',
              nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
              rpcUrls: ['https://bsc-dataseed.binance.org'],
              blockExplorerUrls: ['https://bscscan.com']
            }]
          });
        } catch(_){}
      }
    }
  }

  function updateButtons(){
    const headerBtn = document.getElementById('connectWalletBtnHeader');
    const mainBtn = document.getElementById('connectWalletBtnMain');
    const text = selectedAddress ? shortenAddress(selectedAddress) : 'Connect Wallet';
    if (headerBtn) headerBtn.innerHTML = '<i class="fa fa-wallet mr-1"></i> ' + text;
    if (mainBtn) mainBtn.textContent = text;
    const ev = new CustomEvent('wallet:update', { detail: { address: selectedAddress } });
    window.dispatchEvent(ev);
  }

  async function connectInjected(){
    if (!window.ethereum) { alert('未检测到浏览器钱包，请先安装 MetaMask。'); return; }
    externalProvider = window.ethereum;
    ethersProvider = new window.ethers.providers.Web3Provider(externalProvider);
    await ethersProvider.send('eth_requestAccounts', []);
    await ensureBscNetwork();
    const signer = ethersProvider.getSigner();
    selectedAddress = await signer.getAddress();
    updateButtons();
  }

  async function connectWalletConnect(){
    const WCProvider = window.WalletConnectProvider && window.WalletConnectProvider.default;
    if (!WCProvider) { alert('WalletConnect 库未加载'); return; }
    const provider = new WCProvider({
      bridge: 'https://bridge.walletconnect.org',
      rpc: { 56: 'https://bsc-dataseed.binance.org' },
      chainId: 56,
      qrcode: true,
      qrcodeModalOptions: { mobileLinks: ['okx','tokenpocket','safepal','bitget','trust'] }
    });
    await provider.enable();
    externalProvider = provider;
    ethersProvider = new window.ethers.providers.Web3Provider(provider);
    const signer = ethersProvider.getSigner();
    selectedAddress = await signer.getAddress();
    updateButtons();
  }

  async function connectCoinbase(){
    const SDK = window.CoinbaseWalletSDK;
    if (!SDK) { alert('未能加载 Coinbase Wallet SDK'); return; }
    const app = new SDK({ appName: 'Orbiter Finance Demo', darkMode: true });
    externalProvider = app.makeWeb3Provider('https://bsc-dataseed.binance.org', 56);
    await externalProvider.enable();
    ethersProvider = new window.ethers.providers.Web3Provider(externalProvider);
    const signer = ethersProvider.getSigner();
    selectedAddress = await signer.getAddress();
    updateButtons();
  }

  async function connectBackpack(){
    const injected = (window.backpack && window.backpack.ethereum)
      || (window.ethereum && (window.ethereum.isBackpack ? window.ethereum : null))
      || (window.ethereum && window.ethereum.providers && Array.isArray(window.ethereum.providers)
            ? window.ethereum.providers.find(function(p){ return p.isBackpack; })
            : null);
    if (injected) {
      externalProvider = injected;
      ethersProvider = new window.ethers.providers.Web3Provider(externalProvider);
      await ethersProvider.send('eth_requestAccounts', []);
      await ensureBscNetwork();
      const signer = ethersProvider.getSigner();
      selectedAddress = await signer.getAddress();
      updateButtons();
      return;
    }
    if (confirm('未检测到 Backpack。是否前往安装?')) {
      window.open('https://www.backpack.app/download', '_blank');
    }
  }

  async function connectOKX(){
    function detectOkxProvider(){
      const providers = [];
      if (window.ethereum) {
        if (Array.isArray(window.ethereum.providers)) {
          providers.push.apply(providers, window.ethereum.providers);
        } else {
          providers.push(window.ethereum);
        }
      }
      if (window.okxwallet) providers.push(window.okxwallet);
      return (providers.find(function(p){
        if (!p) return false;
        if (p.isOkxWallet || p.isOKXWallet) return true;
        var name = p.walletMeta && p.walletMeta.name ? String(p.walletMeta.name).toLowerCase() : '';
        return name.indexOf('okx') !== -1;
      })) || null;
    }
    const injected = detectOkxProvider();
    if (injected) {
      const prov = injected.request ? injected : (injected.ethereum && injected.ethereum.request ? injected.ethereum : injected);
      externalProvider = prov;
      ethersProvider = new window.ethers.providers.Web3Provider(prov);
      if (prov.request) { await prov.request({ method: 'eth_requestAccounts' }); }
      else { await ethersProvider.send('eth_requestAccounts', []); }
      await ensureBscNetwork();
      const signer = ethersProvider.getSigner();
      selectedAddress = await signer.getAddress();
      updateButtons();
      return;
    }
    const goInstall = confirm('未检测到 OKX 浏览器扩展。是否前往安装？\n如果在手机上，请使用 OKX App 打开本站或在“WalletConnect”里扫码。');
    if (goInstall) { window.open('https://www.okx.com/web3/download', '_blank'); }
  }

  async function connectWallet(){
    try {
      if (web3Modal && web3Modal.clearCachedProvider) {
        await web3Modal.clearCachedProvider();
      }
      externalProvider = await web3Modal.connect();
      if (externalProvider && externalProvider.on){
        externalProvider.on('accountsChanged', function(accounts){
          if (accounts && accounts.length > 0) {
            selectedAddress = accounts[0];
            updateButtons();
          }
        });
        externalProvider.on('chainChanged', function(){ });
      }
      ethersProvider = new window.ethers.providers.Web3Provider(externalProvider);
      const signer = ethersProvider.getSigner();
      await ensureBscNetwork();
      selectedAddress = await signer.getAddress();
      updateButtons();
    } catch (err) {
      console.error('Wallet connect failed:', err);
      alert('连接钱包失败，请重试。');
    }
  }

  function openWalletList(){
    const modal = document.getElementById('walletSelectModal');
    if (modal) { modal.classList.remove('hidden'); }
    else { connectWallet(); }
  }

  function closeWalletList(){
    const modal = document.getElementById('walletSelectModal');
    if (modal) modal.classList.add('hidden');
  }

  function initWallet(){
    const providerOptions = {
      walletconnect: {
        package: window.WalletConnectProvider.default,
        options: {
          bridge: 'https://bridge.walletconnect.org',
          rpc: { 1: 'https://cloudflare-eth.com', 56: 'https://bsc-dataseed.binance.org', 137: 'https://polygon-rpc.com' },
          qrcodeModalOptions: { mobileLinks: ['okx','tokenpocket','safepal','bitget','trust'] }
        }
      },
      coinbasewallet: {
        package: window.CoinbaseWalletSDK,
        options: { appName: 'Orbiter Finance Demo', rpc: { 1: 'https://cloudflare-eth.com' }, darkMode: true }
      }
    };
    web3Modal = new window.Web3Modal.default({ cacheProvider: false, providerOptions: providerOptions, disableInjectedProvider: false, theme: 'dark' });

    var headerBtn = document.getElementById('connectWalletBtnHeader');
    var mainBtn = document.getElementById('connectWalletBtnMain');
    function bind(btn){ if (!btn) return; btn.addEventListener('click', openWalletList); }
    bind(headerBtn);
    bind(mainBtn);

    var closeBtn = document.getElementById('walletCloseBtn');
    var overlay = document.getElementById('walletOverlay');
    if (closeBtn) closeBtn.addEventListener('click', closeWalletList);
    if (overlay) overlay.addEventListener('click', closeWalletList);
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeWalletList(); });

    document.querySelectorAll('[data-wallet-action]').forEach(function(el){
      el.addEventListener('click', function(){
        var action = el.getAttribute('data-wallet-action');
        switch(action){
          case 'walletconnect': return connectWalletConnect();
          case 'injected': return connectInjected();
          case 'coinbase': return connectCoinbase();
          case 'backpack': return connectBackpack();
          case 'okx': return connectOKX();
        }
      });
    });
  }

  window.AiSwapWallet = { initWallet: initWallet, openWalletList: openWalletList };
})();
