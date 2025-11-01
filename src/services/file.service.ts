import apiClient from "../lib/axios";

export interface FileUploadResponse {
  file: {
    id: string;
    path: string;
  };
}

export interface PhotoReference {
  id: string;
}

/**
 * Upload a file to the server
 * @param file - The file to upload
 * @returns Promise with the uploaded file details
 */
export const uploadFile = async (file: File): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post<FileUploadResponse>(
    "/files/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};

/**
 * Update user profile with photo
 * @param photoId - The ID of the uploaded photo
 * @returns Promise with updated user data
 */
export const updateUserPhoto = async (photoId: string) => {
  const { data } = await apiClient.patch("/auth/me", {
    photo: { id: photoId },
  });

  return data;
};

/**
 * Update user profile
 * @param updates - Partial user data to update
 * @returns Promise with updated user data
 */
export const updateUserProfile = async (updates: any) => {
  const { data } = await apiClient.patch("/auth/me", updates);
  return data;
};
