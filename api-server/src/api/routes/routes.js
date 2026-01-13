import { Router } from "express";
import {
  createTask,
  listTasks,
  updateTasks,
  deleteTasks
} from "../controllers/taskController.js";

const router = Router();

router.get("/tasks", listTasks);
// router.post("/tasks", createTask);
// router.patch("/tasks/:id", updateTasks);
// router.delete("/tasks/:id", deleteTasks);

export default router;