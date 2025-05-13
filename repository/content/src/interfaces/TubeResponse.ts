export default interface TubeResponse<T> {
  data?: T;
  message?: string;
  status: "success" | "error";
}
