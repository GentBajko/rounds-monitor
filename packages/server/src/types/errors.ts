export type AppError =
  | { readonly code: "NOT_FOUND"; readonly message: string }
  | { readonly code: "DUPLICATE"; readonly message: string }
  | { readonly code: "INVALID_URL"; readonly message: string }
  | { readonly code: "CAPTURE_FAILED"; readonly message: string }

export const errorToStatus = (error: AppError): number => {
  switch (error.code) {
    case "NOT_FOUND": return 404
    case "DUPLICATE": return 409
    case "INVALID_URL": return 400
    case "CAPTURE_FAILED": return 502
  }
}
