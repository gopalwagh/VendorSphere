import axiosInstance from "./axios";

export const updateUserProfileApi = async (userData) => {
  const response = await axiosInstance.patch("/auth/update-profile", userData);
  return response.data;
};

export const updateSellerProfileApi = async (sellerData) => {
  // Agar data pehle se FormData hai (jaise file upload ke waqt hota hai), toh direct bhejo
  if (sellerData instanceof FormData) {
    const response = await axiosInstance.put("/seller/profile", sellerData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  // AGAR DATA PLAIN OBJECT HAI ( abhi ja raha hai):
  // convert it formData
  const formData = new FormData();
  
  Object.keys(sellerData).forEach((key) => {
    if (sellerData[key] !== undefined && sellerData[key] !== null) {
      formData.append(key, sellerData[key]);
    }
  });

  // Ab header aur data dono match kar gaye!
  const response = await axiosInstance.put("/seller/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};