// Suggestion: Add JSDoc comments to the interface and its properties to explain the structure and purpose of the response.
export default interface TubeResponse<T> {
    data?: T;
    message?: string;
    status: "success" | "error";
}
