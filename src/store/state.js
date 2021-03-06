/**
 * global state
 */
export default {// 是否已经加载过全局的用户信息
  userInfoLoaded: false,
  // 是否已经加载过字段对照表
  typeTableLoaded: false,
  // 是否加载公用场景值信息
  isLoadScene: false,
  // 是否加载判断购买社群
  isLoadGuestInfo: false,
  // 全局的个人信息
  personalInfo: {
    nickname: '', // 用户昵称
    avatar: '', // 用户头像
    uid: '', // 用户uid
    isBindPhone: false, // 是否绑定手机
    inviteNum: 0, // 邀请人数
    isKing: false // 是否是福王
  },
  // 七牛云直传token
  qiniuToken: {
    // 上传的文件路径
    path: {}, // scene => path
    token: '' // 上传token
  },
  // 访客信息
  guest: '',
  // 类型字段对照表
  typeTable: {
    positionType: null, // 职位类型
    liveRoleType: null // 直播间角色
  },
  globalInfo: {
    share_info: null,
    is_open: false, // 是否可以访问权限控制页面
    route_list: [] // 权限控制页面路由name列表
  },
  // 场景值信息
  sceneInfo: {
    ad: {
      community_course_home: '', // 集福中心
      community_course_rank: '' // 排行榜
    },
    customer: { // 客服二维码
      activity_curriculum: '' // 活动课程
    },
    video_course: {
      community_course_home: '', // 集福中心
      community_course_rank: '', // 排行榜
      share_adv: '' // 课程分享
    },
    img: {
      head_img: '' // 头像
    }
  },
  // 账号状态
  accessStatus: {
    restrict: false, // 限制登录
    desc: '' // 描述信息
  },
  // 本地缓存
  localCache: JSON.parse(sessionStorage.getItem('localCache') || '{}')
}
