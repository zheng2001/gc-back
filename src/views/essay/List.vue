<template>
  <div style="padding: 20px">
    <div style="font-size: 18px;margin-bottom: 20px;">审核文章</div>
    <!--列表显示-->
    <el-table ref="tagTable" :data="essayList" stripe>
      <el-table-column prop="id" label="编号"></el-table-column>
      <el-table-column prop="title" label="标题"></el-table-column>
      <el-table-column prop="tag.tagName" label="标签">
        <template v-slot="scope">
          <el-tag type="warning" size="mini" effect="dark">{{scope.row.tag.tagName}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="内容">
        <template v-slot="scope">
          <el-button type="primary" plain icon="el-icon-zoom-in" @click="preView(scope.row.content)">预览</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="essayStatus" label="文章状态">
        <template v-slot="scope">
          {{scope.row.essayStatus == '0' ?'未审核':''}}
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间"></el-table-column>
      <el-table-column label="操作">
        <template v-slot="scope">
          <el-button type="primary" @click="showEdit(scope.row.id)">编辑</el-button>
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
    <el-dialog title="编辑文章" :visible.sync="editFormVisible" :before-close="handleEditClose">
      <el-form :model="editForm" label-width="100px" ref="ruleEditForm" :rules="editRules">
        <el-form-item label="标题" prop="title">
          <el-input v-model="editForm.title" disabled></el-input>
        </el-form-item>
        <el-form-item label="文章状态" prop="essayStatus">
          <el-select v-model="editForm.essayStatus">
            <el-option v-for="(item,index) in essayData" :key="index" :label="item.value" :value="item.valueId"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="不通过原因" prop="reason" v-if="editForm.essayStatus==2">
          <el-input type="textarea" autosize placeholder="请输入内容" v-model="editForm.reason"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelEdit">取 消</el-button>
        <el-button type="primary" @click="edit">编 辑</el-button>
      </div>
    </el-dialog>
    <!--预览窗体-->
    <el-dialog title="文章内容" width="70%" class="showAll_dialog" :visible.sync="essayContentVisible" :before-close="handleViewClose">
        <div v-html="html"></div>
    </el-dialog>
  </div>
</template>

<script>
import request from "@/uitls/request";

export default {
  name: "List",
  data(){
    return{
      status:'essay_status',
      essayData:[],
      essayList:[],
      total:0,
      params:{
        pageNum: 1,
        pageSize: 10
      },
      essayContentVisible:false,
      html:'',
      editFormVisible: false,
      editForm:{
        id:'',
        tagName:'',
        title:'',
        essayStatus:'',
        reason:''
      },
      editRules: {
        reason:[
          { required:true,message:'不通过原因不能为空！',trigger:'blur' }
        ]
      },
    }
  },
  created() {
    this.getStatusData();
    this.load();
  },
  methods:{
    // 状态获取
    getStatusData() {
      request.get('/data/getDataByKey', {
        params: {
          key: this.status
        }
      }).then(res => {
        if (res.code === '200') {
          this.essayData = res.data
        }
      })
    },
    // 列表加载
    load(){
      request.get('/essay/list', {
        params:this.params
      }).then(res =>{
        if (res.code === '200'){
          this.essayList = res.data.list;
          this.total = res.data.total;
        }
      })
    },
    // 点击分页按钮触发分页
    handleCurrentChange(pageNum){
      this.params.pageNum = pageNum
      this.load()
    },
    //文章内容预览
    preView(data){
      this.essayContentVisible = true;
      this.html = data;
    },
    //关闭预览
    handleViewClose(done){
      this.html = ''
      done();
    },
    //显示编辑
    showEdit(id){
      this.editForm = {
        id:'',
        title:'',
        essayStatus:'',
        reason:''
      };
      request.get("/essay/getEssayById/"+id).then(res=>{
        if (res.code === '200'){
          this.editFormVisible = true;
          this.editForm.id = res.data.id;
          this.editForm.title = res.data.title;
          this.editForm.essayStatus = res.data.essayStatus;
          this.editForm.reason = res.data.reason;
        }
      })
    },
    //关闭编辑
    handleEditClose(done){
      this.$refs['ruleEditForm'].clearValidate();
      done();
    },
    //取消编辑
    cancelEdit(){
      this.editFormVisible = false
      this.$refs['ruleEditForm'].clearValidate();
    },
    //编辑
    edit(){
      this.$refs['ruleEditForm'].validate((valid) => {
        if (valid) {
          request.post('/essay/update', this.editForm).then(res=>{
            if (res.code === '200'){
              this.editFormVisible = false;
              if(this.params.pageNum !== 1 && this.essayList.length==1){
                this.params.pageNum = this.params.pageNum-1;
              };
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
  }
}
</script>

<style scoped>
.showAll_dialog {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
::v-deep .showAll_dialog .el-dialog {
  margin: 0 auto !important;
  height: 80%;
  border-radius: 10px;
  overflow: hidden;
}
::v-deep .showAll_dialog .el-dialog__body {
  position: absolute;
  left: 0;
  top: 54px;
  bottom: 0;
  right: 0;
  padding: 0;
  z-index: 1;
  overflow: hidden;
  overflow-y: auto;
  padding: 0 20px;
}
</style>
