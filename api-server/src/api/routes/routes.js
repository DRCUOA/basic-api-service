import express from "express";

export default function routes({ taskController }) {
  const router = express.Router();

  router.get("/tasks", taskController.listTasks);
  router.post("/tasks", taskController.createTask);
  router.patch("/tasks/:id", taskController.updateTasks);
  router.delete("/tasks/:id", taskController.deleteTasks);

  return router;
}
