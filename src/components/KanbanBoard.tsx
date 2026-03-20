"use client";

import { useState, useEffect } from "react";

interface Task {
  id: string;
  title: string;
  status: "todo" | "in-progress" | "done";
  created_at?: string;
  updated_at?: string;
}

export default function KanbanBoard({ userId }: { userId?: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({ title: "" });
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error(await res.text());
      setTasks(await res.json());
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTask.title.trim() || !userId) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTask.title }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setTasks([data, ...tasks]);
      setNewTask({ title: "" });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const moveTask = async (taskId: string, newStatus: Task["status"]) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
      if (!res.ok) throw new Error(await res.text());
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error("Error moving task:", error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, _delete: true }),
      });
      if (!res.ok) throw new Error(await res.text());
      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const getTasksByStatus = (status: Task["status"]) =>
    tasks.filter((task) => task.status === status);

  const columns = [
    { id: "todo", title: "To Do", color: "bg-red-500/10" },
    { id: "in-progress", title: "In Progress", color: "bg-yellow-500/10" },
    { id: "done", title: "Done", color: "bg-green-500/10" },
  ] as const;

  if (loading) {
    return (
      <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 border border-white/50">
        <div className="flex items-center justify-center h-64">
          <div className="text-white/60">Loading tasks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/50">
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-xl font-semibold text-white ml-1 mt-2">
          {showAddForm ? "Add Task" : ""}
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-black/20 hover:bg-black/30 backdrop-blur-md border border-white/30 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
        >
          {showAddForm ? <span className="text-lg">-</span> : <span>Add</span>}
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 bg-black/20 rounded-lg border border-white/20">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              className="w-full px-4 py-2 bg-black/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-center">
              <button
                onClick={addTask}
                className="bg-black/20 hover:bg-black/30 backdrop-blur-md border border-white/30 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <div
            key={column.id}
            className="space-y-4"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const taskId = e.dataTransfer.getData("text/plain");
              moveTask(taskId, column.id as Task["status"]);
            }}
          >
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-white">
                {column.title}
              </h3>
              <span className="text-white/60 text-sm">
                ({getTasksByStatus(column.id as Task["status"]).length})
              </span>
            </div>

            <div
              className={`space-y-3 min-h-[200px] p-4 rounded-lg ${column.color} border border-white/30`}
            >
              {getTasksByStatus(column.id as Task["status"]).map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", task.id);
                  }}
                  className="bg-white/5 p-4 rounded-lg border border-white/20 hover:bg-white/10 transition-colors cursor-move"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-2">
                        {task.title}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      {column.id !== "todo" && (
                        <button
                          onClick={() =>
                            moveTask(
                              task.id,
                              column.id === "in-progress" ? "todo" : "in-progress"
                            )
                          }
                          className="text-white/60 hover:text-white text-sm p-1"
                          title="Move left"
                        >
                          ←
                        </button>
                      )}
                      {column.id !== "done" && (
                        <button
                          onClick={() =>
                            moveTask(
                              task.id,
                              column.id === "todo" ? "in-progress" : "done"
                            )
                          }
                          className="text-white/60 hover:text-white text-sm p-1"
                          title="Move right"
                        >
                          →
                        </button>
                      )}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-red-400 hover:text-red-300 text-lg p-1 mt-1"
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
