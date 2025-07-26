namespace ASafariM.Api.DTOs
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public Dictionary<string, string[]>? Errors { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public int StatusCode { get; set; }

        public static ApiResponse<T> SuccessResult(T data, string message = "Success", int statusCode = 200)
        {
            return new ApiResponse<T>
            {
                Success = true,
                Message = message,
                Data = data,
                StatusCode = statusCode,
                Timestamp = DateTime.UtcNow
            };
        }

        public static ApiResponse<T> ErrorResult(string message, Dictionary<string, string[]>? errors = null, int statusCode = 400)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                Errors = errors,
                StatusCode = statusCode,
                Timestamp = DateTime.UtcNow
            };
        }
    }

    public class PaginatedResponse<T> : ApiResponse<List<T>>
    {
        public PaginationInfo Pagination { get; set; } = new PaginationInfo();

        public static PaginatedResponse<T> SuccessResult(
            List<T> data, 
            int currentPage, 
            int totalPages, 
            int totalCount, 
            int pageSize,
            string message = "Success")
        {
            return new PaginatedResponse<T>
            {
                Success = true,
                Message = message,
                Data = data,
                StatusCode = 200,
                Timestamp = DateTime.UtcNow,
                Pagination = new PaginationInfo
                {
                    CurrentPage = currentPage,
                    TotalPages = totalPages,
                    TotalCount = totalCount,
                    PageSize = pageSize,
                    HasNextPage = currentPage < totalPages,
                    HasPreviousPage = currentPage > 1
                }
            };
        }
    }

    public class PaginationInfo
    {
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
        public int TotalCount { get; set; }
        public int PageSize { get; set; }
        public bool HasNextPage { get; set; }
        public bool HasPreviousPage { get; set; }
    }

    public class ApiError
    {
        public string? Field { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? Code { get; set; }
    }

    public class ValidationError
    {
        public string Field { get; set; } = string.Empty;
        public List<string> Messages { get; set; } = new List<string>();
    }
}
