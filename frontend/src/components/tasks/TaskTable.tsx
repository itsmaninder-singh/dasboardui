import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";
import { Task } from "../../types/task";
import { StatusBadge, PriorityBadge } from "../common/Badge";

interface TaskTableProps {
  tasks: Task[];
}

export const TaskTable: React.FC<TaskTableProps> = ({ tasks }) => {
  return (
    <div className="bg-graphite-card border border-graphite-border rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-graphite-border bg-obsidian-850/80 text-[10px] font-mono uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4">Task Order</th>
              <th className="py-3 px-4">Project</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Assignee</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-graphite-border/60 text-xs">
            {tasks.map((task) => {
              const isOverdue =
                task.dueDate &&
                new Date(task.dueDate).getTime() < Date.now() &&
                task.status !== "DONE";

              return (
                <tr
                  key={task.id}
                  className="hover:bg-graphite-elevated/80 transition-colors group"
                >
                  <td className="py-3 px-4 font-medium text-slate-100 max-w-xs">
                    <Link
                      to={`/tasks/${task.id}`}
                      className="hover:text-amber-300 transition-colors line-clamp-1 block"
                    >
                      {task.title}
                    </Link>
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {task.project?.name || "—"}
                  </td>

                  <td className="py-3 px-4">
                    <StatusBadge status={task.status} size="sm" />
                  </td>

                  <td className="py-3 px-4">
                    <PriorityBadge priority={task.priority} size="sm" />
                  </td>

                  <td className="py-3 px-4 text-slate-300">
                    {task.assignedDeveloper?.name || (
                      <span className="text-slate-600 font-mono italic">Unassigned</span>
                    )}
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px]">
                    {task.dueDate ? (
                      <span className={isOverdue ? "text-rose-400 font-bold" : "text-slate-400"}>
                        {new Date(task.dueDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/tasks/${task.id}`}
                      className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors inline-block"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
