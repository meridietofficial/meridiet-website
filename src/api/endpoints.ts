const ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login:    '/auth/login',
    google:   '/auth/google',
  },
  dietForm: {
    submit: '/diet-form',
  },
  user: {
    profile:        '/user/profile',
    updateAvatar:   '/user/avatar',
    changePassword: '/user/change-password',
  },
  dietitian: {
    register: '/dietitian/register',
    awsKeys:  '/aws-keys/',   // replace with your actual endpoint
  },
} as const

export default ENDPOINTS
