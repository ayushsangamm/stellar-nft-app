import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import * as freighter from '@stellar/freighter-api';

jest.mock('@stellar/freighter-api', () => ({
  isConnected: jest.fn(),
  getPublicKey: jest.fn(),
  setAllowed: jest.fn(),
}));

describe('App component', () => {
  const samplePublicKey = 'GA2C5RFPE6GCKMYYLHSI6AWBXPXR6O54VUUBM3CUS5W27EWBXRXGWXY7';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders App with header and default Gallery tab', () => {
    render(<App />);
    expect(screen.getByText('🪐 OrbitNFT')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /gallery/i })).toBeInTheDocument();
  });

  test('connects and disconnects wallet resetting the Navbar state', async () => {
    freighter.isConnected.mockResolvedValue(true);
    freighter.setAllowed.mockResolvedValue(true);
    freighter.getPublicKey.mockResolvedValue(samplePublicKey);

    render(<App />);

    const connectButton = screen.getByRole('button', { name: /connect wallet/i });
    await act(async () => {
      fireEvent.click(connectButton);
    });

    // Address truncated to first 4 + ... + last 4
    expect(screen.getByText(/GA2C\.\.\.WXY7/i)).toBeInTheDocument();
    const disconnectButton = screen.getByRole('button', { name: /disconnect/i });
    expect(disconnectButton).toBeInTheDocument();

    // Click Disconnect
    act(() => {
      fireEvent.click(disconnectButton);
    });

    // Should return to Connect Wallet state
    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /disconnect/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/GA2C\.\.\.WXY7/i)).not.toBeInTheDocument();
  });
});
