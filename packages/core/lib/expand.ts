export const getExpandedAssociations = (expand: string | undefined) => {
  if (!expand) {
    return [];
  }
  return expand.split(',');
};
