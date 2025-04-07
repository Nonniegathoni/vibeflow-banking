export interface User {
    id: number;
    email: string;
    password: string; 
    first_name: string;
    last_name: string;
    role: string;
    created_at: Date;
    updated_at: Date;
  }