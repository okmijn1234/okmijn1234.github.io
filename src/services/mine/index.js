import Vue from 'vue'
/**
 * 获取学习中心个人信息
 * @returns {AxiosPromise<any>}
 */
export function getPersonalInfo () {
  return Vue.axios.get('/user/info')
}

/**
 * 获取专栏课程列表
 * @param params {Object} 请求携带的参数 { page: 页码, limit: 每页请求条数 }
 * @returns {AxiosPromise<any>}
 */
export function getSpecialList (params) {
  return Vue.axios.get('/user/column/list', { params })
}

/**
 * 获取单课课程列表
 * @param params {Object} 请求携带的参数 { page: 页码, limit: 每页请求条数 }
 * @returns {AxiosPromise<any>}
 */
export function getSingleList (params) {
  return Vue.axios.get('/user/single/list', { params })
}

/**
 * 获取编辑资料页面信息
 * @returns {AxiosPromise<any>}
 */
export function getEditInfo (params) {
  return Vue.axios.get('/user/personal/info', { params })
}

/**
 * 保存编辑资料页面信息
 * @param data {Object} 请求携带的参数{ head_img: 头像, mobile: 手机号, nick_name: 昵称, real_name: 真实姓名, code: 验证码 }
 * @returns {AxiosPromise<any>}
 */
export function postSaveEditInfo (data) {
  return Vue.axios.post('/user/personal/save', data)
}

/**
 * 获取学习报告信息
 * @returns {AxiosPromise<any>}
 */
export function getLearningReport () {
  return Vue.axios.get('/user/learn/report')
}

/**
 * 获取支付购买的课程列表
 * @param params {Object} 请求携带的参数 { page: 页码, limit: 每页请求条数 }
 * @returns {AxiosPromise<any>}
 */
export function getBuyCourse (params) {
  return Vue.axios.get('/user/grow/up/pay', { params })
}

/**
 * 获取免费获得的课程列表
 * @param params {Object} 请求携带的参数 { page: 页码, limit: 每页请求条数 }
 * @returns {AxiosPromise<any>}
 */
export function getGratisCourse (params) {
  return Vue.axios.get('/user/grow/up/free', { params })
}

/**
 * 获取邀请的好友列表
 * @param params {Object} 请求携带的参数 { keywords: 关键字, page: 页码, limit: 每页请求条数 }
 * @returns {AxiosPromise<any>}
 */
export function getInviteList (params) {
  return Vue.axios.get('/community/invite/list', { params })
}

/**
 * 获取邀请信息
 * @returns {AxiosPromise<any>}
 */
export function getInviteInfo () {
  return Vue.axios.get('/community/invite/info')
}
