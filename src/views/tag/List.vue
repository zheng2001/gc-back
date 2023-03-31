<template>
  <div style="padding: 20px">
    <!--搜索表单-->
    <div style="margin-bottom: 10px">
      <el-button type="primary" @click="showAdd">
        <i class="el-icon-circle-plus-outline" style="padding-right: 5px"></i>添加标签
      </el-button>
      <el-button type="danger" @click="batchDel" :disabled="this.selectList.length === 0">批量删除</el-button>
      <el-input style="width: 200px;margin-left:50px;" placeholder="请输入标签名" v-model="params.tagName" @keyup.enter.native="search"></el-input>
      <el-button style="margin-left:10px;" type="primary" @click="search">
        <i class="el-icon-search" style="padding-right: 5px"></i>搜索
      </el-button>
      <el-button style="margin-left:5px;" type="warning" @click="reset">
        <i class="el-icon-refresh" style="padding-right: 5px"></i>重置
      </el-button>
    </div>
    <!--列表显示-->
    <el-table ref="tagTable" :data="tagList" stripe @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column prop="id" label="编号"></el-table-column>
      <el-table-column prop="tagName" label="标签名"></el-table-column>
      <el-table-column prop="order" label="排序操作">
        <template v-slot="scope">
          <div v-show="searchIsNull">
            <el-button type="plain" icon="el-icon-arrow-down" circle v-if="(scope.row.order)!== 1" @click="down(scope.row.id)"></el-button>
            <el-button type="primary" icon="el-icon-arrow-up" circle v-if="(scope.row.order)!== total" @click="up(scope.row.id)"></el-button>
          </div>
        </template>
      </el-table-column>
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
    <!--添加窗体-->
    <el-dialog title="添加标签" :visible.sync="addFormVisible" :before-close="handleAddClose" width="400px">
      <el-form :model="addForm" label-width="80px" ref="ruleAddForm" :rules="addRules">
        <el-form-item label="标签名" prop="tagName">
          <el-input v-model="addForm.tagName"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAdd">取 消</el-button>
        <el-button type="primary" @click="add">添 加</el-button>
      </div>
    </el-dialog>
    <!--编辑窗体-->
    <el-dialog title="编辑标签" :visible.sync="editFormVisible" :before-close="handleEditClose" width="400px">
      <el-form :model="editForm" label-width="80px" ref="ruleEditForm" :rules="editRules">
        <el-form-item label="标签名" prop="tagName">
          <el-input v-model="editForm.tagName"></el-input>
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

export default {
  name: "List",
  data(){
    const checkTagName = (rule, value, callback) => {
      request.get('/tag/checkTagName/'+value, ).then(res =>{
        if (res.code === '200'){
          callback(new Error(res.data));
        }else {
          callback();
        }
      })
    };
    const checkTagNameWithOutId = (rule, value, callback) => {
      request.get('/tag/checkTagNameWithOutId/'+value+'/'+this.editForm.id ).then(res =>{
        if (res.code === '200'){
          callback(new Error(res.data));
        }else {
          callback();
        }
      })
    };
    return{
      tagList:[],
      total:0,
      params:{
        pageNum: 1,
        pageSize: 10,
        tagName:''
      },
      searchIsNull:true,// 控制是否显示上移下移操作
      addFormVisible:false,
      addForm:{
        id:'',
        tagName:''
      },
      addRules: {
        tagName:[
          { required: true,message:'标签名不能为空',trigger:'blur' },
          { min: 1, max: 30, message: '长度在 1 到 30 个字符', trigger: 'blur' },
          { required: true, validator: checkTagName, trigger: "blur" }
        ],
      },
      selectList:[], // 批量选中的列表
      editFormVisible: false,
      editForm:{
        id:'',
        tagName:''
      },
      editRules: {
        tagName:[
          { required: true,message:'标签名不能为空',trigger:'blur' },
          { min: 1, max: 30, message: '长度在 1 到 30 个字符', trigger: 'blur' },
          { required: true, validator: checkTagNameWithOutId, trigger: "blur" }
        ],
      },
    }
  },
  created() {
    this.load();
  },
  methods:{
    // 列表加载
    load(){
      request.get('/tag/list', {
        params:this.params
      }).then(res =>{
          if (res.code === '200'){
            this.tagList = res.data.list;
            this.total = res.data.total;
          }
      })
    },
    // 搜索
    search(){
      this.load();
      // 通过搜索标签，如果输入为空显示上移下移操作，不为空不进行上移下移操作
      if (this.params.tagName == ''){
        this.searchIsNull = true;
      }else{
        this.searchIsNull = false;
      }
    },
    // 重置
    reset(){
      this.params = {
        pageNum: 1,
        pageSize: 10,
        tagName: ''
      }
      this.load();
      // 恢复上移下移操作
      if (this.searchIsNull === false){
        this.searchIsNull = true;
      }
    },
    // 点击分页按钮触发分页
    handleCurrentChange(pageNum){
      this.params.pageNum = pageNum
      this.load()
    },
    // 显示添加
    showAdd(){
      this.addForm = {
        id:'',
        tagName:''
      };
      this.addFormVisible = true;
    },
    // 关闭添加
    handleAddClose(done){
      this.$refs['ruleAddForm'].clearValidate();
      done();
    },
    // 取消添加
    cancelAdd(){
      this.addFormVisible = false
      this.$refs['ruleAddForm'].clearValidate();
    },
    // 添加
    add(){
      this.$refs['ruleAddForm'].validate((valid) => {
        if (valid) {
          request.post('/tag/add', this.addForm).then(res => {
            if (res.code === '200') {
              this.addFormVisible = false;
              this.load();
              this.$notify.success({
                duration: 2500,
                message: "新增成功",
                offset:50
              })
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
    // 获取选中的值
    handleSelectionChange(val){
      this.selectList = val;
    },
    // 批量删除
    batchDel() {
      // 删除前的提示
      this.$confirm("是否批量删除标签吗?", "批量删除", {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: "warning",
      }).then(() => {
        let ids = this.selectList.map((item) => item.id).join(","); // 选中列表拼接结果: 1,2,3
        // 请求接口
        request.get("/tag/batchDel/"+ids).then(res=>{
          if (res.code === '200'){
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            if(this.params.pageNum !== 1 && this.tagList.length==1){
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
        this.$refs.tagTable.clearSelection()
        this.$message({
          type: 'info',
          message: '取消删除'
        });
      });
    },
    // 上移标签
    up(id){
      request.get("/tag/toUpTag/"+id).then(res=>{
        if (res.code === '200') {
          this.load();
          this.$notify.success({
            duration: 2500,
            message: "上移成功",
            offset:50
          })
        } else {
          this.$notify.error({
            message: res.msg,
            offset: 50
          })
        }
      })
    },
    // 下移标签
    down(id){
      request.get("/tag/toDownTag/"+id).then(res=>{
        if (res.code === '200') {
          this.load();
          this.$notify.success({
            duration: 2500,
            message: "下移成功",
            offset:50
          })
        } else {
          this.$notify.error({
            message: res.msg,
            offset: 50
          })
        }
      })
    },
    // 显示编辑
    showEdit(id){
      this.editForm = {
        id:'',
        tagName:''
      };
      request.get("/tag/getTagById/"+id).then(res=>{
        if (res.code === '200'){
          this.editFormVisible = true;
          this.editForm = res.data;
        }
      })
    },
    // 关闭编辑
    handleEditClose(done){
      this.$refs['ruleEditForm'].clearValidate();
      done();
    },
    // 取消编辑
    cancelEdit(){
      this.editFormVisible = false
      this.$refs['ruleEditForm'].clearValidate();
    },
    // 编辑
    edit(){
      this.$refs['ruleEditForm'].validate((valid) => {
        if (valid) {
          request.post('/tag/update',this.editForm).then(res=>{
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
      this.$confirm('是否删除标签【'+data.tagName+'】?', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request.get("/tag/delete/"+data.id).then(res=>{
          if (res.code === '200'){
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            if(this.params.pageNum !== 1 && this.tagList.length==1){
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
