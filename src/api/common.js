import { request } from "@/utils/request";

export const getList = () => {
  return request.get("/getList");
};

export const getFile = (fileName) => {
  return request.get("/getFile/" + fileName, { responseType: "blob" });
};

export const updateBgm = (body) => {
  return request.post("/updateBgm", body);
};

export const updateFullvoice = (body) => {
  return request.post("/updateFullvoice", body);
};

export const updateVoice = (body) => {
  return request.post("/updateVoice", body);
};
