import { setAnalytics, setLoading, setError } from "./adminSlice";
import { getAnalyticsApi } from "../../api/adminApi";

export const fetchAnalyticsThunk = () => {
  return async (dispatch) => {
    dispatch(setLoading(true));

    try {
      const response = await getAnalyticsApi();

      dispatch(setAnalytics(response.data.data));

      console.log(response.data.data);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch analytics";

      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false))
    }
  };
};