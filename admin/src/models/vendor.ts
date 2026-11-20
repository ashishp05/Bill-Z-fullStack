export interface IVendorModal {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  businessName?: string | null;
  phoneCountry?: string | null;
  phoneNumber?: string | null;
  phone?: string | null;
  profilePicture?: string | null;
  profilePictureUrl?: string | null;
  active: boolean;
  createdAt?: string;
  _createdAt?: string;
  updatedAt?: string;
}

export interface IVendorListResponse {
  total?: number;
  records: IVendorModal[];
}

export interface IVendorFilter {
  name: string;
  email: string;
  status: string;
}
