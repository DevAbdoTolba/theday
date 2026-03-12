/**
 * Mock for next/link used in Storybook (react-vite framework).
 * Renders a plain anchor tag without Next.js router dependency.
 */
import React from "react";

interface LinkProps {
  href: string;
  children?: React.ReactNode;
  passHref?: boolean;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  style?: React.CSSProperties;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  [key: string]: any;
}

function Link({ href, children, passHref: _passHref, prefetch: _prefetch, replace: _replace, scroll: _scroll, shallow: _shallow, ...rest }: LinkProps) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

export default Link;
