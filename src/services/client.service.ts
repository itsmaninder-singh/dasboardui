import { clientRepository } from "../repositories/client.repository";
import { ApiError } from "../utils/ApiError";

export const clientService = {
  // Client management is ADMIN-only (enforced by route middleware).
  async createClient(data: { name: string; email?: string; company?: string }) {
    return clientRepository.create(data);
  },

  async listClients(page: number, limit: number) {
    const [clients, total] = await clientRepository.list((page - 1) * limit, limit);
    return { clients, total, page, limit };
  },

  async getClientById(id: string) {
    const client = await clientRepository.findById(id);
    if (!client) throw ApiError.notFound("Client not found");
    return client;
  },

  async updateClient(id: string, data: { name?: string; email?: string; company?: string }) {
    const client = await clientRepository.findById(id);
    if (!client) throw ApiError.notFound("Client not found");
    return clientRepository.update(id, data);
  },

  async deleteClient(id: string) {
    const client = await clientRepository.findById(id);
    if (!client) throw ApiError.notFound("Client not found");
    return clientRepository.delete(id);
  },
};
