import { request } from "@/utils/request";

export const getList = () => {
  return request.get("/getList");
};
export const getListBrief = () => {
  return request.get("/getListBrief");
};
export const getListBriefFull = () => {
  return request.get("/getListBriefFull");
};
export const getMovie = () => {
  return request.get("/getMovie");
};

export const getListBgm = (params) => {
  return request.get("/getListBgm/" + params);
};
export const getListFullvoice = (params) => {
  return request.get("/getListFullvoice/" + params);
};
export const getListVoice = (params) => {
  return request.get("/getListVoice/" + params);
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
