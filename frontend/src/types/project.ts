export interface Client {
  id: string;
  name: string;
  email?: string | null;
  company?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    projects?: number;
  };
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  clientId: string;
  client?: Client;
  managerId: string;
  manager?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  _count?: {
    tasks?: number;
  };
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  clientId: string;
  managerId?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  clientId?: string;
}

export interface CreateClientInput {
  name: string;
  email?: string;
  company?: string;
}

export interface UpdateClientInput {
  name?: string;
  email?: string;
  company?: string;
}
