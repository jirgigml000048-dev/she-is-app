import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { phone, code } = await req.json()
    if (!phone || !code) {
      return new Response(JSON.stringify({ error: '参数缺失' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 查验证码
    const { data: otpRows, error: fetchError } = await supabase
      .from('sms_otp')
      .select('*')
      .eq('phone', phone)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: false })
      .limit(1)

    if (fetchError) throw fetchError
    if (!otpRows || otpRows.length === 0) {
      return new Response(JSON.stringify({ error: '验证码错误或已过期' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' }
      })
    }

    // 标记已使用
    await supabase.from('sms_otp').update({ used: true }).eq('id', otpRows[0].id)

    // 用 admin API 查找或创建用户
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 用手机号作为 email（+86phone@sms.sheisapp）做 workaround
    // 这样不需要开启 Supabase Phone provider
    const fakeEmail = `${phone}@sms.sheisapp.internal`
    const password  = Deno.env.get('SMS_USER_SECRET')! + phone // 固定密码，用户不需要知道

    // 尝试登录
    const { data: signInData, error: signInError } = await adminClient.auth.signInWithPassword({
      email: fakeEmail, password
    })

    if (!signInError && signInData.session) {
      return new Response(JSON.stringify({ session: signInData.session }), {
        headers: { ...CORS, 'Content-Type': 'application/json' }
      })
    }

    // 用户不存在，创建
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: fakeEmail,
      password,
      email_confirm: true,
      user_metadata: { phone, login_method: 'sms' }
    })
    if (createError) throw createError

    // 再登录
    const { data: newSession, error: newSignInError } = await adminClient.auth.signInWithPassword({
      email: fakeEmail, password
    })
    if (newSignInError) throw newSignInError

    return new Response(JSON.stringify({ session: newSession.session }), {
      headers: { ...CORS, 'Content-Type': 'application/json' }
    })

  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ error: e.message || '验证失败' }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' }
    })
  }
})
