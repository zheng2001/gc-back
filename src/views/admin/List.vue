<template>
  <div style="padding: 20px">
    <!--搜索表单-->
    <div style="margin-bottom: 20px">
      <el-input style="width: 200px;" placeholder="请输入用户名" v-model="params.username"></el-input>
      <el-select v-model="params.adminStatus" placeholder="请选择状态" style="margin-left: 10px">
        <el-option v-for="item in adminData" :key="item.id" :label="item.value" :value="item.valueId"></el-option>
      </el-select>
      <el-button style="margin-left:10px;" type="primary" @click="load">
        <i class="el-icon-search" style="padding-right: 5px"></i>搜索
      </el-button>
      <el-button style="margin-left:5px;" type="warning" @click="reset">
        <i class="el-icon-refresh" style="padding-right: 5px"></i>重置
      </el-button>
    </div>
    <!--列表显示-->
    <el-table :data="adminList" stripe>
      <el-table-column prop="id" label="编号"></el-table-column>
      <el-table-column prop="username" label="用户名"></el-table-column>
      <el-table-column prop="email" label="邮箱"></el-table-column>
      <el-table-column prop="adminStatus" label="状态">
        <template v-slot="scope">
          <!--scope.row 当前行数据-->
          {{scope.row.adminStatus == '0' ?'禁用':'正常'}}
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间"></el-table-column>
      <el-table-column prop="loginTime" label="最近登录时间"></el-table-column>
      <el-table-column label="操作">
        <template v-slot="scope">
          <el-button type="primary" @click="showEdit(scope.row.id)">编辑</el-button>
          <el-button type="danger" :disabled="isSelf===scope.row.id" @click="del(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <div style="margin-top: 20px">
      <el-pagination
          background
          :current-page="params.pageNum"
          :page-size="params.pageSize"
          layout="total,prev, pager, next,jumper"
          @current-change ="handleCurrentChange"
          :total="total">
      </el-pagination>
    </div>
    <!--编辑窗体-->
    <el-dialog title="编辑" :visible.sync="editFormVisible" :before-close="handleEditClose">
      <el-form :model="editForm" label-width="100px" :rules="rules" ref="ruleForm">
        <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="修改密码">
            <el-switch
                v-model="isChange"
                active-color="#13ce66"
                active-text="是"
                inactive-text="否"
                @change="isClose">
            </el-switch>
        </el-form-item>
        <el-form-item label="密码" prop="pwd">
            <el-input v-model="editForm.pwd" show-password :disabled="!isChange"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
            <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="管理员状态" prop="adminStatus">
            <el-select v-model="editForm.adminStatus">
              <el-option v-for="item in adminData" :key="item.id" :label="item.value" :value="item.valueId"></el-option>
            </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelEdit">取 消</el-button>
        <el-button type="primary" @click="edit">编 辑</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from "@/uitls/request";
import Cookies from 'js-cookie'

export default {
  name: "List",
  data(){
    const checkPwd = (rule, value, callback) => {
      if (this.isChange == true) {
        if(value === ''){
          callback(new Error("密码不能为空！"));
        }else {
          if (value.length<5 || value.length>12){
            callback(new Error("长度在 5 到 12个字符"));
          }
          callback();
        }
      } else {
        callback();
      }
    };
    const checkChange= (rule, value, callback) => {
      if (this.editForm.id === JSON.parse(Cookies.get('admin')).id && !value){
        callback(new Error("您的操作不合法！不能修改自己的状态！"));
      }else {
        callback();
      }
    };
    return{
      status:'admin_status',
      adminData:[],
      adminList:[],
      total:0,
      params:{
        pageNum: 1,
        pageSize: 10,
        username: '',
        adminStatus:''
      },
      editFormVisible: false,
      editForm:{
        id:'',
        username:'',
        pwd:'',
        email:'',
        adminStatus:''
      },
      isChange:false,
      rules: {
        pwd:[
          { validator: checkPwd, trigger: "blur" }
        ],
        adminStatus:[
          { validator: checkChange,trigger: "blur" }
        ]
      }
    }
  },
  created() {
    this.getStatusData();
    this.load();
  },
  computed: {
    isSelf(){
      return JSON.parse(Cookies.get('admin')).id
    }
  },
  methods:{
    //状态获取
    getStatusData(){
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
    // 列表加载
    load(){
      request.get('/admin/list', {
        params:this.params
      }).then(res =>{
          if (res.code === '200'){
            this.adminList = res.data.list;
            this.total = res.data.total;
          }
      })
    },
    // 重置
    reset(){
      this.params = {
        pageNum: 1,
        pageSize: 10,
        username: '',
        adminStatus:''
      }
      this.load()
    },
    // 点击分页按钮触发分页
    handleCurrentChange(pageNum){
      this.params.pageNum = pageNum
      this.load()
    },
    //显示编辑
    showEdit(id){
      this.editForm = {
        id:'',
        username:'',
        pwd:'',
        email:'',
        adminStatus:''
      };
      this.isChange = false;
      request.get("/admin/getAdminById/"+id).then(res=>{
        if (res.code === '200'){
          this.editFormVisible = true;
          this.editForm.id = res.data.id;
          this.editForm.username = res.data.username;
          this.editForm.email = res.data.email;
          this.editForm.adminStatus = res.data.adminStatus;
        }
      })
    },
    //关闭编辑
    handleEditClose(done){
      this.$refs['ruleForm'].clearValidate();
      done();
    },
    //取消编辑
    cancelEdit(){
      this.editFormVisible = false
      this.$refs['ruleForm'].clearValidate();
    },
    // 修改密码开关打开又关闭后，清除输入框密码和校验
    isClose(){
      if (this.isChange == false){
        this.editForm.pwd = ''
        this.$refs['ruleForm'].clearValidate("pwd");
      }
    },
    //编辑
    edit(){
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          request.post('/admin/update',{
            admin:this.editForm,
            isChange:this.isChange
          }).then(res=>{
            if (res.code === '200'){
              this.editFormVisible = false;
              this.load();
              // 当前修改的用户id等于当前登录的管理员id并且需要修改密码，那么修改成功之后需要重新登录
              if(this.editForm.id === JSON.parse(Cookies.get('admin')).id && this.isChange){
                Cookies.remove('admin')
                this.$notify.success({
                  duration: 2500,
                  message:"更新密码成功,请重新登录!",
                  offset:50
                })
                this.$router.push('/login')
              }else{
                this.$notify.success({
                  duration: 2500,
                  message:"更新成功",
                  offset:50
                })
              }
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
    // 删除确认
    del(data){
      this.$confirm('是否删除用户【'+data.username+'】?', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request.get("/admin/delete/"+data.id).then(res=>{
          if (res.code === '200'){
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            if(this.params.pageNum !== 1 && this.adminList.length==1){
              this.params.pageNum = this.params.pageNum-1;
            };
            this.load();
          }else{
            this.$message({
              type: 'error',
              message: res.msg
            });
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消删除'
        });
      });
    }
  }
}
</script>

<style scoped>

</style>
