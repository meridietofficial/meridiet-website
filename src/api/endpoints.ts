const ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login:    '/auth/login',
  },
  dietForm: {
    submit: '/diet-form',
  },
} as const

export default ENDPOINTS
