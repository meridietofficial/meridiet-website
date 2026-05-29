const ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login:    '/auth/login',
  },
  dietForm: {
    submit: '/diet-form',
  },
  user: {
    profile:        '/user/profile',
    updateAvatar:   '/user/avatar',
    changePassword: '/user/change-password',
  },
} as const

export default ENDPOINTS
