module.exports = [
  { type: 'doc', id: 'api/v2/actions/actions-api' },
  {
    type: 'category',
    label: 'EntityRecords',
    link: { type: 'doc', id: 'api/v2/actions/entity-records' },
    collapsed: true,
    items: [
      {
        type: 'doc',
        id: 'api/v2/actions/create-entity-record',
        label: 'Create Entity record',
        className: 'api-method post',
      },
      { type: 'doc', id: 'api/v2/actions/get-entity-record', label: 'Get Entity Record', className: 'api-method get' },
      {
        type: 'doc',
        id: 'api/v2/actions/update-entity-record',
        label: 'Update entity record',
        className: 'api-method patch',
      },
    ],
  },
  {
    type: 'category',
    label: 'ObjectRecords',
    link: { type: 'doc', id: 'api/v2/actions/object-records' },
    collapsed: true,
    items: [
      {
        type: 'doc',
        id: 'api/v2/actions/create-standard-object-record',
        label: 'Create Standard Object record',
        className: 'api-method post',
      },
      {
        type: 'doc',
        id: 'api/v2/actions/get-standard-object-record',
        label: 'Get Standard Object record',
        className: 'api-method get',
      },
      {
        type: 'doc',
        id: 'api/v2/actions/update-standard-object-record',
        label: 'Update Standard Object record',
        className: 'api-method patch',
      },
    ],
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
  },
  {
    type: 'category',
    label: 'Associations',
    collapsed: true,
    items: [
      { type: 'doc', id: 'api/v2/actions/get-associations', label: 'List associations', className: 'api-method get' },
      {
        type: 'doc',
        id: 'api/v2/actions/create-association',
        label: 'Create association',
        className: 'api-method put',
      },
    ],
  },
];
