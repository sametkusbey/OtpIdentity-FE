export const primaryColor = '#06923e';
export const secondaryColor = '#333446';
export const backgroundColor = '#f5f7fb';

export const themeTokens = {
  token: {
    colorPrimary: primaryColor,
    colorInfo: primaryColor,
    colorSuccess: primaryColor,
    colorLink: primaryColor,
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    borderRadius: 10,
    colorBgLayout: backgroundColor,
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      triggerBg: secondaryColor,
      triggerColor: '#ffffff',
      siderBg: secondaryColor,
    },
    Menu: {
      darkItemBg: 'transparent',
      darkSubMenuItemBg: 'transparent',
      darkItemSelectedBg: 'rgba(6, 146, 62, 0.2)',
      itemSelectedColor: primaryColor,
    },
    Button: {
      colorPrimary: primaryColor,
      colorPrimaryHover: '#058438',
      colorPrimaryActive: '#04722f',
    },
  },
};
