<template>
  <div style="padding: 20px">
    <h2 style="margin-bottom: 30px">新增用户</h2>
    <el-form :model="form" :rules="rules" ref="ruleForm" label-width="100px">
      <el-form-item label="昵称" prop="nickname">
        <el-col :span="8">
          <el-input v-model="form.nickname" placeholder="请输入昵称"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="用户名" prop="username">
        <el-col :span="8">
          <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="密码" prop="pwd">
        <el-col :span="8">
          <el-input v-model="form.pwd" placeholder="请输入密码" show-password></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="确认密码" prop="checkPwd">
        <el-col :span="8">
          <el-input v-model="form.checkPwd" placeholder="请再次输入密码" show-password></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="年龄" prop="age">
        <el-col :span="8">
          <el-input-number v-model="form.age" controls-position="right" :min="1" :max="120"></el-input-number>
        </el-col>
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-col :span="8">
          <el-radio-group v-model="form.sex">
            <el-radio label="男"></el-radio>
            <el-radio label="女"></el-radio>
          </el-radio-group>
        </el-col>
      </el-form-item>
      <el-form-item label="头像" prop="headImg">
        <el-col :span="8">
          <el-upload
              class="avatar-uploader"
              action=""
              list-type="picture"
              :show-file-list="false"
              :auto-upload="false"
              :on-change="changeUpload">
            <img v-if="this.form.headImg" :src="imgPath+this.form.headImg" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-col>
      </el-form-item>
      <el-form-item label="用户状态" prop="userStatus">
        <el-select v-model="form.userStatus" placeholder="请选择状态">
          <el-option v-for="item in userData" :key="item.id" :label="item.value" :value="item.valueId"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save">提交</el-button>
        <el-button type="danger" @click="reset">重置</el-button>
      </el-form-item>
    </el-form>
    <!--头像裁剪组件-->
    <CropperImg ref="CropperImgRef" @data="setHeadImg"/>
  </div>
</template>

<script>
import request from "@/uitls/request";
import CropperImg from "@/views/user/CropperImg";

export default {
  name: "Add",
  components:{CropperImg},
  data(){
    const checkUsername = (rule, value, callback) => {
      request.get('/user/checkUsername/'+value, ).then(res =>{
        if (res.code === '200'){
          callback(new Error(res.data));
        }else {
          callback();
        }
      })
    };
    const equalToPassword = (rule, value, callback) => {
      if (this.form.pwd !== value) {
        callback(new Error("两次输入的密码不一致"));
      } else {
        callback();
      }
    };
    return{
      status:'user_status',
      userData:[],
      imgPath:"http://localhost:9090/gc/back/user/download/",
      form:{
        headImg:''
      },
      rules: {
        nickname:[
          { required:true,message:'昵称不能为空',trigger:'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        username:[
          { required:true,message:'用户名不能为空',trigger:'blur' },
          { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'blur' },
          { required: true, validator: checkUsername, trigger: "blur" }
        ],
        pwd:[
          { required: true, message: "密码不能为空", trigger: "blur" },
          { min: 5, max: 12, message: "长度在 5 到 12个字符", trigger: "blur" }
        ],
        checkPwd:[
          { required: true, message: "确认密码不能为空", trigger: "blur" },
          { required: true, validator: equalToPassword, trigger: "blur" }
        ],
        age:[
          { required: true, message: "年龄不能为空", trigger: "blur" }
        ],
        sex:[
          { required:true,message:'请选择性别',trigger:'blur' }
        ],
        headImg:[
          { required:true,message:'请上传头像',trigger:'blur' }
        ],
        userStatus:[
          { required:true,message:'请选择状态',trigger:'blur' }
        ]
      }
    }
  },
  created() {
    this.getStatusData()
  },
  methods: {
    getStatusData() {
      //状态获取
      request.get('/data/getDataByKey', {
        params: {
          key: this.status
        }
      }).then(res => {
        if (res.code === '200') {
          this.userData = res.data
        }
      })
    },
    save() {
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          request.post('/user/add', this.form).then(res => {
            if (res.code === '200') {
              this.$notify.success({
                duration: 2500,
                message: "新增成功",
                offset:50
              })
              this.form = {
                headImg:''
              };
            } else {
              this.$notify.error({
                message: res.msg,
                offset: 50
              })
            }
          })
        }
      });
    },
    reset() {
      this.$refs['ruleForm'].resetFields();
      this.form = {
        headImg:''
      };
    },
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
      this.$nextTick(() => { // 赋值给裁剪窗体
        this.$refs.CropperImgRef.option.img = file.url
        this.$refs.CropperImgRef.option.name = file.name
        this.$refs.CropperImgRef.cropperVisible = true
      })
    },
    setHeadImg(data){
      this.form.headImg = data;
    }
  }
}
</script>

<style scoped>
.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100px;
  height: 100px;
}
.avatar-uploader:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}
.avatar {
  width: 100px;
  height: 100px;
  display: block;
}
</style>
