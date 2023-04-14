export const getExpandedAssociations = (expand: string | undefined): string[] => {
  if (!expand) {
    return [];
  }
  return expand.split(',');
};
