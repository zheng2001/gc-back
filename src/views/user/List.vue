<template>
  <div style="padding: 20px">
    <!--搜索表单-->
    <div style="margin-bottom: 20px">
      <el-input style="width: 200px;" placeholder="请输入用户名或昵称" v-model="params.name"></el-input>
      <el-select v-model="params.userStatus" placeholder="请选择状态" style="margin-left: 10px">
        <el-option v-for="item in userData" :key="item.id" :label="item.value" :value="item.valueId"></el-option>
      </el-select>
      <el-button style="margin-left:10px;" type="primary" @click="load">
        <i class="el-icon-search" style="padding-right: 5px"></i>搜索
      </el-button>
      <el-button style="margin-left:5px;" type="warning" @click="reset">
        <i class="el-icon-refresh" style="padding-right: 5px"></i>重置
      </el-button>
    </div>
    <!--列表显示-->
    <el-table :data="userList" stripe>
      <el-table-column prop="id" label="编号"></el-table-column>
      <el-table-column prop="nickname" label="昵称"></el-table-column>
      <el-table-column prop="username" label="用户名"></el-table-column>
      <el-table-column prop="headImg" label="头像">
        <template v-slot="scope">
          <el-image
              style="width: 50px;height: 50px"
              :src="imgPath + scope.row.headImg"
              :preview-src-list="[imgPath + scope.row.headImg]">
            <div slot="error" class="image-slot"
                  style="display: flex;justify-content: center;align-items: center;
                  width: 100%;height: 100%;background: #f5f7fa;color: #909399;">
              <i class="el-icon-picture-outline"></i>
            </div>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column prop="userStatus" label="状态">
        <template v-slot="scope">
          <!--scope.row 当前行数据-->
          {{scope.row.userStatus == '0' ?'禁用':'正常'}}
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间"></el-table-column>
      <el-table-column prop="loginTime" label="最近登录时间"></el-table-column>
      <el-table-column label="操作">
        <template v-slot="scope">
          <el-button type="primary" @click="showEdit(scope.row.id)">编辑</el-button>
          <el-button type="danger" @click="del(scope.row)">删除</el-button>
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
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="editForm.nickname"></el-input>
        </el-form-item>
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
        <el-form-item label="年龄" prop="age">
          <el-input-number v-model="editForm.age" controls-position="right" :min="1" :max="120"></el-input-number>
        </el-form-item>
        <el-form-item label="性别">
            <el-radio-group v-model="editForm.sex">
              <el-radio label="男"></el-radio>
              <el-radio label="女"></el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="头像">
          <!--头像裁剪组件-->
          <CropperImg ref="CropperImgRef" @data="setHeadImg"/>
          <el-upload
              class="avatar-uploader"
              action=""
              list-type="picture"
              :show-file-list="false"
              :auto-upload="false"
              :on-change="changeUpload">
            <img v-if="editForm.headImg" :src="imgPath + editForm.headImg" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="用户状态">
          <el-select v-model="editForm.userStatus">
            <el-option v-for="item in userData" :key="item.id" :label="item.value" :value="item.valueId"></el-option>
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
import CropperImg from "@/views/user/CropperImg";

export default {
  name: "List",
  components:{CropperImg},
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
    return{
      status:'user_status',
      userData:[],
      userList:[],
      total:0,
      params:{
        pageNum: 1,
        pageSize: 5,
        name: '',
        userStatus:''
      },
      editFormVisible: false,
      imgPath : "http://localhost:9090/gc/back/user/download/",
      editForm:{
        id:'',
        nickname:'',
        username:'',
        pwd:'',
        age:'',
        sex:'',
        headImg:'',
        userStatus:''
      },
      isChange:false,
      rules: {
        nickname:[
          { required: true,message:'昵称不能为空',trigger:'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        pwd:[
          { validator: checkPwd, trigger: "blur" }
        ],
        age:[
          { required: true, message: "年龄不能为空", trigger: "blur" }
        ]
      }
    }
  },
  created() {
    this.getStatusData();
    this.load();
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
          this.userData = res.data
        }
      })
    },
    // 列表加载
    load(){
      request.get('/user/list', {
        params:this.params
      }).then(res =>{
          if (res.code === '200'){
            this.userList = res.data.list;
            this.total = res.data.total;
          }
      })
    },
    // 重置
    reset(){
      this.params = {
        pageNum: 1,
        pageSize: 5,
        name: '',
        userStatus:''
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
        nickname:'',
        username:'',
        pwd:'',
        age:'',
        sex:'',
        headImg: '',
        userStatus:''
      };
      this.isChange = false;
      request.get("/user/getUserById/"+id).then(res=>{
        if (res.code === '200'){
          this.editFormVisible = true;
          this.editForm.id = res.data.id;
          this.editForm.nickname = res.data.nickname;
          this.editForm.username = res.data.username;
          this.editForm.age = res.data.age;
          this.editForm.sex = res.data.sex;
          this.editForm.headImg = res.data.headImg;
          this.editForm.userStatus = res.data.userStatus;
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
    //上传头像
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
    //上传后回显
    setHeadImg(data){
      this.editForm.headImg = data;
    },
    //编辑
    edit(){
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          request.post('/user/update',{
            user:this.editForm,
            isChange:this.isChange
          }).then(res=>{
            if (res.code === '200'){
              this.editFormVisible = false;
              this.load();
              this.$notify.success({
                duration: 2500,
                message:"更新成功",
                offset:50
              })
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
        request.get("/user/delete/"+data.id).then(res=>{
          if (res.code === '200'){
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            if(this.params.pageNum !== 1 && this.userList.length==1){
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
