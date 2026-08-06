import { api } from "./api";

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/uploads", formData);
  return data; // { url, name }
}
