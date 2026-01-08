import { revalidatePath as nextRevalidatePath } from "next/cache";

export function revalidatePath(path: string, type?: "page" | "layout") {
  try {
    nextRevalidatePath(path, type);
  } catch (error) {
    console.warn(`Failed to revalidate path ${path}:`, error);
  }
}
