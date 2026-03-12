import React from 'react';

/**
 * Mock for next/image - replaced with a simple <img> tag for Storybook
 * The Next.js Image component has dependencies on the `process` global
 * and requires Next.js runtime APIs, so we replace it with a standard img tag.
 */
export default function Image({
  src,
  alt,
  width,
  height,
  priority,
  loading,
  onLoad,
  ...props
}: any) {
  return (
    <img
      src={typeof src === 'string' ? src : src.src}
      alt={alt}
      width={width}
      height={height}
      loading={loading || 'lazy'}
      onLoad={onLoad}
      {...props}
    />
  );
}
