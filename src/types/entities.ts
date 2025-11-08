export type Guid = string;

export type BaseEntity = {
  id: Guid;
  createdAt?: string;
  updatedAt?: string;
};

export type UserDto = BaseEntity & {
  name: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  isEmailVerified: boolean;
  isPhoneNumberVerified: boolean;
  identityNumber: string;
  dealerIds: Guid[];
  appIds: Guid[];
};

export type DealerDto = BaseEntity & {
  taxIdentifierNumber: string;
  title: string;
  companyType: number;
  city: string;
  district: string;
  companyPhoneNumber: string;
  companyEmailAddress: string;
  isCustomer: boolean;
  dealerCode?: string | null;
  userIds: Guid[];
};

export type AppDto = BaseEntity & {
  appCode: string;
  appName: string;
};

export type ProgramDto = BaseEntity & {
  programCode: string;
  programName: string;
};

export type ProgramVersionDto = BaseEntity & {
  programId: Guid;
  versionCode: string;
  versionName: string;
};

export type ProgramEditionDto = BaseEntity & {
  programVersionId: Guid;
  editionCode: string;
  editionName: string;
};

export enum RenewalPeriodType {
  Day = 1,
  Month = 2,
  Year = 3,
}

export type LicenseDto = BaseEntity & {
  dealerId: Guid;
  appId: Guid;
  startDate: string;
  endDate?: string | null;
  renewalPeriod: number;
  renewalPeriodType: RenewalPeriodType;
  isAutoRenewed: boolean;
  isLocked: boolean;
};

export type AuthorizationDto = BaseEntity & {
  userId: Guid;
  appId: Guid;
  dealerId: Guid;
};

export type ConnectionDto = BaseEntity & {
  programId: Guid;
  programVersionId: Guid;
  appId: Guid;
  dealerId: Guid;
  connectionType: string;
  parameter1?: string | null;
  parameter2?: string | null;
  parameter3?: string | null;
  parameter4?: string | null;
  parameter5?: string | null;
};

export type CompanyAddressDto = BaseEntity & {
  dealerId: Guid;
  addressName: string;
  country: string;
  city: string;
  district: string;
  town?: string | null;
  street: string;
  zipCode: string;
  apartmentName?: string | null;
  apartmentNumber?: string | null;
  doorNumber?: string | null;
  emailAddress?: string | null;
  website?: string | null;
  isEInvoiceTaxpayer: boolean;
  eInvoiceTransitionDate?: string | null;
  eInvoiceAlias?: string | null;
  isEWaybillTaxpayer: boolean;
  eWaybillTransitionDate?: string | null;
  eWaybillAlias?: string | null;
};

export type CompanyRepresentativeDto = BaseEntity & {
  dealerId: Guid;
  name: string;
  lastName: string;
  phoneNumber?: string | null;
  emailAddress?: string | null;
};

export type SelectOption = {
  label: string;
  value: Guid;
};
