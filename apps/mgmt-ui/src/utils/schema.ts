export const schemasEnabled = (allowList: string[], applicationId: string): boolean => {
  return process.env.NODE_ENV === 'development' || allowList.includes(applicationId);
};

export const entitiesEnabled = (allowList: string[], applicationId: string): boolean => {
  return process.env.NODE_ENV === 'development' || allowList.includes(applicationId);
};
