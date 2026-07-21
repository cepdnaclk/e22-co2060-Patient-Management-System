import api from "./axiosClient";

export const fileUploadService = {
  async uploadFile(file) {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/api/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  getFileUrl(fileName) {
    if (!fileName) return null;
    if (fileName.startsWith("http")) return fileName;
    const baseUrl = api.defaults.baseURL || "";
    return `${baseUrl}/api/files/${fileName}`;
  },

  isImage(fileName) {
    if (!fileName) return false;
    const lower = fileName.toLowerCase();
    return lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".gif");
  },

  isPdf(fileName) {
    if (!fileName) return false;
    return fileName.toLowerCase().endsWith(".pdf");
  },
};
