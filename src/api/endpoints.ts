const ENDPOINTS = {
  auth: {
    register:       '/auth/register',
    login:          '/auth/login',
    google:         '/auth/google',
    forgotPassword: '/auth/forgot-password',
    resetPassword:  '/auth/reset-password',
  },
  dietForm: {
    submit: '/diet-form',
    myAll:  '/diet-form/my/all',
  },
  user: {
    profile:        '/user/profile',
    updateAvatar:   '/user/avatar',
    changePassword: '/user/change-password',
  },
  dietitian: {
    register:        '/dietitian/register',
    profile:         '/dietitian/profile',
    changePassword:  '/dietitian/change-password',
    onlineStatus:    '/dietitian/online-status',
    awsKeys:         '/aws-keys/',   // replace with your actual endpoint
    specializations: '/dietitians/specializations',
    list:            '/dietitians',
  },
  consultation: {
    fee: '/consultation-fee',
  },
  payment: {
    createOrder: '/payment/create-order',
    verify:      '/payment/verify',
    failed:      '/payment/failed',
  },
  wallet: {
    balance:      '/wallet/balance',
    transactions: '/wallet/transactions',
  },
  dietPlan: {
    subscriptionStatus: '/diet-plan/subscription-status',
    redeemMonth:        '/diet-plan/redeem-month',
    get:                '/diet-plan',
  },
  appointment: {
    slots:          '/appointments/slots',
    createOrder:    '/appointments/create-order',
    verify:         '/appointments/verify',
    failed:         '/appointments/failed',
    my:             '/appointments/my',
    dietitianList:  '/appointments/dietitian',
    updateStatus:   '/appointments',           // used as /appointments/:id/status
    clientsList:    '/appointments/clients',
    dietitianSessions: '/appointments/dietitian/sessions',
    joinCall:          '/appointments',   // used as /appointments/:id/join-call
    leaveCall:         '/appointments',   // used as /appointments/:id/leave-call
    recording:         '/appointments',   // used as /appointments/:id/recording
    dashboardStats:    '/appointments/dietitian/dashboard',
  },
  contact: {
    submit: '/contact',
  },
} as const

export default ENDPOINTS
