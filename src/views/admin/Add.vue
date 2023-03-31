<template>
  <div style="padding: 20px">
    <h2 style="margin-bottom: 30px">新增管理员</h2>
    <el-form :model="form" :rules="rules" ref="ruleForm" label-width="100px">
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
      <el-form-item label="邮箱" prop="email">
        <el-col :span="8">
          <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item label="管理员状态" prop="adminStatus">
        <el-select v-model="form.adminStatus" placeholder="请选择状态">
          <el-option v-for="item in adminData" :key="item.id" :label="item.value" :value="item.valueId"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="save">提交</el-button>
        <el-button type="danger" @click="reset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import request from "@/uitls/request";

export default {
  name: "Add",
  data(){
    const checkUsername = (rule, value, callback) => {
      request.get('/admin/checkUsername/'+value, ).then(res =>{
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
      status:'admin_status',
      adminData:[],
      form:{},
      rules: {
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
        adminStatus:[
          { required:true,message:'请选择状态',trigger:'blur' }
        ]
      }
    }
  },
  created() {
    this.getStatusData()
  },
  methods:{
    getStatusData(){
      //状态获取
      request.get('/data/getDataByKey', {
        params: {
          key:this.status
        }
      }).then(res =>{
        if (res.code === '200'){
          this.adminData = res.data
        }
      })
    },
    save(){
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          request.post('/admin/add',this.form).then(res=>{
            if (res.code === '200'){
              this.$notify.success({
                duration: 2500,
                message: "新增成功",
                offset: 50,
              })
              this.form = {};
            }else{
              this.$notify.error({
                message: res.msg,
                offset: 50
              })
            }
          })
        }
      });
    },
    reset(){
      this.$refs['ruleForm'].resetFields();
    }
  }
}
</script>

<style scoped>

</style>
