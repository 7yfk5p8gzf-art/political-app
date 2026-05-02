export type Role = 'superadmin' | 'admin' | 'reviewer' | 'editor';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  password?: string;
};
