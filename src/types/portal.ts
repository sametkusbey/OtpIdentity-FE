export type Result<T> = {
  succeeded: boolean;
  message?: string;
  errors?: string[];
  data?: T;
  // Backward compatibility
  isSuccess?: boolean;
};

export type AuthAccountDto = {
  id: string;
  username: string;
  isActive: boolean;
  isAdmin: boolean;
  dealerCode?: string | null;
  createdDate?: string;
};

export type PortalAccountListItemDto = {
  id: string;
  username: string;
  createdDate: string;
  isActive: boolean;
  dealerCode?: string | null;
};

export type PortalMenuDto = {
  id: string;
  menuCode: string;
  menuName: string;
};

export type AuthLoginResponseDto = {
  id: string;
  username: string;
  isActive: boolean;
  isAdmin: boolean;
  menus: PortalMenuDto[];
  dealerCode?: string | null;
};

export type AuthLoginWithTokenResponseDto = {
  id: string;
  username: string;
  isActive: boolean;
  isAdmin: boolean;
  menus: PortalMenuDto[];
  token?: string;
  dealerCode?: string | null;
};
