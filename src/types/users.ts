import { z } from "zod";
import { signInSchema } from "../schemas/users";

export type User = z.infer<typeof signInSchema>