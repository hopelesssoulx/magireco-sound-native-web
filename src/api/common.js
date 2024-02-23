import { request } from "@/utils/request";

export const getList = () => {
  return request.get("/getList");
};

export const getFile = (fileName) => {
  return request.get("/getFile/" + fileName, { responseType: "blob" });
};
