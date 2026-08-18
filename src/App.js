import React, { useState, useEffect } from 'react';
import {
  isConnected,
  getPublicKey,
  getAddress,
  setAllowed,
  getNetwork,
  getNetworkDetails,
} from '@stellar/freighter-api';
import { NETWORK } from './stellar';
import MintNFT from './MintNFT';
import Gallery from './Gallery';
import TransferNFT from './TransferNFT';
import Navbar from './Navbar';

export const getErrorMessageAndCode = (err) => {
  if (!err) return { message: '', code: null };
  if (typeof err === 'string') return { message: err, code: null };
  const message =
    err.message ||
    (typeof err.error === 'string' ? err.error : err.error?.message) ||
    '';
  const code = err.code || err.error?.code || null;
  return { message: String(message), code };
};

export const isLockedError = (err) => {
  const { message, code } = getErrorMessageAndCode(err);
  const lower = message.toLowerCase();
  return (
    lower.includes('locked') ||
    lower.includes('unlock') ||
    code === -32002 ||
    code === 'LOCKED'
  );
};

export const isRejectedError = (err) => {
  const { message, code } = getErrorMessageAndCode(err);
  const lower = message.toLowerCase();
  return (
    lower.includes('reject') ||
    lower.includes('decline') ||
    lower.includes('denied') ||
    lower.includes('cancel') ||
    code === 4001 ||
    code === 'USER_REJECTED'
  );
};

export const isNotInstalledError = (err) => {
  const { message } = getErrorMessageAndCode(err);
  const lower = message.toLowerCase();
  return (
    lower.includes('not installed') ||
    lower.includes('not found') ||
    lower.includes('freighter is not installed') ||
    lower.includes('freighterapinodeerror')
  );
};

export const checkIsConnected = async () => {
  if (typeof isConnected !== 'function') return { installed: false, error: null };
  try {
    const res = await isConnected();
    if (typeof res === 'boolean') {
      return { installed: res, error: null };
    }
    const installed = Boolean(res?.isConnected);
    const error = res?.error || null;
    return { installed, error };
  } catch (err) {
    return { installed: false, error: err };
  }
};

export const requestSetAllowed = async () => {
  if (typeof setAllowed !== 'function') return { allowed: true, error: null };
  try {
    const res = await setAllowed();
    if (typeof res === 'boolean') {
      return { allowed: res, error: null };
    }
    if (!res) {
      return { allowed: true, error: null };
    }
    const allowed = res.isAllowed !== false;
    const error = res.error || null;
    return { allowed, error };
  } catch (err) {
    return { allowed: false, error: err };
  }
};

export const fetchPublicKey = async () => {
  try {
    let keyResult = null;
    let keyError = null;

    if (typeof getPublicKey === 'function') {
      try {
        keyResult = await getPublicKey();
      } catch (err) {
        keyError = err;
      }
    }

    const extractKey = (res) => {
      if (!res) return '';
      if (typeof res === 'string') return res;
      return res.address || res.publicKey || '';
    };

    let publicKey = extractKey(keyResult);
    if (!publicKey && typeof getAddress === 'function') {
      try {
        const addrRes = await getAddress();
        if (typeof addrRes === 'string') {
          publicKey = addrRes;
        } else if (addrRes) {
          publicKey = addrRes.address || addrRes.publicKey || '';
          if (addrRes.error) keyError = addrRes.error;
        }
      } catch (err) {
        if (!keyError) keyError = err;
      }
    }

    if (keyResult && typeof keyResult === 'object' && keyResult.error) {
      keyError = keyResult.error;
    }

    return { publicKey, error: keyError };
  } catch (err) {
    return { publicKey: '', error: err };
  }
};

export const verifyNetwork = async () => {
  const netFn = getNetwork || getNetworkDetails;
  if (typeof netFn !== 'function') return { isMatch: true, network: '' };
  try {
    const res = await netFn();
    const netName =
      typeof res === 'string'
        ? res
        : res?.network || res?.networkName || '';
    if (!netName) return { isMatch: true, network: '' };
    const isMatch = netName.toUpperCase().includes(NETWORK.toUpperCase());
    return { isMatch, network: netName };
  } catch {
    return { isMatch: true, network: '' };
  }
};

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [status, setStatus] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [showInstallLink, setShowInstallLink] = useState(false);
  const [activeTab, setActiveTab] = useState('gallery');

  useEffect(() => {
    const hydratePersistedWallet = async () => {
      try {
        if (localStorage.getItem('freighterConnected') === 'true') {
          const { installed } = await checkIsConnected();
          if (installed) {
            const { publicKey } = await fetchPublicKey();
            if (publicKey) {
              setWalletAddress(publicKey);
              const { isMatch } = await verifyNetwork();
              if (!isMatch) {
                setStatus('Warning: Please switch Freighter network to TESTNET.');
              }
            } else {
              localStorage.removeItem('freighterConnected');
            }
          } else {
            localStorage.removeItem('freighterConnected');
          }
        }
      } catch (error) {
        console.error('Silent reconnection failed:', error);
        localStorage.removeItem('freighterConnected');
      }
    };

    hydratePersistedWallet();
  }, []);

  const connectWallet = async () => {
    if (connecting) return;
    setConnecting(true);
    setShowInstallLink(false);
    setStatus('Connecting...');

    try {
      const { installed, error: connError } = await checkIsConnected();
      if (connError) {
        if (isLockedError(connError)) {
          setStatus('Freighter wallet is locked. Please unlock it and try again.');
          return;
        }
        if (isRejectedError(connError)) {
          setStatus('User rejected the connection request.');
          return;
        }
        if (isNotInstalledError(connError)) {
          setStatus('Please install Freighter wallet!');
          setShowInstallLink(true);
          return;
        }
        throw connError;
      }

      if (!installed) {
        setStatus('Please install Freighter wallet!');
        setShowInstallLink(true);
        return;
      }

      const { allowed, error: allowError } = await requestSetAllowed();
      if (allowError) {
        if (isLockedError(allowError)) {
          setStatus('Freighter wallet is locked. Please unlock it and try again.');
          return;
        }
        if (isRejectedError(allowError)) {
          setStatus('User rejected the connection request.');
          return;
        }
        throw allowError;
      }

      if (!allowed) {
        setStatus('User rejected the connection request.');
        return;
      }

      const { publicKey, error: keyError } = await fetchPublicKey();
      if (keyError) {
        if (isLockedError(keyError)) {
          setStatus('Freighter wallet is locked. Please unlock it and try again.');
          return;
        }
        if (isRejectedError(keyError)) {
          setStatus('User rejected the connection request.');
          return;
        }
        throw keyError;
      }

      if (!publicKey) {
        setStatus('Connection failed. No public key returned.');
        return;
      }

      setWalletAddress(publicKey);
      localStorage.setItem('freighterConnected', 'true');
      setStatus('');

      const { isMatch } = await verifyNetwork();
      if (!isMatch) {
        setStatus('Warning: Please switch Freighter network to TESTNET.');
      }
    } catch (error) {
      if (isNotInstalledError(error)) {
        setStatus('Please install Freighter wallet!');
        setShowInstallLink(true);
      } else if (isLockedError(error)) {
        setStatus('Freighter wallet is locked. Please unlock it and try again.');
      } else if (isRejectedError(error)) {
        setStatus('User rejected the connection request.');
      } else {
        setStatus('Connection failed. Try again.');
        console.error('Freighter connection error:', error);
      }
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress('');
    setStatus('');
    setShowInstallLink(false);
    localStorage.removeItem('freighterConnected');
  };

  return (
    <div style={styles.container}>
      <Navbar
        walletAddress={walletAddress}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
        status={status}
        connecting={connecting}
        showInstallLink={showInstallLink}
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
