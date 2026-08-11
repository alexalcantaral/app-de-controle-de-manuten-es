import { api } from "./api";
import { Dashboard } from "../types";

export const dashboardService = {
  buscarMetricas: async () => {
    const { data } = await api.get<Dashboard>("/dashboard");
    return data;
  },
};
