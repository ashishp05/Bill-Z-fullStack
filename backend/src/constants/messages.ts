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
  ACCOUNT_FOUND: 'Account found',
  OTP_SENT: 'Verification code sent',
  OTP_VERIFIED: 'Verification successful',
  SETTINGS_FETCHED: 'Settings fetched successfully',
  SETTINGS_UPDATED: 'Settings updated successfully',
  INVOICE_CREATED: 'Invoice created successfully',
  PAYMENT_STATUS_UPDATED: 'Payment status updated successfully',
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
  PRODUCT_INACTIVE: 'One or more products are inactive or do not belong to you',
  INVALID_GST_RATE: 'GST rate must be one of 0, 5, 12, 18 or 28',
  INVALID_HSN: 'HSN/SAC code must be 4 to 8 digits',
  WHOLE_RUPEES: 'Amount must be a whole number of rupees',

  // Catalog Errors
  CATEGORY_NOT_FOUND: 'Category not found',
  BRAND_NOT_FOUND: 'Brand not found',

  // OTP & Account Errors
  ACCOUNT_NOT_FOUND:
    'We couldn’t find an account with these details. Business owners can register below.',
  ACCOUNT_AMBIGUOUS: 'This mobile number is linked to more than one account. Use your email.',
  REGISTER_WITH_EMAIL: 'Enter your email address to register your business.',
  ONLY_VENDORS_REGISTER: 'Only business owners can register. Customers are added by their vendor.',
  OTP_COOLDOWN: 'Please wait before requesting another code.',
  OTP_HOURLY_LIMIT: 'Too many codes requested. Please try again later.',
  OTP_REQUEST_NEW: 'Request a new verification code.',
  OTP_EXPIRED: 'This code has expired. Request a new code.',
  OTP_INVALID: 'That code is incorrect. Please try again.',
  OTP_ATTEMPTS_EXCEEDED: 'Attempt limit reached. Please request a new code.',
  OTP_SEND_FAILED: 'We could not send the verification code. Please try again.',
  ENTER_VALID_IDENTIFIER: 'Enter a valid email address or 10-digit mobile number.',
  ENTER_VALID_GSTIN: 'Enter a valid 15-character GSTIN',
  ENTER_VALID_PINCODE: 'Enter a valid 6-digit PIN code',

  // Customer Errors
  CUSTOMER_NOT_FOUND: 'Customer not found',
  CUSTOMER_ALREADY_ADDED: 'This customer is already in your customer list',

  // Invoice Errors
  INVOICE_NOT_FOUND: 'Invoice not found',
  INVOICE_ITEMS_REQUIRED: 'Add at least one product to the invoice',
  INVOICE_DUE_BEFORE_DATE: 'Due date cannot be before the invoice date',
  INVOICE_NUMBER_TOO_LOW: 'Next invoice number cannot be lower than the current sequence',
  PAYMENT_MODE_REQUIRED: 'Payment mode is required when marking an invoice as paid',
  INVALID_DATE: 'Date must be in YYYY-MM-DD format',
  DUPLICATE_RECORD: 'A record with these details already exists',

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
