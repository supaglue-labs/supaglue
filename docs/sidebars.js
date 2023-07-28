/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

function sidebarHeader(name) {
  return `<div class="mt-4" style="font-size: 0.8em; font-weight: 700; padding: 0.4em 0 0.4em 0.4em; background-color: #00000005;">${name}</div>`;
}

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  docs: [
    { id: 'intro', label: 'Introduction', type: 'doc' },
    { id: 'quickstart', label: 'Quickstart', type: 'doc' },

    // section
    {
      type: 'html',
      value: sidebarHeader('Connectors'),
    },
    {
      label: 'Providers',
      type: 'category',
      link: {
        title: 'Providers',
        description: 'Providers',
        type: 'generated-index',
      },
      items: [
        {
          type: 'autogenerated',
          dirName: 'providers',
        },
      ],
    },
    {
      label: 'Destinations',
      type: 'category',
      link: {
        title: 'Destinations',
        description: 'Destinations',
        type: 'generated-index',
      },
      items: [
        {
          type: 'autogenerated',
          dirName: 'destinations',
        },
      ],
    },

    // section
    {
      type: 'html',
      value: sidebarHeader('Integration Patterns'),
    },
    {
      id: 'integration-patterns/managed-syncs',
      label: 'Managed syncs (reads)',
      type: 'doc',
    },
    {
      id: 'integration-patterns/actions-api',
      label: 'Actions API (writes)',
      type: 'doc',
    },
    {
      id: 'integration-patterns/real-time-events',
      label: 'Realtime events (webhooks)',
      type: 'doc',
    },

    // section
    {
      type: 'html',
      value: sidebarHeader('Platform'),
    },
    {
      id: 'platform/overview',
      label: 'Overview',
      type: 'doc',
    },
    {
      id: 'platform/managed-auth',
      label: 'Managed authentication',
      type: 'doc',
    },
    {
      label: 'Data models',
      type: 'category',
      link: {
        title: 'Data models',
        description: 'There are three ways to data model objects in Supaglue.',
        type: 'generated-index',
      },
      items: [
        {
          id: 'platform/entities/overview',
          label: 'Entities',
          type: 'doc',
        },
        {
          id: 'platform/objects/overview',
          label: 'Objects',
          type: 'doc',
        },
        {
          id: 'platform/common-schema/overview',
          label: 'Common Schema',
          type: 'doc',
        },
      ],
    },
    {
      id: 'platform/passthrough',
      label: 'Passthrough API',
      type: 'doc',
    },
    {
      id: 'platform/notification-webhooks',
      label: 'Notification webhooks',
      type: 'doc',
    },

    // section
    {
      type: 'html',
      value: sidebarHeader('Tutorials'),
    },
    {
      id: 'tutorials/read-write-contacts',
      label: 'Read/write contacts',
      type: 'doc',
    },
    {
      id: 'tutorials/build-integration-card',
      label: 'Build an integration card',
      type: 'doc',
    },
    {
      id: 'tutorials/build-settings-page',
      label: 'Build a settings page',
      type: 'doc',
    },
    {
      id: 'tutorials/unify-objects-with-entities',
      label: "Unify your customers' objects",
      type: 'doc',
    },
    {
      id: 'tutorials/build-field-mapping-ui',
      label: 'Build field mapping UI',
      type: 'doc',
    },
    {
      label: 'Use cases',
      type: 'category',
      link: {
        title: 'Use cases',
        description:
          "In this section we go over common use cases and how to use Supaglue's platform features as a solution for each one.",
        type: 'generated-index',
      },
      items: [
        {
          type: 'autogenerated',
          dirName: 'use-cases',
        },
      ],
    },

    // section
    {
      type: 'html',
      value: sidebarHeader('Resources'),
    },
    {
      id: 'roadmap',
      label: 'Roadmap & Contributing',
      type: 'doc',
    },
    {
      label: 'Security & Legal',
      type: 'category',
      link: {
        title: 'Security & Legal',
        description: 'Security & Legal',
        type: 'generated-index',
      },
      items: [
        {
          type: 'autogenerated',
          dirName: 'security_legal',
        },
      ],
    },
    {
      id: 'api/introduction',
      label: 'API Reference',
      type: 'doc',
    },
  ],
  api: [
    { type: 'doc', id: 'api/introduction' },
    {
      type: 'category',
      label: 'Management API',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      items: require('./docs/api/v2/mgmt/sidebar.js'),
    },
    {
      type: 'category',
      label: 'CRM API',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      items: require('./docs/api/v2/crm/sidebar.js'),
    },
    {
      type: 'category',
      label: 'Engagement API',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      items: require('./docs/api/v2/engagement/sidebar.js'),
    },
    {
      type: 'category',
      label: 'Actions API',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      items: require('./docs/api/v2/actions/sidebar.js'),
    },
  ],
};

module.exports = sidebars;
