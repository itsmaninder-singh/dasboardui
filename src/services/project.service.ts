import { projectRepository } from "../repositories/project.repository";
import { userRepository } from "../repositories/user.repository";
import { clientRepository } from "../repositories/client.repository";
import { ApiError } from "../utils/ApiError";
import { Prisma, Role } from "@prisma/client";
import { joinManagerToProjectRoom } from "../socket/index";

interface RequestingUser {
  id: string;
  role: Role;
}

async function assertProjectAccess(projectId: string, requester: RequestingUser) {
  const project = await projectRepository.findById(projectId);
  if (!project) throw ApiError.notFound("Project not found");

  if (requester.role === "ADMIN") return project;

  if (requester.role === "PROJECT_MANAGER") {
    if (project.managerId !== requester.id) {
      
      throw ApiError.notFound("Project not found");
    }
    return project;
  }

  throw ApiError.forbidden("You do not have permission to access this project");
}

export const projectService = {
  async createProject(
    input: { name: string; description?: string; clientId: string; managerId?: string },
    requester: RequestingUser
  ) {
    const client = await clientRepository.findById(input.clientId);
    if (!client) throw ApiError.badRequest("Client does not exist", "CLIENT_NOT_FOUND");

    
    let managerId: string;
    if (requester.role === "ADMIN") {
      managerId = input.managerId ?? requester.id;
      const manager = await userRepository.findById(managerId);
      if (!manager || manager.role !== "PROJECT_MANAGER") {
        throw ApiError.badRequest("managerId must belong to an active PROJECT_MANAGER", "INVALID_MANAGER");
      }
    } else {
      managerId = requester.id;
    }

    const project = await projectRepository.create({
      name: input.name,
      description: input.description,
      client: { connect: { id: input.clientId } },
      manager: { connect: { id: managerId } },
    } as Prisma.ProjectCreateInput);

    await joinManagerToProjectRoom(managerId, project.id);

    return project;
  },

  async listProjects(requester: RequestingUser, page: number, limit: number) {
    const where: Prisma.ProjectWhereInput =
      requester.role === "ADMIN" ? {} : { managerId: requester.id };

    const [projects, total] = await projectRepository.list(where, (page - 1) * limit, limit);
    return { projects, total, page, limit };
  },

  async getProjectById(projectId: string, requester: RequestingUser) {
    return assertProjectAccess(projectId, requester);
  },

  async updateProject(
    projectId: string,
    data: { name?: string; description?: string; clientId?: string },
    requester: RequestingUser
  ) {
    await assertProjectAccess(projectId, requester);
    return projectRepository.update(projectId, data);
  },

  async deleteProject(projectId: string, requester: RequestingUser) {
    await assertProjectAccess(projectId, requester);
    return projectRepository.delete(projectId);
  },

  
  assertProjectAccess,
};
