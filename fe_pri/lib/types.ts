// =================================================================
// Frontend types khớp 1-1 với DTO của backend Spring Boot.
// =================================================================

// ---------- AUTH ----------

export type LoginRequest = {
  email: string;
  password: string;
};

// BUG17 FIX: LoginResponse khớp đúng với JwtResponse.java backend
// Backend trả: { token, id, email, fullName, avatarUrl, role }
export type LoginResponse = {
  token: string;
  id: number;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: string;
  // Alias cho backward compatibility
  loginName?: string;
};

export type RegisterRequest = {
  loginName: string;
  password: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
};

export type VerifyOtpRequest = {
  email: string;
  otpCode: string;
};

export type ResetPasswordRequest = {
  email: string;
  otpCode: string;
  newPassword: string;
};

/** POST /api/auth/social-login - body */
export type SocialLoginRequest = {
  provider: 'GOOGLE' | 'OFFICE365';
  token: string;
};

// ---------- USER PROFILE ----------

// BUG18 FIX: UserProfile khớp với User.java entity backend
// Backend /api/users/me trả các field: email, fullName, phoneNumber, identityNumber,
// avatarUrl, roleName, status, accountId
export type UserProfile = {
  accountId?: number;
  email: string;
  /** loginName = email (backward compat) */
  loginName?: string;
  fullName: string;
  phoneNumber?: string;
  identityNumber?: string;
  avatarUrl?: string;
  roleName: string;
  status: string;
  readerType?: string;
};

export type UpdateProfileRequest = {
  fullName: string;
  phoneNumber?: string;
};

export type ChangePasswordRequest = {
  oldPassword: string;
  newPassword: string;
};

// ---------- BOOK TITLE ----------

export type BookTitle = {
  id: number;
  title: string;
  isbn?: string;
  publicationYear: number;
  description: string;
  price?: number;
  coverImage?: string;
  categoryNames?: string[];
  authorNames?: string[];
  publisherNames?: string[];

  coverImageUrl?: string;
  authors?: { id: number; name: string }[];
  categories?: { id: number; name: string; description?: string; parentId?: number }[];
  publisher?: { id: number; name: string; address?: string; contactInfo?: string };
  shelf?: { id: number; name: string; location?: string; maxCapacity?: number; currentCapacity?: number };

  authorIds?: number[];
  categoryIds?: number[];
  publisherIds?: number[];

  availableCopies?: number;
};

// ---------- BOOK COPY ----------

export type BookCopy = {
  id: number;
  copyCode: string;
  status: BookCopyStatus;
  damagePercent?: number;
  dateAdded?: string;
  book?: { id: number; title: string };
};

export type BookCopyStatus =
  | 'AVAILABLE'
  | 'BORROWED'
  | 'RESERVED'
  | 'LOST'
  | 'DAMAGED'
  | 'MAINTENANCE';

// ---------- BORROW TICKET ----------

// BUG1 FIX: BorrowTicket khớp đúng với BorrowTicket.java entity backend
export type BorrowTicket = {
  id: number;
  borrowCode: string;
  status: BorrowStatus;
  borrowDate: string;
  pickupDeadline: string;
  pickupDate: string | null;
  dueDate: string | null;
  returnDate: string | null;
  renewCount: number;
  depositAmount: number;
  user: {
    id: number;
    email: string;
    fullName: string;
    roleName?: string;
  };
  bookCopy: {
    id: number;
    copyCode: string;
    status: BookCopyStatus;
    damagePercent?: number;
    book: {
      id: number;
      title: string;
      isbn?: string;
      price?: number;
      coverImageUrl?: string;
    };
  };
};

export type BorrowStatus =
  | 'PENDING_PICKUP'
  | 'BORROWED'
  | 'RETURNED'
  | 'CANCELED';

// ---------- CATEGORY / AUTHOR / PUBLISHER / SHELF ----------

export type Category = {
  id: number;
  name: string;
  description: string;
  parentId?: number;
  children?: Category[];
};

export type Author = {
  id: number;
  name: string;
  biography: string;
};

export type Publisher = {
  id: number;
  name: string;
  address: string;
  contactInfo: string;
};

export type ShelfLocation = {
  id: number;
  name: string;
  location: string;
  description: string;
  maxCapacity: number;
  currentCapacity: number;
};

// ---------- ROLE CONSTANTS ----------

export const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  LIBRARIAN: 'ROLE_LIBRARIAN',
  ACCOUNTANT: 'ROLE_ACCOUNTANT',
  WAREHOUSE_MANAGER: 'ROLE_WAREHOUSE_MANAGER',
  INTERNAL_READER: 'ROLE_INTERNAL_READER',
  EXTERNAL_READER: 'ROLE_EXTERNAL_READER'
} as const;

// ---------- SPRING PAGE WRAPPER ----------

/** Khớp với Spring Data PageImpl JSON format */
export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;     // current page index (0-based)
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type RoleName = (typeof ROLES)[keyof typeof ROLES];