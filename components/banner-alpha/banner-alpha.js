
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
        let displayStats = this.createDisplayStats(newVal, 0);
        this.setData({
          displayStats: displayStats,
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
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    displayStats: [],
    currentIndex: 0,
    imageWidthRpx: 0,
    imageHeightRpx: 0,
    smallImageWidthRpx: 0,
    smallImageHeightRpx: 0,
  },

  /**
   * 组件的方法列表
   */
  methods: {

    /**
     * 更新显示数据
     */
    createDisplayStats: function (items, index) {

      if (items == null || items.length <= 0) return [];

      let imageSizeRatio = this.data.imageSizeRatio;

      // 计算图片大小

      let imageWidth = Math.ceil(imageSizeRatio * this.data.widthRpx);
      this.data.imageWidthRpx = imageWidth;
      let imageHeight = Math.ceil(imageSizeRatio * this.data.heightRpx);
      this.data.imageHeightRpx = imageHeight;

      this.data.smallImageWidthRpx = Math.ceil(imageWidth * 0.8);
      this.data.smallImageHeightRpx = Math.ceil(imageHeight * 0.8);

      // 排列开始位置
      let startLeft = Math.ceil((1 - imageSizeRatio) * this.data.widthRpx / 2);
      let startTop = Math.ceil((1 - imageSizeRatio) * this.data.heightRpx / 2);

      let displayStats = new Array();
      for (let i of [-2, -1, 0, 1, 2]) {
        
        let realIndex = index + i;
        while(realIndex < 0) {
          realIndex = realIndex + items.length;
        }
        realIndex = realIndex % items.length;

        let item = items[realIndex];

        // 图片URL
        let imageUrl = item.imageUrl;

        // 位置
        let left = startLeft + i * (imageWidth + this.data.imageGapRpx);
        let top = startTop;

        displayStats.push({
          imageUrl: item.imageUrl,
          width: imageWidth,
          height: imageHeight,
          left: left,
          top: top,
          animation: null,
        });
      }

      return displayStats;
    },

    /**
     * 水平移动
     */
    moveHorizontal: function (direction) {
      let currentIndex = this.data.currentIndex + direction;
      while (currentIndex < 0) {
        currentIndex += this.data.items.length;
      }
      let newDisplayStats = this.createDisplayStats(this.data.items, currentIndex);
      this.setData({
        currentIndex: currentIndex,
        displayStats: newDisplayStats,
      });
    },

    /**
     * 向左移动
     */
    moveLeft: function () {
      this.moveHorizontal(-1);
    },

    /**
     * 向右移动
     */
    moveRight: function () {
      this.moveHorizontal(1);
    },
  }
})
