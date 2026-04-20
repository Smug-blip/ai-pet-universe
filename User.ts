export interface User {
  id: string;
  email: string;
  password_hash: string;
  username: string;
  created_at: Date;
  updated_at: Date;
}