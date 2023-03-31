<template>
  <div class="container">
    <el-card class="cover" v-if="loginAdmin.id">
      <slide-verify :l="42"
                    :r="10"
                    :w="310"
                    :h="155"
                    :accuracy="5"
                    :imgs="imgs"
                    slider-text="向右滑动"
                    @success="onSuccess"
                    @fail="onFail"
                    @refresh="onRefresh"
      ></slide-verify>
    </el-card>
    <div class="loginDiv">
      <div class="title">登录</div>
      <el-form :model="form" ref="loginForm" :rules="rules">
        <el-form-item prop="username">
            <el-input placeholder="请输入用户名" v-model="form.username" prefix-icon="el-icon-user" size="medium"></el-input>
        </el-form-item>
        <el-form-item prop="pwd">
            <el-input placeholder="请输入密码" v-model="form.pwd" prefix-icon="el-icon-lock" size="medium" @keyup.enter.native="login" show-password></el-input>
        </el-form-item>
        <el-form-item>
          <el-button class="loginBtn" size="medium" type="primary" @click="login">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import request from "@/uitls/request";
import Cookies from 'js-cookie';
import img1 from '@/assets/img/1.jpg';
import img2 from '@/assets/img/2.jpg';
import img3 from '@/assets/img/3.jpg';

export default {
  name: "Login",
  data(){
    return{
      loginAdmin: {},
      imgs: [
        img1,
        img2,
        img3
      ],
      form:{},
      rules: {
        username:[
          { required:true,message:'用户名不能为空',trigger:'blur' },
          { min: 2, max: 5, message: '长度在 2 到 5 个字符', trigger: 'blur' }
        ],
        pwd:[
          { required:true,message: "密码不能为空", trigger: "blur" },
          { min: 5, max: 12, message: "长度在 5 到 12个字符", trigger: "blur" }
        ]
      }
    }
  },
  methods:{
    login(){
      this.$refs['loginForm'].validate((valid) => {
        if (valid) {
            request.post('/admin/login',this.form).then(res=>{
              if (res.code === '200'){
                this.loginAdmin = res.data  // 滑块组件就出现了
              }else{
                this.$notify.error({
                  message: res.msg,
                  offset: 50
                })
              }
            })
        }
      })
    },
    onSuccess() { // 滑块验证通过之后触发的
      Cookies.set('admin', JSON.stringify(this.loginAdmin),{expires:7})
      this.$notify.success({
        duration: 2500,
        message: '登录成功',
        offset: 50
      })
      this.$router.push('/')
    },
    onFail() {
      console.log('onFail')
    },
    onRefresh() {
      console.log('refresh')
    }
  }

}
</script>

<style scoped>
.container{
  height: 100vh;
  background-image: linear-gradient(to bottom right, #FC466B, #3F5EFB);
  overflow: hidden;
}
.cover {
  width: fit-content;
  background-color: white;
  position: absolute;
  top:40%;
  left:50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}
.loginDiv{
  width: 500px;
  height: 400px;
  background-color: white;
  border-radius: 10px;
  margin: 150px auto;
  padding: 50px;
}
.title{
  margin: 30px;
  text-align: center;
  font-size:30px;
  font-weight: bold;
  color: dodgerblue;
}
.loginBtn{
  width: 100%;
}
</style>
