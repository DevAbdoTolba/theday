/**
 * Mock for next/router used in Storybook (react-vite framework).
 * Components can navigate without crashing; actions are no-ops.
 */
const mockRouter = {
  push: async (_url: string) => true,
  replace: async (_url: string) => true,
  back: () => {},
  forward: () => {},
  prefetch: async (_url: string) => {},
  reload: () => {},
  pathname: "/",
  query: {},
  asPath: "/",
  route: "/",
  basePath: "",
  locale: undefined,
  locales: [],
  defaultLocale: undefined,
  domainLocales: [],
  isLocaleDomain: false,
  events: {
    on: () => {},
    off: () => {},
    emit: () => {},
  },
  isFallback: false,
  isReady: true,
  isPreview: false,
};

export function useRouter() {
  return mockRouter;
}

export default mockRouter;
