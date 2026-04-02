import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

import type { StorybookConfig } from "@storybook/react-vite";

const storybookDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(storybookDir, "..");

function getAbsolutePath(value: string) {
  return dirname(
    fileURLToPath(import.meta.resolve(`${value}/package.json`))
  );
}

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-vitest"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-onboarding"),
  ],
  framework: getAbsolutePath("@storybook/react-vite"),
  viteFinal: async (config) => {
    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@frontend/common": resolve(repoRoot, "packages/common/src/index.ts"),
      "@frontend/shop": resolve(repoRoot, "packages/shop/src/index.ts"),
      "@frontend/theme": resolve(repoRoot, "packages/theme/src/index.ts"),
    };
    return config;
  },
};

export default config;
