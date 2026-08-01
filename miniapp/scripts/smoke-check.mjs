import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourceRoot = join(projectRoot, 'src')
const buildRoot = join(projectRoot, 'dist', 'build', 'mp-weixin')

function read(path) {
  return readFileSync(path, 'utf8')
}

function mustExist(path, label) {
  assert.ok(existsSync(path), `${label} 不存在：${path}`)
}

const pages = JSON.parse(read(join(sourceRoot, 'pages.json')))
assert.ok(Array.isArray(pages.pages) && pages.pages.length >= 10, '页面数量异常')
for (const page of pages.pages) {
  mustExist(join(sourceRoot, `${page.path}.vue`), `源码页面 ${page.path}`)
}

const tabPages = pages.tabBar && Array.isArray(pages.tabBar.list) ? pages.tabBar.list : []
assert.equal(tabPages.length, 4, '底栏应保持 4 个入口')
for (const item of tabPages) {
  assert.ok(pages.pages.some(page => page.path === item.pagePath), `底栏页面未注册：${item.pagePath}`)
}

const expectedPages = [
  'pages/index/index',
  'pages/stories/list',
  'pages/stories/detail',
  'pages/assessment/index',
  'pages/assessment/test',
  'pages/assessment/result',
  'pages/journey/question',
  'pages/map/index',
  'pages/profile/index',
  'pages/admin/index',
]
for (const pagePath of expectedPages) {
  assert.ok(pages.pages.some(page => page.path === pagePath), `核心页面未注册：${pagePath}`)
}

const expectedCloudFunctions = [
  'login',
  'saveAssessment',
  'saveStoryRead',
  'saveReflection',
  'generatePortrait',
  'deleteUserData',
  'getStories',
  'adminStories',
  'adminStats',
]
for (const name of expectedCloudFunctions) {
  const functionEntry = join(projectRoot, 'cloudfunctions', name, 'index.js')
  mustExist(functionEntry, `云函数 ${name}`)
  mustExist(join(projectRoot, 'cloudfunctions', name, 'package.json'), `云函数配置 ${name}`)
  const syntax = spawnSync(process.execPath, ['--check', functionEntry], { encoding: 'utf8' })
  assert.equal(syntax.status, 0, `云函数 ${name} 存在语法错误：${syntax.stderr || syntax.stdout}`)
}

const homeSource = read(join(sourceRoot, 'pages', 'index', 'index.vue'))
assert.match(homeSource, /homeLayout/, '首页故事错落布局丢失')
assert.match(homeSource, /continueAssessment/, '首页续答入口丢失')

const testSource = read(join(sourceRoot, 'pages', 'assessment', 'test.vue'))
assert.match(testSource, /saveAssessmentDraft/, '测评草稿保存能力丢失')
assert.match(testSource, /clearAssessmentDraft/, '测评完成后的草稿清理能力丢失')

const adminPageSource = read(join(sourceRoot, 'pages', 'admin', 'index.vue'))
const adminFunctionSource = read(join(projectRoot, 'cloudfunctions', 'adminStories', 'index.js'))
assert.match(adminPageSource, /checkMediaHealth/, '后台素材检查入口丢失')
assert.match(adminFunctionSource, /action === 'health'/, '后台素材检查服务丢失')

const storiesSource = read(join(sourceRoot, 'data', 'stories.js'))
const localCoverRefs = [...storiesSource.matchAll(/LOCAL_COVER_BASE\s*\+\s*['"]([^'"]+)['"]/g)]
assert.ok(localCoverRefs.length >= 11, '本地故事兜底数量异常')
for (const match of localCoverRefs) {
  mustExist(join(sourceRoot, 'static', 'covers-mini', match[1]), `本地故事封面 ${match[1]}`)
}

const draftSource = read(join(sourceRoot, 'utils', 'assessmentDrafts.js'))
const draftModule = await import(`data:text/javascript;base64,${Buffer.from(draftSource).toString('base64')}`)
const storage = new Map()
globalThis.uni = {
  getStorageSync: key => storage.has(key) ? storage.get(key) : '',
  setStorageSync: (key, value) => storage.set(key, value),
  removeStorageSync: key => storage.delete(key),
}
const savedDraft = draftModule.saveAssessmentDraft('smoke-test', [1, null, 3], 1)
assert.equal(savedDraft.answeredCount, 2, '测评草稿答题数计算错误')
assert.equal(draftModule.getAssessmentDraft('smoke-test', 3).cursor, 1, '测评草稿无法恢复')
draftModule.clearAssessmentDraft('smoke-test')
assert.equal(draftModule.getAssessmentDraft('smoke-test', 3), null, '测评草稿无法清理')

mustExist(join(buildRoot, 'app.json'), '微信发布构建 app.json')
const builtApp = JSON.parse(read(join(buildRoot, 'app.json')))
for (const pagePath of expectedPages) {
  assert.ok(builtApp.pages.includes(pagePath), `发布构建缺少页面：${pagePath}`)
  mustExist(join(buildRoot, `${pagePath}.js`), `发布页面脚本 ${pagePath}`)
}

console.log(`Smoke check passed: ${expectedPages.length} pages, ${expectedCloudFunctions.length} cloud functions, ${localCoverRefs.length} local story fallbacks.`)
