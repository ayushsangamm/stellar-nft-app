import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Gallery, { sampleNFTs } from './Gallery';
import NFTCardSkeleton from './NFTCardSkeleton';

describe('NFTCardSkeleton component', () => {
  test('renders skeleton card container and placeholders', () => {
    render(<NFTCardSkeleton />);
    const skeletonCard = screen.getByTestId('nft-card-skeleton');
    expect(skeletonCard).toBeInTheDocument();

    // Check react-loading-skeleton elements are rendered inside
    const skeletons = skeletonCard.querySelectorAll('.react-loading-skeleton');
    expect(skeletons.length).toBeGreaterThanOrEqual(4); // Image, title, desc, date
  });

  test('applies custom styles when passed', () => {
    render(<NFTCardSkeleton style={{ opacity: 0.8 }} data-testid="custom-skeleton" />);
    const skeleton = screen.getByTestId('custom-skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveStyle({ opacity: '0.8' });
  });
});

describe('Gallery component skeleton loading UI', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  test('renders 6 skeleton placeholder cards during active loading state on initial mount', () => {
    render(<Gallery />);

    // Header and loading count are displayed
    expect(screen.getByRole('heading', { name: /nft gallery/i })).toBeInTheDocument();
    expect(screen.getByText(/loading nfts\.\.\./i)).toBeInTheDocument();

    // Skeleton grid and 6 skeleton cards are present
    const skeletonGrid = screen.getByTestId('nft-skeleton-grid');
    expect(skeletonGrid).toBeInTheDocument();

    const skeletonCards = screen.getAllByTestId('nft-card-skeleton');
    expect(skeletonCards).toHaveLength(6);

    // Real NFT items are NOT present yet
    expect(screen.queryByTestId('nft-card-grid')).not.toBeInTheDocument();
    expect(screen.queryByText('Sunset in Lagos')).not.toBeInTheDocument();
  });

  test('supports custom skeletonCount prop', () => {
    render(<Gallery skeletonCount={8} />);

    const skeletonCards = screen.getAllByTestId('nft-card-skeleton');
    expect(skeletonCards).toHaveLength(8);
  });

  test('smoothly replaces skeletons with real NFT items upon successful data retrieval', async () => {
    render(<Gallery />);

    // Initially in loading state
    expect(screen.getByTestId('nft-skeleton-grid')).toBeInTheDocument();
    expect(screen.getAllByTestId('nft-card-skeleton')).toHaveLength(6);

    // Fast-forward timeout to simulate data fetch completion
    act(() => {
      jest.advanceTimersByTime(1500);
    });

    // Skeletons are no longer present
    expect(screen.queryByTestId('nft-skeleton-grid')).not.toBeInTheDocument();
    expect(screen.queryByTestId('nft-card-skeleton')).not.toBeInTheDocument();
    expect(screen.queryByText(/loading nfts\.\.\./i)).not.toBeInTheDocument();

    // Real NFT card grid is rendered
    expect(screen.getByTestId('nft-card-grid')).toBeInTheDocument();
    expect(screen.getByText(`${sampleNFTs.length} NFTs found`)).toBeInTheDocument();

    sampleNFTs.forEach((nft) => {
      expect(screen.getByText(nft.name)).toBeInTheDocument();
      expect(screen.getByText(nft.description)).toBeInTheDocument();
      expect(screen.getByTestId(`nft-card-${nft.id}`)).toBeInTheDocument();
    });
  });

  test('allows opening and closing the NFT detail modal after loading finishes', () => {
    render(<Gallery />);

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    // Click on the first NFT card
    const firstCard = screen.getByTestId(`nft-card-${sampleNFTs[0].id}`);
    fireEvent.click(firstCard);

    // Modal should appear
    const modal = screen.getByTestId('nft-modal');
    expect(modal).toBeInTheDocument();
    expect(screen.getByText(`👤 Owner: ${sampleNFTs[0].owner}`)).toBeInTheDocument();
    expect(screen.getByText(`📅 Minted: ${sampleNFTs[0].minted}`)).toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);

    expect(screen.queryByTestId('nft-modal')).not.toBeInTheDocument();
  });

  test('cleans up pending timer gracefully on unmount', () => {
    const { unmount } = render(<Gallery />);
    expect(screen.getByTestId('nft-skeleton-grid')).toBeInTheDocument();

    // Unmount before timeout finishes
    unmount();

    // Advancing timers should not trigger errors or warning
    act(() => {
      jest.advanceTimersByTime(1500);
    });
  });
});
