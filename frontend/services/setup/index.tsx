export const uploadFile = async (supplierId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
  
    const res = await fetch(
      `http://localhost:8000/suppliers/${supplierId}/upload_pdf_summary`,
      { method: "POST", body: formData }
    );
    if (!res.ok) {
      throw new Error(`Upload failed with status ${res.status}`);
    }
    return await res.json();
  };
  
  export const updateProfile = async (supplierId: string, data: any) => {
    const res = await fetch(
      `http://localhost:8000/suppliers/${supplierId}/profile`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );
    if (!res.ok) {
      throw new Error(`Profile update failed with status ${res.status}`);
    }
    return await res.json();
  };
  
  export const updateAvailability = async (supplierId: string, slotsPayload: any[]) => {
    const res = await fetch(
      `http://localhost:8000/suppliers/${supplierId}/availability`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slotsPayload),
      }
    );
    if (!res.ok) {
      throw new Error(`Availability update failed with status ${res.status}`);
    }
    return await res.json();
  };
  