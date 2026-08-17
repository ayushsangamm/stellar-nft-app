import React from 'react';
import { truncateAddress } from './stellar';

export { truncateAddress };

export const Navbar = ({
  walletAddress,
  connectWallet,
  disconnectWallet,
  onConnect,
  onDisconnect,
  status,
}) => {
  const handleConnect = connectWallet || onConnect;
  const handleDisconnect = disconnectWallet || onDisconnect;

  return (
    <header style={styles.header}>
      <h1 style={styles.title}>🪐 OrbitNFT</h1>
      <p style={styles.subtitle}>
        Mint and collect Digital Art NFTs on Stellar
      </p>

      {walletAddress ? (
        <div style={styles.walletContainer}>
          <div style={styles.walletConnected}>
            ✅ {truncateAddress(walletAddress)}
          </div>
          <button
            onClick={handleDisconnect}
            style={styles.disconnectButton}
            aria-label="Disconnect"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          style={styles.walletButton}
          aria-label="Connect Wallet"
        >
          🔌 Connect Wallet
        </button>
      )}
      {status && <p style={styles.status}>{status}</p>}
    </header>
  );
};

const styles = {
  header: {
    textAlign: 'center',
    padding: '30px 20px 20px',
    borderBottom: '1px solid #1a1a1a',
  },
  title: {
    fontSize: '28px',
    color: '#7c3aed',
    marginBottom: '6px',
  },
  subtitle: {
    color: '#888888',
    fontSize: '14px',
    marginBottom: '16px',
  },
  walletContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  walletConnected: {
    backgroundColor: '#001a00',
    border: '1px solid #22c55e',
    borderRadius: '8px',
    padding: '10px 24px',
    color: '#22c55e',
    fontSize: '14px',
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: 'monospace',
  },
  disconnectButton: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  walletButton: {
    backgroundColor: '#7c3aed',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 24px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  status: {
    color: '#f59e0b',
    fontSize: '13px',
    marginTop: '8px',
  },
};

export default Navbar;
