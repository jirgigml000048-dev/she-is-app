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
    <div style="background:#f5f0eb; border-radius:20px; padding:32px 28px; max-width:320px; width:90%; text-align:center; font-family:'Noto Serif SC',serif;">
      <p style="font-family:'Cormorant Garamond',serif; font-size:22px; color:#2e2e2e; margin-bottom:8px;">记住你的故事</p>
      <p style="font-size:12px; color:#888; line-height:1.8; margin-bottom:24px;">登录后，测评结果会自动保存，下次来还能看到。</p>
      
      <button id="googleLoginBtn" onclick="signInWithGoogle()" style="
        display:block; width:100%; padding:12px; margin-bottom:12px;
        background:#4A3073; color:white; border:none; border-radius:10px;
        font-family:'Noto Serif SC',serif; font-size:13px; cursor:pointer;
      ">用 Google 账号登录</button>
      
      <div style="color:#ccc; font-size:11px; margin-bottom:12px;">或</div>
      
      <input id="emailInput" type="email" placeholder="你的邮箱" style="
        display:block; width:100%; padding:11px 14px; margin-bottom:10px;
        border:1px solid rgba(74,48,115,0.2); border-radius:8px;
        font-family:'Noto Serif SC',serif; font-size:13px;
        background:white; box-sizing:border-box; outline:none;
      ">
      <button id="emailLoginBtn" onclick="sendMagicLink()" style="
        display:block; width:100%; padding:12px;
        background:transparent; color:#4A3073;
        border:1px solid rgba(74,48,115,0.3); border-radius:10px;
        font-family:'Noto Serif SC',serif; font-size:13px; cursor:pointer;
        margin-bottom:16px;
      ">发送登录链接</button>
      
      <div id="emailMsg" style="font-size:12px; color:#4A3073; display:none;">✓ 登录链接已发送，请查收邮件</div>
      
      <button onclick="closeLoginModal()" style="
        background:none; border:none; color:#bbb; font-size:12px;
        font-family:'Noto Serif SC',serif; cursor:pointer; margin-top:8px;
      ">暂时不了</button>
    </div>
  `;
  document.body.appendChild(modal);
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
