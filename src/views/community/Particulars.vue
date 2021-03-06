<template lang="pug">
  div.particulars
    div.particulars__shuffling(v-if="shufflingList.length")
      SwiperCommon(:swiperOptions="swiperOptions" :slides="shufflingList")
        template(
          v-for="(item, index) in shufflingList"
          :slot="index"
        )
          div.shuffling 恭喜
            span.name "{{item.name}}"
            | 加入社群
            span.time {{item.time}}
    div.particulars__music(v-if="musicUrl" @click="operationMusic")
      span.music(:class="{play: isPlayMusic}")
    DetailsContent(
      :contentList="contentList"
      :countdownData="countdownData"
      @videoPlay="videoPlay"
      @typeVideoPlay="typeVideoPlay"
      @jumpLink="jumpLink"
      )
    div.particulars__footer
      div.amount
        p.price {{particularsInfo.price}}
        p.original(v-if="particularsInfo.originalPrice")
          span.original-text 限时特惠
          span.original-price 原价{{particularsInfo.originalPrice}}元
      div.btns
        button.btn.share(type="button" @click="share") 分享
        button.btn.immediately(type="button" v-if="!isParticipate" @click="immediately") 立即抢购
        // 购买成功显示参与课程
        button.btn.participate(type="button" v-else @click="participate") 参与课程
    // 社群中心入口
    RouterLink.entrance(v-show="isParticipate" :to="{name: 'home'}")
      span 集福
      span 中心
    InformationPopup(
      v-if="isShowInformationPopup"
      :postList="postList"
      @close="isShowInformationPopup = false"
      @determine="determineInformation"
      )
    ObtainCoursePopup(
      v-if="isObtainCoursePopup"
      :courseInfo="courseInfo"
      @close="isObtainCoursePopup = false"
      @invite="obtainCourseInvite"
      @service="obtainCourseService"
      )
    CourseCustomerServicePopup(
      v-if="isCourseCustomerServicePopup"
      @close="isCourseCustomerServicePopup = false"
    )
    PostersSharePopup(
      v-if="isPostersSharePopup"
      :fromUid="uid"
      @close="isPostersSharePopup = false"
    )
    PaymentPopup(
      v-if="isPaymentPopup"
      :amountMoney="particularsInfo.price"
      @close="isPaymentPopup = false"
      @jumpCamiloPayment="jumpCamiloPayment"
      @determine="determinePayment"
      )
    CamiloPaymentPopup(
      v-if="isCamiloPaymentPopup"
      @close="isCamiloPaymentPopup = false"
      @determine="determineCamiloPayment"
    )
    VideoPopup(
      :video="videoInfo"
      :isShow="isShowVideo"
      @videoClose="videoClose"
    )
</template>

<script>
  import SwiperCommon from '../../components/SwiperCommon'
  import AudioContext from '../../utils/audio-context'
  import PostersSharePopup from '../../components/community/PostersSharePopup'
  import DetailsContent from '../../components/community/DetailsContent'
  import InformationPopup from '../../components/community/InformationPopup'
  import CourseCustomerServicePopup from '../../components/community/CourseCustomerServicePopup'
  import ObtainCoursePopup from '../../components/community/ObtainCoursePopup'
  import PaymentPopup from '../../components/community/PaymentPopup'
  import CamiloPaymentPopup from '../../components/community/CamiloPaymentPopup'
  import VideoPopup from '../../components/VideoPopup'
  import weixinConfig from '../../mixin/weixinConfig'
  import {
    MessageBox
  } from 'mint-ui'
  import {
    getParticularsDetail,
    postBuyNow,
    postInformation,
    postReadTips,
    postKalmanPay
  } from '../../services/community'

  export default {
    name: 'Particulars',
    components: {
      SwiperCommon,
      DetailsContent,
      PostersSharePopup,
      InformationPopup,
      CourseCustomerServicePopup,
      ObtainCoursePopup,
      PaymentPopup,
      CamiloPaymentPopup,
      VideoPopup
    },
    mixins: [weixinConfig],
    data () {
      return {
        shufflingList: [], // 开通课程列表
        swiperOptions: {
          autoplay: true,
          speed: 300, // 切换速度
          direction: 'vertical',
          watchOverflow: true, // 当没有足够的slide切换时，例如只有1个slide（非loop），swiper会失效且隐藏导航等。默认不开启这个功能。
          loop: true, // 开启循环模式
          allowTouchMove: false // 禁止拖动
        },
        particularsInfo: {
          price: '', // 价格
          originalPrice: '' // 原价
        },
        contentList: [], // 内容
        isParticipate: false, // 是否已经支付
        isPerfectInformation: false, // 是否完善信息
        isShowInformationPopup: false, // 支付成功后填写信息弹框
        isObtainCoursePopup: false, // 是否已经免费获得课程弹框
        isOpening: false, // 是否开营
        isPaymentPopup: false, // 立即抢购弹框
        isCamiloPaymentPopup: false, // 卡密支付弹框
        isCourseCustomerServicePopup: false, // 课程客服弹框
        courseInfo: {
          name: '',
          imgSrc: '',
          id: 0
        },
        postList: [], // 完善信息职位列表
        shareInfo: null,
        isShowWaitPopup: false,
        isPostersSharePopup: false, // 邀请海报
        countdownData: { // 倒计时数据
          day: [], // 天
          hour: [], // 时
          minute: [], // 分
          second: [] // 秒
        },
        countdownTimer: null, // 倒计时
        videoInfo: {
          videoUrl: '',
          imgSrc: ''
        },
        isShowVideo: false,
        isPlayMusic: false, // 是否播放音乐
        beforeMusicState: false, // 点击播放视频之前的音乐播放状态
        musicUrl: '' // 背景音乐地址
      }
    },
    watch: {
      isShowInformationPopup (val) {
        // true 显示弹框 false 关闭弹框
        this.$root.$emit('toggleModal', Boolean(val))
      },
      isCourseCustomerServicePopup (val) {
        // true 显示弹框 false 关闭弹框
        this.$root.$emit('toggleModal', Boolean(val))
        if (!val && this.isShowWaitPopup) this.isObtainCoursePopup = true
      },
      isObtainCoursePopup (val) {
        this.$root.$emit('toggleModal', Boolean(val))
        if (!val) {
          postReadTips({ id: this.courseInfo.id }).then(res => {
            if (res.data.code === 1 && res.data.data.is_give === 2) {
              let data = res.data.data.give_info
              this.courseInfo = {
                name: data.title,
                imgSrc: data.img_url,
                id: data.id
              }
              if (this.isPostersSharePopup || this.isCourseCustomerServicePopup) {
                this.isShowWaitPopup = true
              } else {
                this.isObtainCoursePopup = true
              }
            }
          })
        } else {
          this.isShowWaitPopup = false
        }
      },
      isPaymentPopup (val) {
        this.$root.$emit('toggleModal', Boolean(val))
      },
      isCamiloPaymentPopup (val) {
        this.$root.$emit('toggleModal', Boolean(val))
      },
      mUid () {
        this.configShareInfo(this.mUid)
      },
      isPostersSharePopup (val) {
        this.$root.$emit('toggleModal', Boolean(val))
        if (!val && this.isShowWaitPopup) this.isObtainCoursePopup = true
      }
    },
    computed: {
      fromUid () {
        return this.$route.params.from
      },
      mUid () {
        return this.$store.state.personalInfo.uid
      },
      uid () {
        return this.mUid || this.fromUid
      }
    },
    beforeRouteLeave (to, from, next) {
      this.countdownTimer && clearInterval(this.countdownTimer)
      this.isPlayMusic && this.__audio.pause()
      next()
    },
    created () {
      this.mine()
    },
    methods: {
      mine () {
        let that = this
        getParticularsDetail().then(res => {
          if (res.data.code === 1) {
            let data = res.data.data
            let buyInfo = data.buy_info // 购买信息
            let courseInfo = data.course_info // 课程信息
            let giveInfo = data.give_info
            that.shareInfo = data.share_info
            that.configShareInfo(that.uid)
            that.shufflingList.push(...that.transformShufflingList(data.buy_list))
            that.isParticipate = buyInfo.status !== 1
            that.isPerfectInformation = buyInfo.status === 3

            that.particularsInfo = {
              price: Number.isInteger(+courseInfo.price) ? parseInt(courseInfo.price) : courseInfo.price,
              originalPrice: Number.isInteger(+courseInfo.old_price) ? parseInt(courseInfo.old_price) : courseInfo.old_price
            }

            that.contentList = that.transformContentList(courseInfo.content)

            that.courseInfo = {
              name: giveInfo.title,
              imgSrc: giveInfo.img_url,
              id: giveInfo.give_course_id
            }

            that.isObtainCoursePopup = data.is_give === 2
            that.isOpening = courseInfo.status === 2

            that.postList = data.position_enums

            that.musicUrl = courseInfo.music_url
            that.countdownStarts()

            // 自动播放背景音乐
            if (that.musicUrl) {
              that.playAudio(that.musicUrl)
            }
          }
        })
      },
      // 倒计时
      countdownStarts () {
        this.contentList.forEach(item => {
          if (item.type === 7) {
            let countDown = item.countdown
            if (countDown > 0) {
              this.countdownTimer = setInterval(() => {
                if (countDown <= 1) {
                  clearInterval(this.countdownTimer)
                  this.countdownTimer = null
                } else {
                  countDown--
                  // 天
                  let day = parseInt(countDown / 86400)
                  day = day > 9 ? day : ('0' + day)
                  // 时
                  let hour = parseInt((countDown % 86400) / 3600)
                  hour = hour > 9 ? hour : ('0' + hour)
                  // 分
                  let minute = parseInt((countDown % 86400 % 3600) / 60)
                  minute = minute > 9 ? minute : ('0' + minute)
                  // 秒
                  let second = parseInt(countDown % 60)
                  second = second > 9 ? second : ('0' + second)
                  this.countdownData = {
                    day: day.toString().split(''),
                    hour: hour.toString().split(''),
                    minute: minute.toString().split(''),
                    second: second.toString().split('')
                  }
                }
              }, 1000)
            }
            this.countdownData = {
              day: '00'.toString().split(''),
              hour: '00'.toString().split(''),
              minute: '00'.toString().split(''),
              second: '00'.toString().split('')
            }
          }
        })
      },
      /**
       * 操作背景音乐
       */
      operationMusic () {
        if (this.isPlayMusic) {
          this.__audio.pause()
        } else {
          this.__audio.play()
        }
      },
      /**
       * @param src {String} 播放的音频路径
       * 播放背景音乐
       */
      playAudio (src) {
        let that = this
        if (that.__audio) {
          this.__audio.play(src)
        } else {
          that.__audio = new AudioContext({
            src: src,
            isFirst: false,
            onPlaying () {
              that.isPlayMusic = true
            },
            onPause () {
              that.isPlayMusic = false
            },
            onEnded () {
              that.__audio.play()
            }
          })
        }
      },
      /**
       * 配置分享信息
       */
      configShareInfo (uid) {
        if (this.shareInfo) {
          this.updateWXConfig()
          this.getWeiXinConfig({
            desc: this.shareInfo.content,
            img: this.shareInfo.img_url,
            title: this.shareInfo.title,
            link: `${location.origin}/particulars/from/${uid}`
          }).then(this.setWeiXinConfig)
        }
      },
      /**
       * 视频播放
       * @param itemIndex { Number } 选择视频父元素的角标
       * @param videoIndex { Number } 选择播放视频当前的角标
       */
      videoPlay (itemIndex, videoIndex) {
        let that = this
        // this.contentList[itemIndex].videoList[videoIndex].isVideoPlay = true
        let data = that.contentList[itemIndex].videoList[videoIndex]
        that.videoInfo = {
          videoUrl: data.src,
          imgSrc: data.cover
        }
        that.$nextTick(() => {
          that.isShowVideo = true
          that.beforeMusicState = that.isPlayMusic
          that.__audio.pause()
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
          that.beforeMusicState = that.isPlayMusic
          that.__audio.pause()
        })
      },
      /**
       * 关闭视频播放
       */
      videoClose () {
        this.isShowVideo = false
        if (this.beforeMusicState) {
          this.__audio.play()
        }
      },
      /**
       * 跳转链接
       * @param url {String} 跳转链接
       */
      jumpLink (url) {
        this.$_.entryOtherPage(url)
      },
      // 分享
      share () {
        this.isPostersSharePopup = true
      },
      // 立即抢购
      immediately () {
        if (this.isOpening) {
          this.isPaymentPopup = true
        } else {
          MessageBox({
            message: '课程报名已截止，敬请期待蜕变营的下一期开营招生！',
            confirmButtonText: '好的'
          })
        }
      },
      // 选择卡密支付
      jumpCamiloPayment () {
        this.isPaymentPopup = false
        this.isCamiloPaymentPopup = true
      },
      // 确认购买
      determinePayment () {
        let that = this
        postBuyNow({ from_uid: that.fromUid }).then(res => {
          if (res.data.code === 1) {
            // 付款成功弹出
            window.wx.chooseWXPay({
              ...res.data.data.js_sdk_config,
              success (res) {
                that.isPaymentPopup = false
                that.isShowInformationPopup = true
                that.isParticipate = true
                that.$_.store.dispatch('getPayCommunityState')
              }
            })
          }
        })
      },
      /**
       * 卡密支付
       * @param camilo {String | Number} 输入的卡密
       */
      determineCamiloPayment (camilo) {
        postKalmanPay({
          code: camilo,
          from_uid: this.fromUid
        }).then(res => {
          if (res.data.code === 1) {
            this.isCamiloPaymentPopup = false
            this.isShowInformationPopup = true
            this.isParticipate = true
            this.$_.store.dispatch('getPayCommunityState')
          }
        })
      },
      // 参与课程
      participate () {
        if (!this.isPerfectInformation) { // 未完善信息
          this.isShowInformationPopup = true
        } else {
          // this.$router.push({
          //   name: 'column-details'
          // })
          this.isCourseCustomerServicePopup = true
        }
      },
      /**
       * 确认个人信息
       * @param info {Object} 相关数据
       */
      determineInformation (info) {
        let that = this
        let otherPost = ''
        if (info.otherPost !== '') {
          otherPost = info.otherPost
        } else {
          otherPost = info.post.name
        }
        let params = {
          mobile: info.phone,
          name: info.nickname,
          position: otherPost,
          type: info.post.key
        }
        if (info.nickname === '' || info.phone === '' || info.post === '') {
          that.$_.Toast('信息需全部填写')
        } else if (info.nickname.length < 2 || info.nickname.length > 5) {
          that.$_.Toast('大于两个字，小于5个字')
        } else if (!(/^\d{6,20}$/.test(info.phone))) {
          that.$_.Toast('手机格式不正确')
        } else {
          postInformation(params).then(res => {
            if (res.data.code === 1) {
              that.isShowInformationPopup = false
              that.isCourseCustomerServicePopup = true
              that.isPerfectInformation = true
            }
          })
        }
      },
      // 课程邀请好友
      obtainCourseInvite () {
        this.isObtainCoursePopup = false
        this.isPostersSharePopup = true
      },
      // 联系客服
      obtainCourseService () {
        this.isCourseCustomerServicePopup = true
        this.isObtainCoursePopup = false
      },
      /**
       * 转换轮播数据
       * @param source {Object} 需要转换的数据源
       * @return {Object} 转换后可以直接使用的结构
       */
      transformShufflingList (source) {
        let list = []
        source.forEach(item => {
          list.push({
            name: item.nick_name,
            time: item.time
          })
        })
        return list
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
            type: item.mark_format, // 类型 1图片 2文本 3单个视频 4多个视频 6多链接 7倒计时
            title: item.title, // 标题
            text: item.resource, // 文本内容
            countdown: item.time, // 倒计时秒
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
  .particulars {
    padding-bottom: 1.2rem;
    background-color: #fff;

    &__shuffling {
      position: sticky;
      top: 0;
      z-index: 2;
      display: flex;
      align-items: center;
      height: .64rem;
      padding: 0 .78rem;
      background: #eaf8fd url("~@icon/community/notice.png") no-repeat .3rem center;
      background-size: .3rem;

      .shuffling {
        flex: 1;
        height: .64rem;
        line-height: .64rem;
        color: #333;
        font-size: .28rem;
        .ellipsisLn(1);
      }

      .name {
        color: #fa4909;
      }

      .time {
        margin-left: .1rem;
      }
    }

    &__music {
      position: fixed;
      top: .98rem;
      right: .4rem;
      width: .84rem;
      height: .84rem;
      z-index: 2;

      .music {
        display: block;
        width: 100%;
        height: 100%;
        background: url("~@images/community/music.png") no-repeat center;
        background-size: contain;
      }

      .play {
        animation: transformTanslate 2s linear infinite;
      }
    }

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
        flex: 1;
      }

      .price {
        color: #fe5832;
        font-size: .64rem;
        font-weight: bold;

        &::before {
          content: '￥';
          font-size: .34rem;
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

      .share {
        border-top-left-radius: 1rem;
        border-bottom-left-radius: 1rem;
        background: linear-gradient(to right, #fec911, #ff960f);

        &:active {
          background: linear-gradient(to left, #fec911, #ff960f);
        }
      }

      .immediately {
        border-top-right-radius: 1rem;
        border-bottom-right-radius: 1rem;
        background: linear-gradient(to right, #ff7606, #fe4006);

        &:active {
          background: linear-gradient(to left, #ff7606, #fe4006);
        }
      }

      .participate {
        position: relative;
        color: #333;
        border-top-right-radius: 1rem;
        border-bottom-right-radius: 1rem;
        border: 1px solid #e9ebed;
        background-color: #f5f5f5;

        &:active {
          background-color: darken(#f5f5f5, 5%);
        }

        &::before {
          position: absolute;
          top: -.5rem;
          right: 0;
          content: '已购买';
          padding: .02rem .1rem;
          color: #333;
          font-size: .24rem;
          font-weight: bold;
          transform: scale(.83);
          border: 1px solid #e9ebed;
          border-radius: .16rem;
          background-color: #fc0;
        }

        &::after {
          position: absolute;
          top: -.2rem;
          right: .7rem;
          content: '';
          width: .1rem;
          height: .1rem;
          transform: rotate(45deg);
          background-color: #fc0;
        }
      }
    }
  }

  .entrance {
    position: fixed;
    bottom: 2.08rem;
    right: .6rem;
    width: .92rem;
    height: .92rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    border-radius: 1rem;
    line-height: 1.2;
    color: #fff;
    font-size: .26rem;
    font-weight: bold;
    box-shadow: 0 1px 2px 0 rgba(157, 112, 4, .46);
    background-color: rgba(255, 184, 19, .96);

    &:active {
      background-color: darken(rgba(255, 184, 19, .96), 5%);
    }
  }

  @keyframes transformTanslate {
    0% {
      transform: rotate(0);
    }

    25% {
      transform: rotate(90deg);
    }

    50% {
      transform: rotate(180deg);
    }

    75% {
      transform: rotate(270deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
</style>
