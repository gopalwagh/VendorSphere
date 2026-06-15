import axiosInstance from "./axios";

export const fetchAllCouponsApi = () => {
  const response =  axiosInstance.get("/coupons")
  return response;
}

export const applyCouponApi = ( couponCode ) => {
  return axiosInstance.post("/coupons/apply",{
    couponCode,
  });
};

export const createCouponApi = async( couponData ) => {
  const response = await axiosInstance.post(
    "/coupons/create", {
      code: couponData.code,
      discountPercent: couponData.discountPercent,
      expiresAt: couponData.expiresAt,
      minimumAmount: couponData.minimumAmount,
    }
  );
  return response;
}

export const deleteCouponApi = async( couponId ) => {
  return await axiosInstance.delete(
    `/coupons/${couponId}`
  )
}