export const ResponseMessages = Object.freeze({
  // Generic & Helper Responses
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  FETCHED: 'Fetched successfully',
  HEALTH_CHECK_PASSED: 'Health check passed',
  READINESS_CHECK_PASSED: 'Readiness check passed',

  // Auth & User Responses
  LOGIN_SUCCESSFUL: 'Logged in successfully',
  LOGOUT_SUCCESSFUL: 'Logged out successfully',
  REGISTRATION_SUCCESSFUL: 'Registered successfully',
  TOKEN_REFRESHED: 'Tokens refreshed successfully',
  PROFILE_FETCH_SUCCESS: 'Profile fetched successfully',
  PROFILE_UPDATED_SUCCESS: 'Profile updated successfully',
  STATUS_UPDATED_SUCCESS: 'Status updated successfully',
  PASSWORD_CHANGED_SUCCESS: 'Password changed successfully',
  PASSWORD_RESET_EMAIL_SENT: 'If an account exists, password reset instructions have been sent.',
});

export const ValidationMessages = Object.freeze({
  // Generic / System errors
  SOMETHING_WENT_WRONG: 'Something went wrong',
  INVALID_DATA: 'Received data is not valid',
  INVALID_USER_DATA: 'Invalid user data',
  RECORD_NOT_FOUND: 'Record not found',
  UNAUTHORIZED: 'Unauthorized request',
  NOT_ALLOWED: 'You are not allowed to perform this action',
  BAD_REQUEST: 'Bad request',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  ROUTE_NOT_FOUND: 'Route not found or wrong API method',
  TOO_MANY_REQUESTS: 'Too many requests, please try again later',
  ORIGIN_HEADER_IS_MISSING: 'Origin header is missing',
  ACCESS_FORBIDDEN: 'Access Forbidden',

  // Auth & User Errors
  INVALID_CREDENTIALS: 'Invalid credentials',
  USER_NOT_FOUND: 'User not found',
  USER_EXISTS_WITH_EMAIL: 'User already exists with the provided Email',
  USER_EXISTS_WITH_MOBILE: 'User already exists with the provided Mobile number',
  USER_EXISTS_WITH_EMAIL_MOBILE: 'User already exists with the provided Email and Mobile number',
  USERID_CANNOT_BE_BLANK: 'userId cannot be blank',
  ENTER_VALID_NAME: 'Please provide a valid name',
  ENTER_VALID_EMAIL: 'Please provide a valid email address',
  ENTER_VALID_MOBILE: 'Please provide a valid 10-digit mobile number',
  INVALID_EXPIRED_OTP: 'Invalid or expired OTP',
  PASSWORD_REQUIRED: 'Password is required',
  OLD_PASSWORD_INCORRECT: 'Current password is incorrect',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
  ACCOUNT_INACTIVE: 'Account is inactive or suspended',
  ACCOUNT_BLOCKED: 'Account is blocked',

  // Admin Errors
  ADMIN_NOT_FOUND: 'Admin not found',
  ADMIN_EXISTS_WITH_EMAIL: 'Admin already exists with the provided Email',

  // Vendor Errors
  VENDOR_NOT_FOUND: 'Vendor not found',
  VENDOR_EXISTS_WITH_EMAIL: 'Vendor already exists with the provided Email',

  // Product Errors
  PRODUCT_NOT_FOUND: 'Product not found',

  // Dynamic field helper functions
  required: (field: string) => `${field} is required`,
  invalid: (field: string) => `Invalid ${field}`,
  min: (field: string, length: number) => `${field} must be at least ${length} characters`,
  max: (field: string, length: number) => `${field} cannot exceed ${length} characters`,
  alreadyExists: (field: string) => `${field} already exists`,
  invalidFileType: (field: string, allowed: string) =>
    `Invalid file type for '${field}'. Allowed types: ${allowed}`,
  fileSizeExceeded: (field: string, limitMB: string) =>
    `File size for '${field}' exceeds maximum limit of ${limitMB}MB`,
  uploadError: (msg: string) => `File upload failed: ${msg}`,
});
