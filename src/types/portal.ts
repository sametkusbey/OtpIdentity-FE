export type Result<T> = {
  succeeded: boolean;
  message?: string;
  errors: string[];
  data?: T;
};

export type AuthAccountDto = {
  id: string;
  username: string;
  isActive: boolean;
};

export type PortalAccountListItemDto = {
  id: string;
  username: string;
  createdDate: string;
  isActive: boolean;
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
  menus: PortalMenuDto[];
};

export type AuthLoginWithTokenResponseDto = {
  id: string;
  username: string;
  isActive: boolean;
  menus: PortalMenuDto[];
  token?: string;
};
