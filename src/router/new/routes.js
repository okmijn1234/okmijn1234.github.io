const ROUTES_NAME = '/news'
/**
 * 可以分享的页面，meta中添加share字段值为true
 * 禁止游客访问的页面，meta中添加auth字段为true
 */
export default [
  {
    path: `${ROUTES_NAME}/`,
    name: 'news',
    component: () => import(/* webpackChunkName: "news" */ '../../views/news/news.vue'),
    meta: {
      title: '消息'
    }
  },
  {
    path: `${ROUTES_NAME}/details`,
    name: 'news-details',
    component: () => import(/* webpackChunkName: "news-details" */ '../../views/news/Details.vue'),
    meta: {
      title: '消息详情'
    }
  }
]
