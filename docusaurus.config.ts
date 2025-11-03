import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "Sentinel",
  tagline: "PrestaShop Security Module - Protect your e-commerce site from threats",
  favicon: "img/favicon.ico",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https://sentinel-docs.github.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "BCISOFT", // Usually your GitHub org/user name.
  projectName: "Sentinel", // Usually your repo name.

  onBrokenLinks: "throw",

  // Internationalization configuration
  i18n: {
    defaultLocale: "en",
    locales: ["en", "fr"],
    localeConfigs: {
      en: {
        label: "English",
        direction: "ltr",
        htmlLang: "en-US",
      },
      fr: {
        label: "Français",
        direction: "ltr",
        htmlLang: "fr-FR",
      },
    },
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          routeBasePath: "/", // Documentation at root
        },
        blog: false, // Disable blog for this documentation site
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/docusaurus-social-card.jpg",
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "Sentinel - Documentation",
      logo: {
        alt: "Sentinel Logo",
        src: "img/logo.png",
        // href defaults to baseUrl (homepage)
      },
      items: [
        {
          type: "localeDropdown",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Documentation",
          items: [
            {
              label: "Getting Started",
              to: "/intro",
            },
            {
              label: "Installation",
              to: "/installation",
            },
            {
              label: "Threat Detection",
              to: "/features/threat-detection",
            },
          ],
        },
        {
          title: "Resources",
          items: [
            {
              label: "PrestaShop",
              href: "https://www.prestashop.com",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} BCI Soft. All rights reserved.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["php", "bash", "json"],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
