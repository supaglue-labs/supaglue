module.exports = [
  { type: 'doc', id: 'api/v2/metadata/metadata-api' },
  {
    type: 'category',
    label: 'CustomObjects',
    link: { type: 'doc', id: 'api/v2/metadata/custom-objects' },
    collapsed: true,
    items: [
      {
        type: 'doc',
        id: 'api/v2/metadata/list-custom-objects',
        label: 'List customObjects',
        className: 'api-method get',
      },
      {
        type: 'doc',
        id: 'api/v2/metadata/create-custom-object',
        label: 'Create customObject',
        className: 'api-method post',
      },
      { type: 'doc', id: 'api/v2/metadata/get-custom-object', label: 'Get customObject', className: 'api-method get' },
      {
        type: 'doc',
        id: 'api/v2/metadata/update-custom-object',
        label: 'Update customObject',
        className: 'api-method put',
      },
    ],
  },
  {
    type: 'category',
    label: 'StandardObjects',
    link: { type: 'doc', id: 'api/v2/metadata/standard-objects' },
    collapsed: true,
    items: [
      {
        type: 'doc',
        id: 'api/v2/metadata/list-standard-objects',
        label: 'List standardObjects',
        className: 'api-method get',
      },
    ],
  },
  {
    type: 'category',
    label: 'AssociationTypes',
    link: { type: 'doc', id: 'api/v2/metadata/association-types' },
    collapsed: true,
    items: [
      {
        type: 'doc',
        id: 'api/v2/metadata/get-association-types',
        label: 'List associationTypes',
        className: 'api-method get',
      },
      {
        type: 'doc',
        id: 'api/v2/metadata/create-association-type',
        label: 'Create associationType',
        className: 'api-method post',
      },
    ],
  },
];
