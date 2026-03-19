const SUPABASE_URL = 'https://xagmrtiajoyznquzehqd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VrywoMuwI8TJoZMIrhT-5A_A0I1yltP';

// 引入方式：通过 CDN
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// 然后 <script src="assets/auth.js"></script>

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// 获取当前用户
async function getUser() {
  const { data: { user } } = await sb.auth.getUser();
  return user;
}

// Google 登录
async function signInWithGoogle() {
  await sb.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/index.html' }
  });
}

// 邮箱 magic link
async function signInWithEmail(email) {
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + '/index.html' }
  });
  return error;
}

// 登出
async function signOut() {
  await sb.auth.signOut();
  location.reload();
}

// 保存测试结果
async function saveTestResult(testName, resultType, resultData) {
  const user = await getUser();
  if (!user) return null;

  const { data, error } = await sb
    .from('test_results')
    .upsert({
      user_id: user.id,
      test_name: testName,
      result_type: resultType,
      result_data: resultData,
      completed_at: new Date().toISOString()
    }, { onConflict: 'user_id,test_name' });

  return error ? null : data;
}

// 获取用户所有测试结果
async function getUserResults() {
  const user = await getUser();
  if (!user) return [];

  const { data } = await sb
    .from('test_results')
    .select('*')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false });

  return data || [];
}

// 注入登录 modal 到页面
function injectLoginModal() {
  if (document.getElementById('loginModal')) return;

  const modal = document.createElement('div');
  modal.id = 'loginModal';
  modal.style.cssText = `
    display:none; position:fixed; inset:0; z-index:1000;
    background:rgba(0,0,0,0.4); backdrop-filter:blur(4px);
    align-items:center; justify-content:center;
  `;
  modal.innerHTML = `
    <div style="background:#f5f0eb; border-radius:20px; padding:32px 28px; max-width:340px; width:90%; text-align:center; font-family:'Noto Serif SC',serif; box-shadow:0 18px 40px rgba(74,48,115,0.12);">
      <p style="font-family:'Cormorant Garamond',serif; font-size:30px; line-height:1.1; color:#4A3073; margin:0 0 10px;">记住你的故事</p>
      <p style="font-size:12px; color:#7d736e; line-height:1.8; margin:0 0 24px;">登录后，测评结果会自动保存，下次来还能看到。</p>

      <input id="emailInput" type="email" placeholder="输入你的邮箱" style="
        display:block; width:100%; padding:14px 16px; margin-bottom:12px;
        border:1px solid rgba(74,48,115,0.18); border-radius:12px;
        font-family:'Noto Serif SC',serif; font-size:14px; color:#4A3073;
        background:#fff; box-sizing:border-box; outline:none;
      ">
      <button id="emailLoginBtn" onclick="sendMagicLink()" style="
        display:block; width:100%; padding:14px 16px; margin-bottom:12px;
        background:#4A3073; color:white; border:none; border-radius:12px;
        font-family:'Noto Serif SC',serif; font-size:14px; cursor:pointer;
        box-shadow:0 10px 24px rgba(74,48,115,0.18);
      ">发送登录链接到邮箱</button>

      <div id="emailMsg" style="display:none; margin-bottom:18px; font-size:12px; color:#4A3073; line-height:1.7;">✓ 已发送，请查收邮件并点击链接登录</div>

      <div style="display:flex; align-items:center; gap:10px; margin:0 0 18px; color:#b7aea8; font-size:11px;">
        <span style="flex:1; height:1px; background:rgba(74,48,115,0.12);"></span>
        <span>或</span>
        <span style="flex:1; height:1px; background:rgba(74,48,115,0.12);"></span>
      </div>

      <div id="googleLoginArea" style="margin-bottom:12px;">
        <button id="googleLoginBtn" onclick="signInWithGoogle()" style="
          display:block; width:100%; padding:13px 16px;
          background:transparent; color:#4A3073; border:1px solid rgba(74,48,115,0.35);
          border-radius:12px; font-family:'Noto Serif SC',serif; font-size:13px; cursor:pointer;
        ">用 Google 账号登录</button>
      </div>

      <div id="wechatTip" style="display:none; margin-bottom:12px; font-size:11px; color:#888; text-align:center; line-height:1.6;">
        在微信中无法使用 Google 登录<br>请在 Safari 或 Chrome 中打开后再试
      </div>

      <button onclick="closeLoginModal()" style="
        background:none; border:none; color:#9b918d; font-size:12px;
        font-family:'Noto Serif SC',serif; cursor:pointer; margin-top:6px;
      ">暂时不了</button>
      <p style="margin:14px 0 0; font-size:11px; line-height:1.7; color:#9b918d;">遇到问题？请在系统浏览器中打开 she-is-app.netlify.app</p>
    </div>
  `;
  document.body.appendChild(modal);

  const isWechat = /MicroMessenger/i.test(navigator.userAgent);
  if (isWechat) {
    document.getElementById('googleLoginArea').style.display = 'none';
    document.getElementById('wechatTip').style.display = 'block';
  }
}

async function sendMagicLink() {
  const email = document.getElementById('emailInput').value.trim();
  if (!email) return;
  const error = await signInWithEmail(email);
  document.getElementById('emailMsg').style.display = error ? 'none' : 'block';
}

function openLoginModal() {
  injectLoginModal();
  document.getElementById('loginModal').style.display = 'flex';
}

function closeLoginModal() {
  document.getElementById('loginModal').style.display = 'none';
}
