import { z } from "zod";
import { groupSchema, newGroupSchema } from "../schemas/groups";

export type Group = z.infer<typeof groupSchema>
export type NewGroup = z.infer<typeof newGroupSchema>
  