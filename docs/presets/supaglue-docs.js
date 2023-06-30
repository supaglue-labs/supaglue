module.exports = function preset(context, opts = {}) {
  return {
    themes: [],
    plugins: [
      ['@docusaurus/plugin-content-docs', { ...opts.docs, id: 'default' }],
      ['@docusaurus/plugin-content-docs', { ...opts.api, id: 'api' }],
    ],
  };
};
