import React, { useState } from 'react';
import { isConnected, getPublicKey, setAllowed } from '@stellar/freighter-api';
import MintNFT from './MintNFT';
import Gallery from './Gallery';
import TransferNFT from './TransferNFT';
import Navbar from './Navbar';

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [status, setStatus] = useState('');
  const [activeTab, setActiveTab] = useState('gallery');

  const connectWallet = async () => {
    try {
      setStatus('Connecting...');
      if (await isConnected()) {
        await setAllowed();
        const publicKey = await getPublicKey();
        setWalletAddress(publicKey);
        setStatus('');
      } else {
        setStatus('Please install Freighter wallet!');
      }
    } catch (error) {
      setStatus('Connection failed. Try again.');
    }
  };

  const disconnectWallet = () => {
    setWalletAddress('');
    setStatus('');
  };

  return (
    <div style={styles.container}>
      <Navbar
        walletAddress={walletAddress}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
        status={status}
      />

      <div style={styles.tabs}>
        <button
          style={activeTab === 'gallery' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('gallery')}
        >
          🏛️ Gallery
        </button>
        <button
          style={activeTab === 'mint' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('mint')}
        >
          🎨 Mint
        </button>
        <button
          style={activeTab === 'transfer' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('transfer')}
        >
          💸 Transfer
        </button>
      </div>

      <div style={styles.content}>
        {activeTab === 'gallery' && <Gallery walletAddress={walletAddress} />}
        {activeTab === 'mint' && <MintNFT walletAddress={walletAddress} />}
        {activeTab === 'transfer' && <TransferNFT walletAddress={walletAddress} />}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#ffffff', fontFamily: 'Arial, sans-serif' },
  tabs: { display: 'flex', borderBottom: '1px solid #1a1a1a', backgroundColor: '#0a0a0a', position: 'sticky', top: 0, zIndex: 100 },
  tab: { flex: 1, padding: '14px', backgroundColor: 'transparent', border: 'none', color: '#888888', fontSize: '14px', cursor: 'pointer', borderBottom: '2px solid transparent' },
  tabActive: { flex: 1, padding: '14px', backgroundColor: 'transparent', border: 'none', color: '#7c3aed', fontSize: '14px', cursor: 'pointer', borderBottom: '2px solid #7c3aed' },
  content: { padding: '20px' },
};

export default App;
