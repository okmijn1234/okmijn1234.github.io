<template lang="pug">
  div.course(v-if="isLoad")
    DetailsContent(
      :contentList="contentList"
      @videoPlay="videoPlay"
      @jumpLink="jumpLink"
      @typeVideoPlay="typeVideoPlay"
    )
    div.course__footer
      div.amount
        p.price {{courseDetailsInfo.price}}
        p.original(v-if="courseDetailsInfo.originalPrice")
          span.original-text 限时特惠
          span.original-price 原价{{courseDetailsInfo.originalPrice}}元
      div.btns
        template(v-if="!isObtain")
          button.btn.immediately(type="button" @click="immediately") 立即购买
          button.btn.free(type="button" @click="free") 免费获取
        button.obtain(v-else @click="free") 已免费获取
    CustomerServicePopup(
      v-if="isCustomerServicePopup"
      :customer="customerServiceData"
      @close="isCustomerServicePopup = false"
      )
    WarmPromptPopup(
      v-if="isWarmPromptPopup"
      :number="WarmPromptNumber"
      @close="isWarmPromptPopup = false"
      @invite="invite"
    )
    PostersSharePopup(
      v-if="isPostersSharePopup"
      :fromUid="uid"
      @close="isPostersSharePopup = false"
    )
    CourseCustomerServicePopup(
      v-if="isCourseCustomerServicePopup"
      @close="isCourseCustomerServicePopup = false"
    )
    VideoPopup(
      :video="videoInfo"
      :isShow="isShowVideo"
      @videoClose="isShowVideo = false"
    )

</template>

<script>
  import DetailsContent from '../../components/community/DetailsContent'
  import PostersSharePopup from '../../components/community/PostersSharePopup'
  import CustomerServicePopup from '../../components/community/CustomerServicePopup'
  import CourseCustomerServicePopup from '../../components/community/CourseCustomerServicePopup'
  import WarmPromptPopup from '../../components/community/WarmPromptPopup'
  import VideoPopup from '../../components/VideoPopup'
  import weixinConfig from '../../mixin/weixinConfig'
  import {
    getCourseDetail
  } from '../../services/community'
  import {
    getCourseServe
  } from '../../services'
  export default {
    name: 'CourseDetails',
    components: {
      DetailsContent,
      CustomerServicePopup,
      CourseCustomerServicePopup,
      WarmPromptPopup,
      PostersSharePopup,
      VideoPopup
    },
    mixins: [weixinConfig],
    watch: {
      isCustomerServicePopup (val) {
        // true 显示弹框 false 关闭弹框
        this.$root.$emit('toggleModal', Boolean(val))
      },
      isCourseCustomerServicePopup (val) {
        this.$root.$emit('toggleModal', Boolean(val))
      },
      isWarmPromptPopup (val) {
        this.$root.$emit('toggleModal', Boolean(val))
      },
      isPostersSharePopup (val) {
        this.$root.$emit('toggleModal', Boolean(val))
      },
      isLoadGuestInfo () {
        this.main()
      },
      uid () {
        this.configShareInfo()
      }
    },
    computed: {
      courseId () {
        return this.$route.params.courseId
      },
      // 访客
      isGuest () {
        return this.$store.state.guest
      },
      // 是否加载访客信息
      isLoadGuestInfo () {
        return this.$store.state.isLoadGuestInfo
      },
      uid () {
        return this.$store.state.personalInfo.uid
      }
    },
    data () {
      return {
        isLoad: false,
        courseDetailsInfo: {
          price: '', // 价格
          originalPrice: '' // 原价
        },
        contentList: [], // 内容
        isObtain: false, // 是否获取课程
        isCustomerServicePopup: false, // 固定客服弹框
        isCourseCustomerServicePopup: false, // 课程客服弹框
        customerServiceData: { // 固定客服弹框
          differentiate: 0,
          content: '',
          codeSrc: '' // 客服二维码
        }, // 群弹框
        isWarmPromptPopup: false, // 是否已经达到免费获取资格
        WarmPromptNumber: 0, // 提示还需多少个人
        isPostersSharePopup: false, // 邀请海报
        shareInfo: null,
        videoInfo: {
          videoUrl: '',
          imgSrc: ''
        },
        isShowVideo: false
      }
    },
    created () {
      if (this.isLoadGuestInfo) { // 访客跳转到社群详情
        this.main()
      }
    },
    methods: {
      main () {
        if (this.isGuest) {
          return
        }
        this.isLoad = true
        this.mine()
      },
      mine () {
        let that = this
        getCourseDetail({ id: this.courseId }).then(res => {
          if (res.data.code === 1) {
            let data = res.data.data
            let courseInfo = data.course_info
            let relationInfo = data.relation_info

            document.title = courseInfo.title

            that.shareInfo = data.share_info
            that.configShareInfo()
            that.courseDetailsInfo = {
              price: Number.isInteger(+courseInfo.price) ? parseInt(courseInfo.price) : courseInfo.price,
              originalPrice: Number.isInteger(+courseInfo.old_price) ? parseInt(courseInfo.old_price) : courseInfo.old_price
            }

            that.contentList = that.transformContentList(courseInfo.content)

            that.isObtain = data.status === 2

            if (data.status === 4) { // 课程结束
              that.$router.replace({
                name: 'end'
              })
            }

            that.WarmPromptNumber = relationInfo.rest_invite_number
          }
        })
      },
      /**
       * 配置分享信息
       */
      configShareInfo () {
        if (this.uid && this.shareInfo) {
          this.getWeiXinConfig({
            desc: this.shareInfo.content,
            img: this.shareInfo.img_url,
            title: this.shareInfo.title,
            link: `${location.origin}/particulars/from/${this.uid}`
          }).then(this.setWeiXinConfig)
        }
      },
      getCourseServe () {
        let that = this
        getCourseServe().then(res => {
          if (res.data.code === 1) {
            let data = res.data.data
            that.isCustomerServicePopup = true
            that.customerServiceData.codeSrc = data.customer_qr_code
          }
        })
      },
      /**
       * 视频播放
       * @param itemIndex { Number } 选择视频父元素的角标
       * @param videoIndex { Number } 选择播放视频当前的角标
       */
      videoPlay (itemIndex, videoIndex) {
        // this.contentList[itemIndex].videoList[videoIndex].isVideoPlay = true
        let data = this.contentList[itemIndex].videoList[videoIndex]
        this.videoInfo = {
          videoUrl: data.src,
          imgSrc: data.cover
        }
        this.$nextTick(() => {
          this.isShowVideo = true
        })
      },
      /**
       * 分类视频播放
       * @param itemIndex { Number } 选择视频父元素的角标
       * @param videoTypeIndex { Number } 选择播放视频当前的角标
       * @param videoIndex { Number } 选择播放视频当前的角标
       */
      typeVideoPlay (itemIndex, videoTypeIndex, videoIndex) {
        let that = this
        let data = that.contentList[itemIndex].typeVideoList[videoTypeIndex].list[videoIndex]
        that.videoInfo = {
          videoUrl: data.src,
          imgSrc: data.cover
        }
        that.$nextTick(() => {
          that.isShowVideo = true
        })
      },
      /**
       * 跳转链接
       * @param url {String} 跳转链接
       */
      jumpLink (url) {
        this.$_.entryOtherPage(url)
      },
      // 立即购买
      immediately () {
        this.getCourseServe()
      },
      // 免费获取
      free () {
        if (this.isObtain) {
          this.isCourseCustomerServicePopup = true
        } else {
          this.isWarmPromptPopup = true
        }
      },
      // 立即邀请
      invite () {
        this.isWarmPromptPopup = false
        this.isPostersSharePopup = true
      },
      // 重新加载
      reload () {
        this.mine()
      },
      /**
       * 转换内容数据
       * @param source {Object} 需要转换的数据源
       * @return {Object} 转换后可以直接使用的结构
       */
      transformContentList (source) {
        let list = []
        source.forEach(item => {
          list.push({
            videoList: this.transformVideoList(item.list_data), // 视频列表/多个链接
            type: item.mark_format, // 类型 1图片 2文本 3单个视频 4多个视频 6多链接
            title: item.title, // 标题
            text: item.resource, // 文本内容
            typeVideoList: this.transformTypeVideoList(item.more_video_list || [])
          })
        })
        return list
      },
      /**
       * 转换分类视频列表数据
       * @param source {Object} 需要转换的数据源
       * @return {Object} 转换后可以直接使用的结构
       */
      transformTypeVideoList (source) {
        let list = []
        source.forEach(item => {
          list.push({
            id: item.cate_id,
            name: item.cate_name, // 类型
            list: this.transformVideoList(item.more_video)
          })
        })
        return list
      },
      /**
       * 转换视频列表数据
       * @param source {Object} 需要转换的数据源
       * @return {Object} 转换后可以直接使用的结构
       */
      transformVideoList (source) {
        let list = []
        source.forEach(item => {
          list.push({
            src: item.url, // 视频路径
            cover: item.img_url, // 封面图
            text: item.title,
            isVideoPlay: false
          })
        })
        return list
      }
    }
  }
</script>

<style scoped lang="less">
  .course {
    padding-bottom: 1.2rem;
    background-color: #fff;

    &__footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      align-items: center;
      height: 1.2rem;
      padding: 0 .1rem;
      background-color: #fff;

      .amount {
        display: flex;
        align-items: center;

        /* width: 2.86rem; */
        flex: 1;
      }

      .price {
        color: #fe5832;
        font-size: .44rem;
        font-weight: bold;

        &::before {
          content: '￥';
          font-size: .28rem;
          font-weight: bold;
        }
      }

      .original {
        display: flex;
        align-items: center;
        flex-direction: column;
        font-size: .24rem;
        transform: scale(.84);
        margin-left: .1rem;

        &-text {
          color: #fff;
          padding: .02rem .1rem;
          border-radius: .08rem;
          background: linear-gradient(to right, #fe5933, #ff8016);
        }

        &-price {
          color: #7f7f7f;
          text-decoration: line-through;
        }
      }

      .btns {
        flex: 1;
        display: flex;
        align-items: center;
      }

      .btn {
        flex: 1;
        height: .8rem;
        color: #fff;
        font-size: .32rem;
      }

      .immediately {
        border-top-left-radius: 1rem;
        border-bottom-left-radius: 1rem;
        background: linear-gradient(to right, #fec911, #ff960f);

        &:active {
          background: linear-gradient(to left, #fec911, #ff960f);
        }
      }

      .free {
        border-top-right-radius: 1rem;
        border-bottom-right-radius: 1rem;
        background: linear-gradient(to right, #ff7606, #fe4006);

        &:active {
          background: linear-gradient(to left, #ff7606, #fe4006);
        }
      }

      .obtain {
        color: #999;
        font-size: .32rem;
        width: 4rem;
        height: .8rem;
        border-radius: 1rem;
        background-color: #ebebeb;
      }
    }
  }
</style>
