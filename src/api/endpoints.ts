const ENDPOINTS = {
  auth: {
    register:       '/auth/register',
    login:          '/auth/login',
    google:         '/auth/google',
    forgotPassword: '/auth/forgot-password',
    resetPassword:  '/auth/reset-password',
    sendOtp:        '/auth/send-otp',
    verifyOtp:      '/auth/verify-otp',
    resendOtp:      '/auth/resend-otp',
  },
  dietForm: {
    create:  '/diet-form',            // POST   → create draft, returns form_id
    update:  '/diet-form',            // PUT    /:id → save step fields
    submit:  '/diet-form',            // POST   /:id/submit → finalize + trigger plan gen
    myAll:   '/diet-form/my/all',
  },
  user: {
    profile:        '/user/profile',
    updateAvatar:   '/user/avatar',
    changePassword: '/user/change-password',
  },
  dietitian: {
    register:          '/dietitian/register',
    profile:           '/dietitian/profile',
    changePassword:    '/dietitian/change-password',
    onlineStatus:      '/dietitian/online-status',
    syncOfflineSlots:  '/dietitian/sync-offline-slots',
    deleteAccount:     '/dietitian/account',
    awsKeys:           '/aws-keys',
    specializations:   '/dietitians/specializations',
    list:              '/dietitians',
  },
  dietitianRegistrationPayment: {
    createOrder: '/dietitian/register/create-order',
    verify:      '/dietitian/register/verify-payment',
    failed:      '/dietitian/register/failed',
    sendOtp:     '/dietitian/register/send-otp',
    verifyOtp:   '/dietitian/register/verify-otp',
  },
  consultation: {
    fee: '/consultation-fee',
  },
  coupons: {
    validate: '/coupons/validate',
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
    single:         '/appointments',             // used as /appointments/:id
    updateStatus:   '/appointments',             // used as /appointments/:id/status
    clientsList:    '/appointments/clients',
    dietitianSessions: '/appointments/dietitian/sessions',
    joinCall:          '/appointments',   // used as /appointments/:id/join-call
    leaveCall:         '/appointments',   // used as /appointments/:id/leave-call
    recording:         '/appointments',   // used as /appointments/:id/recording
    dashboardStats:    '/appointments/dietitian/dashboard',
    dietitianReviews:  '/appointments/dietitian/reviews',
    offlineCreate:     '/appointments/offline',
  },
  followUps: {
    list: '/follow-ups',
  },
  contact: {
    submit: '/contact',
  },
  course: {
    sendOtp:        '/course/send-otp',
    enquiry:        '/course/enquiry',
    enroll:         '/course/enroll',
    createOrder:    '/course/payment/create-order',
    verifyPayment:  '/course/payment/verify',
    failedPayment:  '/course/payment/failed',
  },
  accounts: {
    list: '/dietitian/accounts',
  },
  banks: {
    list: '/banks',
  },
  earnings: {
    summary:            '/dietitian/earnings/summary',
    monthlyRevenue:     '/dietitian/earnings/monthly-revenue',
    byPlan:             '/dietitian/earnings/by-plan',
    payout:             '/dietitian/earnings/payout',
    transactions:       '/dietitian/earnings/transactions',
    walletTransactions: '/dietitian/earnings/wallet-transactions',
    wallet:             '/dietitian/earnings/wallet',
  },
  dietitianDietPlan: {
    list:   '/dietitian/diet-forms',
    single: '/dietitian/diet-forms',  // used as /:id, /:id/generate, /:id/archive
  },
  manualDietPlan: {
    create: '/dietitian/diet-plans/manual',
    list:   '/dietitian/diet-plans/manual',
    // detail/update/generate/content reuse dietitianDietPlan.single (/dietitian/diet-forms/:id)
  },
  walletTopup: {
    createOrder: '/wallet/topup/create-order',
    verify:      '/wallet/topup/verify',
    failed:      '/wallet/topup/failed',
  },
  dietitianWalletRecharge: {
    createOrder: '/dietitian/wallet/recharge/create-order',
    verify:      '/dietitian/wallet/recharge/verify-payment',
    failed:      '/dietitian/wallet/recharge/failed',
  },
} as const

export default ENDPOINTS
