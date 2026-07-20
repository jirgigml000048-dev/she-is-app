<script>
import { getUser, cloudLogin } from '@/utils/user.js'
import { CLOUD_ENV_ID } from '@/config.js'

export default {
  onLaunch: function () {
    // #ifdef MP-WEIXIN
    if (wx.cloud) {
      wx.cloud.init({
        env: CLOUD_ENV_ID,
        traceUser: true,
      })
      // 已主动开启过同步的用户，启动时静默合并本机与云端记录。
      if (getUser()) {
        cloudLogin().catch(error => console.warn('[sync] launch sync deferred', error))
      }
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
