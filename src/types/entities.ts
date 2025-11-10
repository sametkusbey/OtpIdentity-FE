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
  companyTypeId: Guid;
  cityId: Guid;
  cityName: string;
  districtId: Guid;
  districtName: string;
  companyPhoneNumber: string;
  companyEmailAddress: string;
  dealerCode?: string | null;
  isCustomer: boolean;
  parentDealerId?: Guid | null;
  userIds: Guid[];
};

export type CompanyTypeDto = BaseEntity & {
  code: string;
  name: string;
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
  Day = 1,    // Günlük
  Month = 2,  // Aylık
  Year = 3    // Yıllık
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
  connectionTypeId: Guid;
  parameter1?: string | null;
  parameter2?: string | null;
  parameter3?: string | null;
  parameter4?: string | null;
  parameter5?: string | null;
};

export type ConnectionTypeDto = BaseEntity & {
  code: string;
  name: string;
  parameter1Name?: string | null;
  parameter2Name?: string | null;
  parameter3Name?: string | null;
  parameter4Name?: string | null;
  parameter5Name?: string | null;
};

export type CountryDto = BaseEntity & {
  code: string;
  name: string;
};

export type CityDto = BaseEntity & {
  countryId: Guid;
  name: string;
  plateCode?: string | null;
};

export type DistrictDto = BaseEntity & {
  cityId: Guid;
  name: string;
};

export type CompanyAddressDto = BaseEntity & {
  dealerId: Guid;
  addressName: string;
  countryId: Guid;
  countryName: string;
  cityId: Guid;
  cityName: string;
  districtId: Guid;
  districtName: string;
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
