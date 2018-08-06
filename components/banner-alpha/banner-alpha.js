
/**
 * copy对象
 */
function copy(o) {
  if (o == null) return null;
  let ret = {};
  for (let key in o) {
    ret[key] = o[key];
  }
  return ret;
}

Component({
  /**
   * 组件的属性列表
   */
  properties: {

    items: {
      type: Array,
      value: [],
      observer: function (newVal, oldVal, changedPath) {
        this.updateMetaData(newVal);
        let displayItems = this.createDisplayItemList(newVal);
        this.setData({
          displayItems: displayItems,
        });
      }
    },

    /**
     * 整个Banner宽度，单位：rpx
     */
    widthRpx: {
      type: Number,
      value: 750,
    },

    /**
     * 整个Banner高度，单位: rpx
     */
    heightRpx: {
      type: Number,
      value: 100,
    },

    /**
     * 图片大小所占比例
     */
    imageSizeRatio: {
      type: Number,
      value: 0.8,
    },

    /**
     * 图片间隔大小，单位：rpx
     */
    imageGapRpx: {
      type: Number,
      value: 20,
    },

    /**
     * 是否自动播放
     */
    autoPlay: {
      type: Boolean,
      value: false,
    },

    /**
     * 自动播放的时间间隔
     */
    duration: {
      type: Number,
      value: 2000,
    },

    /**
     * 是否显示indicator
     */
    indicator: {
      type: Boolean,
      value: false,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    displayItems: [],
    currentIndex: 0,
    animating: false,
    autoPlayInterval: null,
  },

  ready: function () {
    this.updateAutoPlay();
  },

  /**
   * 组件的方法列表
   */
  methods: {

    /**
     * 更新显示数据
     */
    createDisplayItemList: function (items) {

      if (items == null || items.length <= 0) return [];

      let displayItems = new Array();

      let positionIndex = 0;
      for (let i of [-2, -1, 0, 1, 2]) {
        // 计算实际数据index
        let realIndex = this.normalizeIndex(i, items.length);
        let displayItem = this.createDisplayItem(items, realIndex, positionIndex++);
        displayItems.push(displayItem);
      }

      return displayItems;
    },

    /**
     * 计算功能数据
     */
    updateMetaData: function (items) {

      let imageSizeRatio = this.data.imageSizeRatio;

      // 设备信息
      let systemInfo = wx.getSystemInfoSync();
      let toPx = rpx => {
        return rpx / 750 * systemInfo.windowWidth;
      };

      // Banner大小
      let width = toPx(this.data.widthRpx);
      let height = toPx(this.data.heightRpx);

      // 计算中间大图片大小

      let imageWidth = Math.ceil(imageSizeRatio * width);
      let imageHeight = Math.ceil(imageSizeRatio * height);

      // 计算两侧小图片大小

      let smallImageWidth = Math.ceil(imageWidth * 0.8);
      let smallImageHeight = Math.ceil(imageHeight * 0.8);

      // 计算各图片位置
      let centerImageTop = Math.ceil((height - imageHeight) / 2);
      let smallImageTop = Math.ceil((height - smallImageHeight) / 2);

      let imageGap = Math.ceil(toPx(this.data.imageGapRpx));

      let imagePositionArray = new Array(5);

      // 中间图片
      imagePositionArray[2] = {
        left: Math.ceil((width - imageWidth) / 2),
        top: centerImageTop,
        width: imageWidth,
        height: imageHeight,
      };

      // 向外一个
      imagePositionArray[1] = {
        left: Math.ceil(imagePositionArray[2].left - (imageGap + smallImageWidth)),
        top: smallImageTop,
        width: smallImageWidth,
        height: smallImageHeight,
      };
      imagePositionArray[3] = {
        left: Math.ceil(imagePositionArray[2].left + (imageGap + imageWidth)),
        top: smallImageTop,
        width: smallImageWidth,
        height: smallImageHeight,
      };

      // 向外两个
      imagePositionArray[0] = {
        left: Math.ceil(imagePositionArray[1].left - (imageGap + smallImageWidth)),
        top: smallImageTop,
        width: smallImageWidth,
        height: smallImageHeight,
      };
      imagePositionArray[4] = {
        left: Math.ceil(imagePositionArray[3].left + (imageGap + smallImageWidth)),
        top: smallImageTop,
        width: smallImageWidth,
        height: smallImageHeight,
      };

      // 指示数据
      let indicatorArray = new Array(items.length);
      for (let i = 0; i < items.length; i++) {
        indicatorArray[i] = i;
      }

      let animationDuration = 500;
      let timingFunction = 'ease-in';

      let meta = {
        imageWidth: imageWidth,
        imageHeight: imageHeight,
        smallImageWidth: smallImageWidth,
        smallImageHeight: smallImageHeight,
        imagePositionArray: imagePositionArray,
        animationDuration: animationDuration,
        timingFunction: timingFunction,
        indicatorArray: indicatorArray,
      };

      // 生成动画style
      meta.animationStyle = `transition:${animationDuration}ms ${timingFunction} 0ms;transition-property:transform,left,top,width,height;transform-origin:50% 50% 0;-webkit-transition:${animationDuration}ms ${timingFunction} 0ms;-webkit-transition-property:transform,left,top,width,height;-webkit-transform-origin:50% 50% 0`;

      this.setData({
        meta: meta,
      });
    },

    /**
     * 创建显示项目
     */
    createDisplayItem: function (items, itemIndex, positionIndex) {

      // 计算实际数据index
      let realIndex = this.normalizeIndex(itemIndex, items.length);

      let meta = this.data.meta;
      let item = this.data.items[realIndex];

      let position = meta.imagePositionArray[positionIndex];
      return {
        key: `${Math.random()}`,
        left: position.left,
        top: position.top,
        width: position.width,
        height: position.height,
        imageUrl: item.imageUrl,
        style: `width:${position.width}px;height:${position.height}px;left:${position.left}px;top:${position.top}px;`,
        animate: false,
      };
    },

    /**
     * 向左移动
     */
    moveLeft: function () {

      let displayItems = this.data.displayItems;
      if (displayItems.length <= 0) return;

      if (this.data.animating) return;

      this.data.animating = true;

      // 中间按钮
      this.animateToPosition(displayItems[1], 0);
      this.animateToPosition(displayItems[2], 1);
      this.animateToPosition(displayItems[3], 2);
      this.animateToPosition(displayItems[4], 3);

      displayItems.splice(0, 1);
      let currentIndex = this.data.currentIndex;
      displayItems.push(this.createDisplayItem(this.data.items, currentIndex + 3, 4));

      this.setData({
        displayItems: displayItems,
      });

      setTimeout(function () {
        this.data.animating = false;
        this.setData({
          currentIndex: this.normalizeIndex(currentIndex + 1, this.data.items.length),
        });
      }.bind(this), this.data.meta.animationDuration);
    },

    /**
     * 向右移动
     */
    moveRight: function () {

      let displayItems = this.data.displayItems;
      if (displayItems.length <= 0) return;

      if (this.data.animating) return;

      this.data.animating = true;

      // 中间按钮
      this.animateToPosition(displayItems[0], 1);
      this.animateToPosition(displayItems[1], 2);
      this.animateToPosition(displayItems[2], 3);
      this.animateToPosition(displayItems[3], 4);

      displayItems.splice(4, 1);
      let currentIndex = this.data.currentIndex;
      displayItems = [this.createDisplayItem(this.data.items, currentIndex - 3, 0)].concat(displayItems);

      this.setData({
        displayItems: displayItems,
      });

      setTimeout(function () {
        this.data.animating = false;
        this.setData({
          currentIndex: this.normalizeIndex(currentIndex - 1, this.data.items.length),
        });
      }.bind(this), this.data.meta.animationDuration);
    },

    /**
     * 设定图片动画
     */
    animateToPosition: function (displayItem, positionIndex) {
      let meta = this.data.meta;
      let position = meta.imagePositionArray[positionIndex];
      displayItem.left = position.left;
      displayItem.top = position.top;
      displayItem.width = position.width;
      displayItem.height = position.height;
      displayItem.style = `width:${position.width}px;height:${position.height}px;left:${position.left}px;top:${position.top}px;`;
      displayItem.animate = true;
    },

    /**
      * 更新自动播放
      */
    updateAutoPlay: function () {

      let autoPlay = this.data.autoPlay;
      let duration = this.data.duration;

      let autoPlayInterval = this.data.autoPlayInterval;
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
      }

      let displayItems = this.data.displayItems;
      if (displayItems.length <= 0) return;

      if (autoPlay) {
        this.data.autoPlayInterval = setInterval(function () {
          this.moveLeft();
        }.bind(this), duration);
      }
    },

    /**
     * 点击Banner
     */
    clickBanner: function () {

      if (this.data.animating) return;

      let currentIndex = this.data.currentIndex;
      let itemLength = this.data.items.length;
      while (currentIndex < 0) {
        currentIndex += itemLength;
      }
      if (currentIndex >= itemLength) {
        currentIndex = currentIndex % itemLength;
      }
      this.triggerEvent('click', { index: currentIndex }, { bubbles: true });
    },

    /**
     * 开始点击
     */
    bannerTouchDown: function (e) {
      let touch = e.changedTouches[0];
      this.data.touchDownPoint = { x: touch.clientX, y: touch.clientY };
    },

    /**
     * 点击结束
     */
    bannerTouchUp: function (e) {

      if (this.data.animating) return;

      let touch = e.changedTouches[0];
      let point = { x: touch.clientX, y: touch.clientY };
      let startPoint = this.data.touchDownPoint;
      let delta = point.x - startPoint.x;
      console.log(delta);
      if (Math.abs(delta) <= 70) {
        return;
      }
      if (delta > 0) {
        this.moveRight();
        this.updateAutoPlay();
      } else {
        this.moveLeft();
        this.updateAutoPlay();
      }
    },

    /**
     * 点击左侧
     */
    clickLeft: function (e) {
      this.moveRight();
      this.updateAutoPlay();
    },

    /**
     * 点击右侧
     */
    clickRight: function (e) {
      this.moveLeft();
      this.updateAutoPlay();
    },

    /**
     * 规范化Index
     */
    normalizeIndex: function (index, count) {
      if (count <= 0) return 0;
      let ret = index;
      while (ret < 0) {
        ret += count;
      }
      if (ret >= count) {
        ret = ret % count;
      }
      return ret;
    },
  },
})
