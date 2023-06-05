export const getFullName = (firstName?: string | null, lastName?: string | null): string | null => {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  if (firstName) {
    return firstName;
  }
  if (lastName) {
    return lastName;
  }
  return null;
};
