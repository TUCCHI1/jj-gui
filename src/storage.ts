const STORAGE_KEY = "jj-gui:last-repo";

export const saveLastRepo = (path: string) => {
  localStorage.setItem(STORAGE_KEY, path);
};

export const loadLastRepo = (): string | undefined => {
  const value = localStorage.getItem(STORAGE_KEY);
  if (!value) return undefined;
  return value;
};
