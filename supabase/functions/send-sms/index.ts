import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').filter(Boolean)

function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') || ''
  const allowed = ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)
  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0] || '',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
}

const enc = (s: string) => new TextEncoder().encode(s)

async function sha256hex(data: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', enc(data))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function hmacSha256(key: ArrayBuffer | string, msg: string): Promise<ArrayBuffer> {
  const keyBuf = typeof key === 'string' ? enc(key).buffer : key
  const k = await crypto.subtle.importKey('raw', keyBuf, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return crypto.subtle.sign('HMAC', k, enc(msg))
}

async function hmacSha256Hex(key: ArrayBuffer | string, msg: string): Promise<string> {
  const buf = await hmacSha256(key, msg)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function sendTencentSMS(phone: string, code: string): Promise<void> {
  const secretId   = Deno.env.get('TENCENT_SECRET_ID')!
  const secretKey  = Deno.env.get('TENCENT_SECRET_KEY')!
  const appId      = Deno.env.get('TENCENT_SMS_APP_ID')!
  const signName   = '北京弗荔咨询服务'
  const templateId = Deno.env.get('TENCENT_SMS_TEMPLATE_ID')!

  const now     = Math.floor(Date.now() / 1000)
  const date    = new Date(now * 1000).toISOString().slice(0, 10)
  const service = 'sms'
  const host    = 'sms.tencentcloudapi.com'

  const payload = JSON.stringify({
    SmsSdkAppId: appId,
    SignName: signName,
    TemplateId: templateId,
    TemplateParamSet: [code],
    PhoneNumberSet: ['+86' + phone],
  })

  const hashedPayload = await sha256hex(payload)

  const canonicalRequest = [
    'POST', '/', '',
    `content-type:application/json\nhost:${host}\n`,
    'content-type;host',
    hashedPayload,
  ].join('\n')

  const credentialScope = `${date}/${service}/tc3_request`
  const hashedCanonical = await sha256hex(canonicalRequest)
  const stringToSign    = ['TC3-HMAC-SHA256', String(now), credentialScope, hashedCanonical].join('\n')

  // 逐步派生签名密钥
  const skDate    = await hmacSha256('TC3' + secretKey, date)
  const skService = await hmacSha256(skDate, service)
  const skSigning = await hmacSha256(skService, 'tc3_request')
  const signature = await hmacSha256Hex(skSigning, stringToSign)

  const authorization = `TC3-HMAC-SHA256 Credential=${secretId}/${credentialScope}, SignedHeaders=content-type;host, Signature=${signature}`

  const res = await fetch(`https://${host}/`, {
    method: 'POST',
    headers: {
      'Authorization':  authorization,
      'Content-Type':   'application/json',
      'Host':           host,
      'X-TC-Action':    'SendSms',
      'X-TC-Timestamp': String(now),
      'X-TC-Version':   '2021-01-11',
      'X-TC-Region':    'ap-guangzhou',
    },
    body: payload,
  })

  const data = await res.json()
  const sendStatus = data?.Response?.SendStatusSet?.[0]
  if (sendStatus?.Code !== 'Ok') {
    throw new Error(`[${sendStatus?.Code}] ${sendStatus?.Message || JSON.stringify(data?.Response)}`)
  }
}

serve(async (req) => {
  const cors = corsHeaders(req)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const { phone } = await req.json()
    if (!phone || !/^\d{11}$/.test(phone)) {
      return new Response(JSON.stringify({ error: '手机号格式错误' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Rate limit: reject if an OTP was sent to this phone within 60 seconds
    const { data: recentOtp } = await supabase
      .from('sms_otp')
      .select('created_at')
      .eq('phone', phone)
      .gt('created_at', new Date(Date.now() - 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
    if (recentOtp && recentOtp.length > 0) {
      return new Response(JSON.stringify({ error: '请求过于频繁，请60秒后再试' }), {
        status: 429, headers: { ...cors, 'Content-Type': 'application/json' }
      })
    }

    const code = String(Math.floor(100000 + Math.random() * 900000))

    await supabase.from('sms_otp').delete().eq('phone', phone).eq('used', false)
    const { error: insertError } = await supabase.from('sms_otp').insert({
      phone,
      code,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    })
    if (insertError) throw insertError

    await sendTencentSMS(phone, code)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...cors, 'Content-Type': 'application/json' }
    })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ error: e.message || '发送失败' }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' }
    })
  }
})
