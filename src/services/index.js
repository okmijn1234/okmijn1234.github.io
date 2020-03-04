import Vue from 'vue'

/**
 * 获取七牛云token
 * @param scene {String} 获取token携带的场景值
 * @returns {AxiosPromise<any>}
 */
export function getQiniuToken (scene) {
  return Vue.axios.get('/pub/qiniu/ticket', { params: { scene } })
}

/**
 * 获取用户基础信息
 * @return {AxiosPromise<any>}
 */
export function getUserInfo () {
  return Vue.axios.get('/member/info')
}

/**
 * 获取全局通用的类型对照关系表
 * @return {AxiosPromise<any>}
 */
export function getTypeTable () {
  return Vue.axios.get('/pub/contrast')
}

/**
 * 获取公用场景值
 * @return {AxiosPromise<any>}
 */
export function getSceneInfo () {
  return Vue.axios.get('/pub/scene/contrast')
}

/**
 * 微信分享成功回调
 * @param data {Object<{cate,data}>}
 * @return {AxiosPromise<any>}
 */
export function postShareSuccess (data) {
  return Vue.axios.post('/visit/record/share', data, { $_hideLoading: true, $_cancelNotice: true })
}
/**
 * 获取微信授权信息
 * @param data {Object} 微信分享配置信息
 * @return {AxiosPromise<any>}
 */
export function getWeixinConfig (data) {
  return Vue.axios.get('/pub/wx/jssdk')
}

/**
 * 发送接口响应错误信息
 * @param data {Object}
 * @return {AxiosPromise<any>}
 */
export function postErrorInfo (data) {
  return Vue.axios.post('/pub/api/error/record', data, { $_hideLoading: true, $_cancelNotice: true, $_errorFilter: true })
}

/**
 * 根据场景值获取客服信息
 * @param params {Object<scene>} 场景值
 * @return {AxiosPromise<any>}
 */
export function getServiceInfo (params) {
  return Vue.axios.get('/pub/get/customer/service', { params })
}

/**
 * 根据场景值获取banner信息
 * @param params {Object} 请求携带的参数{ scene: 场景值, uid: 用户uid }
 * @returns {AxiosPromise<any>}
 */
export function getBannerList (params) {
  return Vue.axios.get('/pub/ads/list', { params })
}

/**
 * 根据场景值获取视频信息
 * @param params {Object} 请求携带的参数{ scene: 场景值 }
 * @returns {AxiosPromise<any>}
 */
export function getVideoInfo (params) {
  return Vue.axios.get('/pub/get/tutorials', { params })
}
