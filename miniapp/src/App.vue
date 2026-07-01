<script>
// ↓ 填入你的云开发环境 ID（在微信开发者工具 → 云开发 → 环境 里找到）
const CLOUD_ENV_ID = 'cloud1-d4gkbgtzob1673d47'

export default {
  onLaunch: function () {
    // #ifdef MP-WEIXIN
    if (wx.cloud) {
      wx.cloud.init({
        env: CLOUD_ENV_ID,
        traceUser: true,
      })
    }
    // #endif
  },
  onShow: function () {},
  onHide: function () {},
}
</script>

<style>
/*每个页面公共css */
</style>
