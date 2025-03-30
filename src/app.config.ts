export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/login/index',
    'pages/appointment/index',
    'pages/profile/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png'
      },
      {
        pagePath: 'pages/appointment/index',
        text: '预约',
        iconPath: 'assets/icons/appointment.png',
        selectedIconPath: 'assets/icons/appointment-active.png'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/icons/profile.png',
        selectedIconPath: 'assets/icons/profile-active.png'
      }
    ],
    color: '#bfbfbf',
    selectedColor: '#2c2c2c',
    backgroundColor: '#ffffff',
    borderStyle: 'black'
  }
})
