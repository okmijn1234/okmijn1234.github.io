/**
 * global mutations
 */

import {
  SET_USER_INFO,
  SET_QINIU_TOKEN,
  SET_TABLE_INFO,
  SET_SCENE_INFO,
  SET_GUEST_INFO,
  SET_ACCESS_STATUS,
  SET_LOCAL_CACHE,
  REMOVE_LOCAL_CACHE,
  SET_GLOBAL_INFO
} from './mutation-type'

export default {
  [SET_USER_INFO] (state, payload) {
    state.userInfoLoaded = true
    state.personalInfo = {
      uid: payload.uid,
      nickname: payload.nick_name,
      avatar: payload.img_url,
      isBindPhone: payload.is_bind_mobile === 1,
      inviteNum: payload.invite_num, // 邀请人数
      isKing: payload.is_mr_king // 是否是福王
    }
  },
  [SET_QINIU_TOKEN] (state, payload) {
    state.qiniuToken = payload
  },
  [SET_GUEST_INFO] (state, payload) {
    state.guest = payload
    state.isLoadGuestInfo = true
  },
  [SET_SCENE_INFO] (state, payload) {
    state.sceneInfo = payload
    state.isLoadScene = true
  },
  [SET_TABLE_INFO] (state, payload) {
    state.typeTableLoaded = true
    state.typeTable.positionType = payload.position_type
    state.typeTable.liveRoleType = payload.live_roles
  },
  [SET_ACCESS_STATUS] (state, payload) {
    state.accessStatus = payload
  },
  [SET_GLOBAL_INFO] (state, payload) {
    state.globalInfo = payload
  },
  [SET_LOCAL_CACHE] (state, payload) {
    let { key, value } = payload
    if (key) {
      state.localCache[key] = value
      // 将缓存数据存入到sessionStorage中 防止数据丢失
      sessionStorage.setItem('localCache', JSON.stringify(state.localCache))
    }
  },
  [REMOVE_LOCAL_CACHE] (state, payload) {
    let key = typeof payload === 'string' ? payload : payload.key
    if (key) {
      delete state.localCache[key]
      // 将删除后的数据更新到sessionStorage中
      sessionStorage.setItem('localCache', JSON.stringify(state.localCache))
    }
  }
}
