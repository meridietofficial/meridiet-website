const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js'

export function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = RAZORPAY_SCRIPT
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout script'))
    document.head.appendChild(script)
  })
}
