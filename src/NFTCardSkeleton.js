import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

/**
 * NFTCardSkeleton
 * Mirrors the exact card structure of the NFT card rendered in Gallery.js:
 *   - Image area: width=100%, height=180px
 *   - Card body with padding=12px: title (14px), description (12px), date tag (11px)
 * Card outer container matches: backgroundColor=#1a1a1a, borderRadius=12px,
 * overflow=hidden, border=1px solid #333333.
 */
function NFTCardSkeleton() {
  return (
    <SkeletonTheme baseColor="#2a2a2a" highlightColor="#3d3d3d">
      {/* Outer card — identical dimensions/radius to the real card */}
      <div style={styles.card}>
        {/* Image placeholder */}
        <Skeleton style={styles.image} />

        {/* Card body */}
        <div style={styles.cardBody}>
          {/* NFT title */}
          <Skeleton height={14} width="70%" style={{ marginBottom: 6 }} />
          {/* NFT description */}
          <Skeleton height={12} width="90%" style={{ marginBottom: 4 }} />
          <Skeleton height={12} width="60%" style={{ marginBottom: 10 }} />
          {/* Date tag */}
          <Skeleton height={11} width="45%" />
        </div>
      </div>
    </SkeletonTheme>
  );
}

const styles = {
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #333333',
  },
  image: {
    display: 'block',
    width: '100%',
    height: '180px',
    borderRadius: 0,
    lineHeight: 1,
  },
  cardBody: {
    padding: '12px',
  },
};

export default NFTCardSkeleton;
