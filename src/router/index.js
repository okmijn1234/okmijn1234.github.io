import Vue from 'vue'
import Router from 'vue-router'
import routes from './routes'
import mine from './mine/routes'
import news from './news/routes'
import exam from './exam/routes'
import course from './course/routes'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: '/',
  routes: [...routes, ...mine, ...news, ...exam, ...course],
  scrollBehavior (to, from, savedPosition) {
    return { x: 0, y: 0 }
  }
})

router.beforeEach((to, from, next) => {
  // 除开404页面
  if (to.name !== '404') {
    // 全局通用的字段对照表
    if (!$_.store.state.typeTableLoaded) {
      $_.store.dispatch('getTypeTable')
      $_.store.dispatch('getGlobalInfo')
    }
    // 获取场景值信息
    if (!$_.store.state.isLoadScene) {
      $_.store.dispatch('getSceneInfo')
    }
    // 获取购买社群状态
    if (!$_.store.state.isLoadGuestInfo) {
      $_.store.dispatch('getPayCommunityState')
    }

    // 上传接口响应错误信息
    let errorInfo = localStorage.getItem('errorInfo')
    if (errorInfo) {
      // $_.store.dispatch('postErrorInfo', JSON.parse(errorInfo))
    }
    // 上报课程学习统计
    let studyStatistics = localStorage.getItem('studyStatistics')
    if (studyStatistics) {
      $_.store.dispatch('postStudyStatistics', JSON.parse(studyStatistics))
    }
  }
  next()
})

export default router
