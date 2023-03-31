<template>
  <el-dialog title="裁剪轮播图" width="600px" :visible.sync="cropperVisible" append-to-body>
    <el-container>
      <el-col :span="18">
        <div class="cropper">
          <!--组件vueCropper-->
          <vueCropper
              ref="cropper"
              :img="option.img"
              :info="true"
              :info-true="option.infoTrue"
              :output-size="option.size"
              :output-type="option.outputType"
              :auto-crop="option.autoCrop"
              :autoCropWidth="option.autoCropWidth"
              :autoCropHeight="option.autoCropHeight"
              :fixed="option.fixed"
              :fixed-box="option.fixedBox"
              :fixed-number="option.fixedNumber"
              :full="option.full"
              :can-move="option.canMove"
              :can-move-box="option.canMoveBox"
              :can-scale="option.canScale"
              :original="option.original"
              :center-box="option.centerBox"
              @realTime="realTime"/>
        </div>
      </el-col>
     <el-col :span="6">
       <div :style="box">
         <img :src="previews.url" :style="previews.img">
       </div>
     </el-col>
    </el-container>
    <div slot="footer" class="dialog-footer">
      <el-button>
        <el-upload list-type="picture" action="" :auto-upload="false" :show-file-list="false" :on-change="changeUpload">
          <i class="el-icon-refresh" style=" margin-right: 5px;"> 重新上传</i>
        </el-upload>
      </el-button>
      <el-button @click="cropperVisible = false">取 消</el-button>
      <el-button type="primary" @click="finish">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
import axios from 'axios'

export default {
  name: "CropperImg",
  data() {
    return {
      cropperVisible: false,
      option: {
        name: '', // 裁剪图片名称
        img: '',  // 裁剪图片地址
        info: true, // 裁剪框的大小信息
        infoTrue: false, // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
        outputSize: 1, // 裁剪生成图片的质量
        outputType: 'png', // 裁剪生成图片的格式
        autoCrop: true, // 是否默认生成截图框
        autoCropWidth: 320, // 默认⽣成截图框宽度
        autoCropHeight:180, // 默认⽣成截图框⾼度
        fixed: true, // 是否开启截图框宽高固定比例
        fixedBox: true, // 是否开启截图框宽⾼固定⽐例
        fixedNumber: [16, 9], // 截图框的宽高比例
        full: false, // 是否输出原图比例的截图
        canMoveBox: true, // 截图框能否拖动
        canMove: true, // 图⽚是否可以移动
        canScale: true, // 图片是否允许滚轮缩放
        original: false, // 上传图片按照原始比例渲染
        centerBox: true, // 截图框是否被限制在图片里面
      },
      previews: {},
      circle:{},
      box:{},
    }
  },
  methods: {
    changeUpload(file) {
      let tempImg = file.name.substring(file.name.lastIndexOf('.') + 1)
      const isLt10M = file.size / 1024 / 1024 < 10;
      const isJPG = tempImg === 'jpg'
      const isPNG = tempImg === 'png'

      if (!isLt10M) {
        this.$message.error('上传头像图片大小不能超过 10MB!');
      }
      if (!isJPG && !isPNG) {
        this.$message.error('上传头像图片只能是 JPG 或 PNG 格式!');
        return;
      }
      this.$nextTick(() => {
        this.option.img = file.url
        this.option.name = file.name
        this.cropperVisible = true
      })
    },
    finish() {
      this.$refs.cropper.getCropBlob(async (blob) => {
        let fd = new FormData() //转formData格式 获取的是blob类型,后端只支持文件类型
        let file = new File([blob], this.option.name, { type: "image/jpg"});
        fd.append('file', file);
        axios.post('http://localhost:9090/gc/back/banner/upload', fd, {headers: {'Content-Type': 'multipart/form-data'}})
            .then(res => {
              res = res.data;
              if (res.code === '200'){
                this.$emit('data',res.data);
                this.cropperVisible = false;
              }
        })
      })
    },
    realTime(data) {
      this.box = {
        width:  data.w+'px',
        height: data.h+'px',
        overflow: 'hidden',
        margin:'300px -20px',
        zoom: 0.5
      }
      this.previews = data;
    }
  }
}
</script>

<style scoped>
.cropper {
  width: 400px;
  height: 400px;
}
</style>
