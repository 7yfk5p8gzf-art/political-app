import { User } from '@/types/user';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Bálint Ipkovich',
    email: 'foadmin@app.hu',
    password: 'demo123',
    role: 'superadmin',
  },
  {
    id: '2',
    name: 'Admin 2',
    email: 'admin2@app.hu',
    password: 'demo123',
    role: 'admin',
  },
  {
    id: '3',
    name: 'Reviewer 1',
    email: 'reviewer@app.hu',
    password: 'demo123',
    role: 'reviewer',
  },
  {
    id: '4',
    name: 'Editor 1',
    email: 'editor@app.hu',
    password: 'demo123',
    role: 'editor',
  },
];
