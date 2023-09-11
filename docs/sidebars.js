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
      id: 'integration-patterns/overview',
      label: 'Overview',
      type: 'doc',
    },
    {
      id: 'integration-patterns/managed-syncs',
      label: 'Managed Syncs',
      type: 'doc',
    },
    {
      id: 'integration-patterns/unified-api',
      label: 'Unified API',
      type: 'doc',
    },
    {
      id: 'integration-patterns/actions-api',
      label: 'Actions API',
      type: 'doc',
    },
    {
      id: 'integration-patterns/real-time-events',
      label: 'Real-time Events',
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
      id: 'platform/objects/overview',
      label: 'Objects',
      type: 'doc',
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
      id: 'use-cases/overview',
      label: 'Overview',
      type: 'doc',
    },
    {
      id: 'tutorials/search-across-data',
      label: 'Search across data',
      type: 'doc',
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
      label: 'Transformations',
      type: 'category',
      link: {
        title: 'Transformations',
        description: 'Transformations',
        type: 'generated-index',
      },
      items: [
        {
          id: 'tutorials/transformations/overview',
          type: 'doc',
          label: 'Overview',
        },
        {
          id: 'tutorials/transformations/pagination',
          type: 'doc',
          label: 'Pagination',
        },
        {
          id: 'tutorials/transformations/common-schema',
          type: 'doc',
          label: 'Common schema',
        },
        {
          id: 'tutorials/transformations/association-bridge-table',
          type: 'doc',
          label: 'Association bridge table',
        },
        {
          id: 'tutorials/transformations/object-field-mapping',
          type: 'doc',
          label: 'Object and field mapping',
        },
      ],
    },
    {
      id: 'tutorials/listen-for-webhooks',
      label: 'Consume notification webhooks',
      type: 'doc',
    },

    // section
    {
      type: 'html',
      value: sidebarHeader('Recipes'),
    },
    {
      id: 'recipes/overview',
      label: 'Overview',
      type: 'doc',
    },
    {
      label: 'ORMs',
      type: 'category',
      link: {
        title: 'ORMs',
        description: 'ORMs',
        type: 'generated-index',
      },
      items: [
        {
          id: 'recipes/supaglue-prisma',
          label: 'Supaglue + Prisma',
          type: 'doc',
        },
      ],
    },
    {
      label: 'Workflow Engines',
      type: 'category',
      link: {
        title: 'Workflow Engines',
        description: 'Workflow Engines',
        type: 'generated-index',
      },
      items: [
        {
          id: 'recipes/supaglue-inngest',
          label: 'Supaglue + Inngest',
          type: 'doc',
        },
        {
          id: 'recipes/supaglue-triggerdev',
          label: 'Supaglue + Trigger.dev',
          type: 'doc',
        },
        {
          id: 'recipes/supaglue-temporal',
          label: 'Supaglue + Temporal',
          type: 'doc',
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

    // section
    {
      type: 'html',
      value: sidebarHeader('Management API'),
    },
    {
      type: 'category',
      label: 'Management API',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      items: require('./docs/api/v2/mgmt/sidebar.js').map((item) => {
        // hide deprecated items. we hide it because removing it from the sidebar causes docusaurus build issues.
        if (['Entities', 'EntityMappings', 'Schemas', 'SchemaMappings'].includes(item.label)) {
          item.className += ' hidden';
        }

        return item;
      }),
    },

    // section
    {
      type: 'html',
      value: sidebarHeader('Unified API'),
    },
    {
      type: 'category',
      label: 'CRM API',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      items: [
        ...require('./docs/api/v2/crm/sidebar.js'),
        {
          type: 'html',
          value: sidebarHeader('Metadata API'),
        },
        ...require('./docs/api/v2/metadata/sidebar.js'),
      ],
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
      label: 'Enrichment API',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      items: require('./docs/api/v2/enrichment/sidebar.js'),
    },
    {
      type: 'category',
      label: 'Ticketing API',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      items: require('./docs/api/v2/ticketing/sidebar.js'),
    },
    {
      type: 'category',
      label: 'Marketing Automation API',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      items: require('./docs/api/v2/marketing-automation/sidebar.js'),
    },
    // section
    {
      type: 'html',
      value: sidebarHeader('Actions API'),
    },
    { type: 'doc', id: 'api/v2/actions/actions-api' }, // deep copied from actions/sidebar.js
    {
      type: 'category',
      label: 'Salesforce',
      collapsed: true,
      items: [
        { type: 'doc', id: 'api/v2/actions/list-list-viewss', label: 'List list views', className: 'api-method get' },
        {
          type: 'doc',
          id: 'api/v2/actions/get-list-view-membership',
          label: 'Get list view membership',
          className: 'api-method get',
        },
      ],
    }, // deep copied from actions/sidebar.js

    // section
    {
      type: 'html',
      value: sidebarHeader('Data Listing API'),
    },
    {
      type: 'category',
      label: 'Data Listing API',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      items: require('./docs/api/v2/data/sidebar.js'),
    },

    // section
    {
      type: 'html',
      value: sidebarHeader('Passthrough API'),
    },
    {
      type: 'category',
      label: 'Passthrough',
      link: { type: 'doc', id: 'api/v2/actions/passthrough' },
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'api/v2/actions/send-passthrough-request',
          label: 'Send passthrough request',
          className: 'api-method post',
        },
      ],
      className: 'hidden',
    },
    {
      type: 'doc',
      id: 'api/v2/actions/send-passthrough-request',
      label: 'Send passthrough request',
      className: 'api-method post',
    },
  ],
};

module.exports = sidebars;
