import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from './Navbar';

describe('Navbar component', () => {
  const samplePublicKey = 'GA2C5RFPE6GCKMYYLHSI6AWBXPXR6O54VUUBM3CUS5W27EWBXRXGWXY7';

  test('renders Connect Wallet button when wallet is disconnected', () => {
    const handleConnect = jest.fn();
    render(<Navbar walletAddress="" connectWallet={handleConnect} />);

    const connectButton = screen.getByRole('button', { name: /connect wallet/i });
    expect(connectButton).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /disconnect/i })).not.toBeInTheDocument();

    fireEvent.click(connectButton);
    expect(handleConnect).toHaveBeenCalledTimes(1);
  });

  test('renders truncated address and Disconnect button when wallet is connected', () => {
    const handleDisconnect = jest.fn();
    render(
      <Navbar
        walletAddress={samplePublicKey}
        disconnectWallet={handleDisconnect}
      />
    );

    // Truncated format: first 4 + ... + last 4 => GA2C...WXY7
    expect(screen.getByText(/GA2C\.\.\.WXY7/i)).toBeInTheDocument();
    
    const disconnectButton = screen.getByRole('button', { name: /disconnect/i });
    expect(disconnectButton).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /connect wallet/i })).not.toBeInTheDocument();

    fireEvent.click(disconnectButton);
    expect(handleDisconnect).toHaveBeenCalledTimes(1);
  });

  test('supports onConnect and onDisconnect prop aliases', () => {
    const onConnect = jest.fn();
    const onDisconnect = jest.fn();

    const { rerender } = render(<Navbar walletAddress="" onConnect={onConnect} />);
    fireEvent.click(screen.getByRole('button', { name: /connect wallet/i }));
    expect(onConnect).toHaveBeenCalledTimes(1);

    rerender(
      <Navbar
        walletAddress={samplePublicKey}
        onDisconnect={onDisconnect}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /disconnect/i }));
    expect(onDisconnect).toHaveBeenCalledTimes(1);
  });

  test('displays status message when provided', () => {
    render(<Navbar walletAddress="" status="Connecting..." />);
    expect(screen.getByText('Connecting...')).toBeInTheDocument();
  });
});
