export type EqualsFilter = {
  type: 'equals';
  value: string;
};

// export type ContainsFilter = {
//   type: 'contains';
//   value: string;
// };

export type Filter = EqualsFilter;
// export type Filter = EqualsFilter | ContainsFilter;
