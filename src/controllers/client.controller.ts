import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/ApiResponse";
import { clientService } from "../services/client.service";

export const clientController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const client = await clientService.createClient(req.body);
    return sendSuccess(res, client, 201);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const result = await clientService.listClients(page, limit);
    return sendSuccess(res, result.clients, 200, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const client = await clientService.getClientById(req.params.id);
    return sendSuccess(res, client);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const client = await clientService.updateClient(req.params.id, req.body);
    return sendSuccess(res, client);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await clientService.deleteClient(req.params.id);
    return sendSuccess(res, { success: true });
  }),
};
