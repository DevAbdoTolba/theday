import type { StorybookConfig } from "@storybook/react-vite";
import path from "path";

const config: StorybookConfig = {
  stories: [
    "../src/stories/**/*.mdx",
    "../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-a11y",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },
  staticDirs: ["../public"],
  async viteFinal(config) {
    const { mergeConfig } = await import("vite");
    return mergeConfig(config, {
      define: {
        // Provide process global and process.env for Next.js/Node.js compatibility
        "global.process": JSON.stringify({
          env: process.env,
        }),
        "process.env": JSON.stringify(process.env),
      },
      resolve: {
        alias: [
          // Resolve @/ to src/ (Next.js auto-maps @/* → src/* when src/ dir exists)
          { find: /^@\//, replacement: path.resolve(__dirname, "../src/") + "/" },
          // Mock Next.js router so components using useRouter() don't crash
          { find: /^next\/router$/, replacement: path.resolve(__dirname, "./mocks/next-router.ts") },
          // Mock Next.js link so <Link href="..."> renders as a plain anchor
          { find: /^next\/link$/, replacement: path.resolve(__dirname, "./mocks/next-link.tsx") },
          // Mock Next.js image to avoid process global error
          { find: /^next\/image$/, replacement: path.resolve(__dirname, "./mocks/next-image.tsx") },
          // Mock pages/_app so ColorModeContext and offlineContext are available without page setup
          {
            find: path.resolve(__dirname, "../src/pages/_app"),
            replacement: path.resolve(__dirname, "./mocks/pages-app.ts"),
          },
        ],
      },
    });
  },
};

export default config;
