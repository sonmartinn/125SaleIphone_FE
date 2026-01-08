const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/register'

export async function registerApi(data: {
  UserName: string
  Email: string
  Password: string
  Password_confirmation: string
}) {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  const result = await res.json()

  if (!res.ok) {
    throw new Error(result.message || 'Register failed')
  }

  return result
}

export async function checkoutApi(data: any) {
  const res = await fetch(`${API_URL}/payment/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  // Check if response is JSON
  const contentType = res.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    const result = await res.json()
    if (!res.ok) {
      throw new Error(result.message || 'Checkout failed')
    }
    return result
  } else {
    // Handle non-JSON response (likely an error page or empty)
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Checkout failed: ${res.status} ${res.statusText}`)
    }
    return true // Or some default success if no JSON returned
  }
}

export async function paymentCallbackApi(params: any) {
  const queryString = new URLSearchParams(params).toString()
  const res = await fetch(`${API_URL}/payment/callback?${queryString}`, {
    method: 'GET', // Or POST depending on provider, usually GET for callback redirects
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const result = await res.json()
  if (!res.ok) {
    throw new Error(result.message || 'Payment callback failed')
  }
  return result
}

export async function sendMailApi(data: any) {
  const res = await fetch(`${API_URL}/payment/send-mail`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  const result = await res.json()
  if (!res.ok) {
    throw new Error(result.message || 'Send mail failed')
  }
  return result
}
