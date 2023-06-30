/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const fs = require('fs');
const path = require('path');

const lightCodeTheme = require('prism-react-renderer/themes/github');

const LATEST_VERSION = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8')).version;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Supaglue Docs',
  tagline: 'Open source unified API',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://docs.supaglue.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'supaglue-labs', // Usually your GitHub org/user name.
  projectName: 'supaglue', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  themes: ['docusaurus-theme-openapi-docs'], // Allows use of @theme/ApiItem and other components

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      {
        docs: {
          lastVersion: LATEST_VERSION,
          sidebarCollapsed: false,
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/supaglue-labs/supaglue/tree/main/docs/',
          routeBasePath: '/',
          docLayoutComponent: '@theme/DocPage',
          docItemComponent: '@theme/ApiItem', // Derived from docusaurus-theme-openapi-docs
          async sidebarItemsGenerator({ defaultSidebarItemsGenerator, ...args }) {
            const items = await defaultSidebarItemsGenerator(args);
            return (
              items
                // flatten the API to a single link in the sidebar
                .map((item) =>
                  item.type === 'category' && item.label === 'api'
                    ? { type: 'doc', id: 'api/introduction', label: 'API Reference' }
                    : item
                )
            );
          },
        },
        theme: {
          customCss: [require.resolve('./src/css/custom.css'), require.resolve('./src/css/supaglue.css')],
        },
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        disableSwitch: false,
      },
      announcementBar: {
        id: 'mtn-announcement',
        content: `<div id="mtn-announcement" class="flex items-center justify-center" style="gap: 7px; display: flex; align-items: center; justify-content: center;">
          <span>⭐️ If you like Supaglue, give us a star on <a target="_blank" rel="noopener noreferrer" href="https://github.com/supaglue-labs/supaglue">GitHub!</a></span>
          <svg height="16px" width="16px" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="github" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"><path fill="currentColor" d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"></path></svg>
          ⭐️
        </div>`,
      },
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        // title: 'Supaglue Docs',
        logo: {
          alt: 'Supaglue',
          src: 'img/logo-light.png',
          srcDark: 'img/logo-dark.png',
          href: 'https://supaglue.com',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Docs',
          },
          {
            type: 'doc',
            docId: 'api/introduction',
            position: 'left',
            label: 'API Reference',
          },
          { type: 'docsVersionDropdown', position: 'left' },
          {
            type: 'custom-githubButton',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Introduction',
                to: '/',
              },
              {
                label: 'Quickstart',
                to: 'quickstart',
              },
              {
                label: 'Connectors',
                to: 'connectors',
              },
              {
                label: 'API Reference',
                to: 'api/introduction',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Slack',
                href: 'https://join.slack.com/t/supagluecommunity/shared_invite/zt-1o2hiozzl-ZRQswNzlT5W4sXwrQnVlDg',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/supaglue_labs',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/supaglue-labs/supaglue',
              },
            ],
          },
          {
            title: 'Connectors',
            items: [
              {
                label: 'Apollo',
                href: '/connectors/apollo',
              },
              {
                label: 'Gong',
                href: '/connectors/gong',
              },
              {
                label: 'HubSpot',
                href: '/connectors/hubspot',
              },
              {
                label: 'Marketo',
                href: '/connectors/marketo',
              },
              {
                label: 'Dynamics 365 Sales',
                href: '/connectors/ms_dynamics_365_sales',
              },
              {
                label: 'Outreach',
                href: '/connectors/outreach',
              },
              {
                label: 'Pipedrive',
                href: '/connectors/pipedrive',
              },
              {
                label: 'Salesforce',
                href: '/connectors/salesforce',
              },
              {
                label: 'Salesloft',
                href: '/connectors/salesloft',
              },
              {
                label: 'Zendesk Sell',
                href: '/connectors/zendesk_sell',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Supaglue, Inc.`,
      },
      prism: {
        theme: lightCodeTheme,
        // darkTheme: darkCodeTheme,
      },
      algolia: {
        appId: 'CJOFM1QP4P',
        // Public API key: it is safe to commit it
        apiKey: 'df1b7f9cda04ea41a90afc0fda6cc925',
        indexName: 'supaglue',
        contextualSearch: true,
      },
    }),
  plugins: [
    () => ({
      name: 'docusaurus-tailwindcss',
      configurePostCss(postcssOptions) {
        // Appends TailwindCSS and AutoPrefixer.
        postcssOptions.plugins.push(require('tailwindcss'));
        postcssOptions.plugins.push(require('autoprefixer'));
        return postcssOptions;
      },
    }),
    [
      'posthog-docusaurus',
      {
        apiKey: 'phc_thv3N2dFQcJDh2vPz6FtGE9oKDiBSdYp5oKS1Cu9U8j',
        enableInDevelopment: false,
        enable: process.env.VERCEL_ENV === 'production',
      },
    ],
    [
      '@docusaurus/plugin-google-gtag',
      {
        trackingID: 'G-NWKLMGGLEB',
        anonymizeIP: true,
      },
    ],
    () => ({
      name: 'koala',
      injectHtmlTags() {
        return {
          postBodyTags: [
            {
              tagName: 'script',
              innerHTML: `!function(t){if(window.ko)return;window.ko=[],["identify","track", "removeListeners", "open", "on", "off", "qualify", "ready"].forEach(function(t){ko[t]=function(){var n=[].slice.call(arguments);return n.unshift(t),ko.push(n),ko}});var n=document.createElement("script");n.async=!0,n.setAttribute("src","https://cdn.getkoala.com/v1/supergrain/sdk.js"),(document.body || document.head).appendChild(n)}();`,
            },
          ],
        };
      },
    }),
    () => ({
      name: 'webpack-watch-external-files',
      configureWebpack(config) {
        if (config.mode === 'production') {
          return {};
        }
        /** @type any - needed so ts doesn't complain */
        const WatchExternalFilesPlugin = require('webpack-watch-external-files-plugin');
        return {
          plugins: [
            new WatchExternalFilesPlugin({
              files: [
                '../openapi/v2/mgmt/openapi.bundle.json',
                '../openapi/v2/crm/openapi.bundle.json',
                '../openapi/v2/engagement/openapi.bundle.json',
              ],
            }),
          ],
        };
      },
    }),
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'apiDocs',
        docsPluginId: 'classic',
        config: {
          crm: {
            specPath: '../openapi/v2/crm/openapi.bundle.json',
            outputDir: 'docs/api/v2/crm', // Output directory for generated .mdx docs
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag',
              sidebarCollapsed: true,
            },
          },
          engagement: {
            specPath: '../openapi/v2/engagement/openapi.bundle.json',
            outputDir: 'docs/api/v2/engagement', // Output directory for generated .mdx docs
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag',
              sidebarCollapsed: true,
            },
          },
          mgmt: {
            specPath: '../openapi/v2/mgmt/openapi.bundle.json',
            outputDir: 'docs/api/v2/mgmt',
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag',
              sidebarCollapsed: true,
            },
          },
        },
      },
    ],
  ],
};

module.exports = config;
