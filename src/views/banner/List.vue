<template>
  <div style="padding: 20px">
    <!--搜索表单-->
    <div style="margin-bottom: 10px">
      <el-button type="primary" @click="showAdd">
        <i class="el-icon-circle-plus-outline" style="padding-right: 5px"></i>添加轮播图
      </el-button>
      <el-button type="danger" @click="batchDel" :disabled="this.selectList.length === 0">批量删除</el-button>
    </div>
    <!--列表显示-->
    <el-table ref="bannerTable" :data="bannerList" stripe @selection-change="handleSelectionChange">
      <el-table-column type="selection"></el-table-column>
      <el-table-column prop="id" label="编号"></el-table-column>
      <el-table-column prop="bannerImg" label="轮播图">
        <template v-slot="scope">
          <el-image
              style="width: 160px;height: 90px"
              :src="imgPath + scope.row.bannerImg"
              :preview-src-list="[imgPath + scope.row.bannerImg]">
            <div slot="error" class="image-slot"
                 style="display: flex;justify-content: center;align-items: center;
                  width: 100%;height: 100%;background: #f5f7fa;color: #909399;">
              <i class="el-icon-picture-outline"></i>
            </div>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column prop="order" label="排序操作">
        <template v-slot="scope">
          <el-button type="plain" icon="el-icon-arrow-down" circle v-if="(scope.row.order)!== 1" @click="down(scope.row.id)"></el-button>
          <el-button type="primary" icon="el-icon-arrow-up" circle v-if="(scope.row.order)!== total" @click="up(scope.row.id)"></el-button>
        </template>
      </el-table-column>
      <el-table-column prop="bannerStatus" label="状态">
        <template v-slot="scope">
          {{scope.row.bannerStatus == '0' ?'隐藏':'显示'}}
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
    <el-dialog title="添加轮播图" :visible.sync="addFormVisible" :before-close="handleAddClose" width="500px">
      <el-form :model="addForm" label-width="100px" ref="ruleAddForm" :rules="addRules">
        <el-form-item label="轮播图" prop="bannerImg">
          <el-upload
              class="bannerImg-uploader"
              action=""
              list-type="picture"
              :show-file-list="false"
              :auto-upload="false"
              :on-change="AddFormChangeUpload">
            <img v-if="this.addForm.bannerImg" :src="imgPath+this.addForm.bannerImg" class="bannerImg">
            <i v-else class="el-icon-plus bannerImg-uploader-icon"></i>
          </el-upload>
          <!--头像裁剪组件-->
          <CropperImg ref="AddFormCropperImgRef" @data="setAddFormBannerImg"/>
        </el-form-item>
        <el-form-item label="轮播图状态" prop="bannerStatus">
          <el-select v-model="addForm.bannerStatus" placeholder="请选择状态">
            <el-option v-for="item in bannerData" :key="item.id" :label="item.value" :value="item.valueId"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAdd">取 消</el-button>
        <el-button type="primary" @click="add">添 加</el-button>
      </div>
    </el-dialog>
    <!--编辑窗体-->
    <el-dialog title="编辑轮播图" :visible.sync="editFormVisible" :before-close="handleEditClose" width="500px">
      <el-form :model="editForm" label-width="100px" ref="ruleEditForm">
        <el-form-item label="轮播图">
          <el-upload
              class="bannerImg-uploader"
              action=""
              list-type="picture"
              :show-file-list="false"
              :auto-upload="false"
              :on-change="EditFormChangeUpload">
            <img v-if="this.editForm.bannerImg" :src="imgPath+this.editForm.bannerImg" class="bannerImg">
            <i v-else class="el-icon-plus bannerImg-uploader-icon"></i>
          </el-upload>
          <!--头像裁剪组件-->
          <CropperImg ref="EditFormCropperImgRef" @data="setEditFormBannerImg"/>
        </el-form-item>
        <el-form-item label="轮播图状态">
          <el-select v-model="editForm.bannerStatus">
            <el-option v-for="item in bannerData" :key="item.id" :label="item.value" :value="item.valueId"></el-option>
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
import CropperImg from "@/views/banner/CropperImg";

export default {
  name: "List",
  components:{CropperImg},
  data(){
    return {
      status:'banner_status',
      bannerData: [],
      bannerList: [],
      total: 0,
      params: {
        pageNum: 1,
        pageSize: 10
      },
      imgPath : "http://localhost:9090/gc/back/banner/download/",
      selectList:[], // 批量选中的列表
      addFormVisible:false,
      addForm:{
        bannerImg:''
      },
      addRules:{
        bannerImg:[
          { required:true,message:'请上传轮播图',trigger:'blur' }
        ],
        bannerStatus:[
          { required:true,message:'请选择状态',trigger:'blur' }
        ]
      },
      editFormVisible: false,
      editForm:{
        id:'',
        bannerImg:'',
        order:'',
        bannerStatus:''
      },
      isPreview:false,
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
          this.bannerData = res.data
        }
      })
    },
    // 列表加载
    load(){
      request.get('/banner/list', {
        params:this.params
      }).then(res =>{
          if (res.code === '200'){
            this.bannerList = res.data.list;
            this.total = res.data.total;
          }
      })
    },
    // 点击分页按钮触发分页
    handleCurrentChange(pageNum){
      this.params.pageNum = pageNum
      this.load()
    },
    // 显示添加
    showAdd(){
      this.addForm = {
        bannerImg:''
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
    // 添加窗体上传轮播图
    AddFormChangeUpload(file) {
      let tempImg = file.name.substring(file.name.lastIndexOf('.') + 1)
      const isLt10M = file.size / 1024 / 1024 < 10;
      const isJPG = tempImg === 'jpg'
      const isPNG = tempImg === 'png'

      if (!isLt10M) {
        this.$message.error('上传图片大小不能超过 10MB!');
      }
      if (!isJPG && !isPNG) {
        this.$message.error('上传图片只能是 JPG 或 PNG 格式!');
        return;
      }
      this.$nextTick(() => { // 赋值给裁剪窗体
        this.$refs.AddFormCropperImgRef.option.img = file.url
        this.$refs.AddFormCropperImgRef.option.name = file.name
        this.$refs.AddFormCropperImgRef.cropperVisible = true
      })
    },
    // 添加窗体轮播图回显
    setAddFormBannerImg(data){
      this.addForm.bannerImg = data;
    },
    // 添加
    add(){
      this.$refs['ruleAddForm'].validate((valid) => {
        if (valid) {
          request.post('/banner/add', this.addForm).then(res => {
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
      this.$confirm("是否批量删除轮播图吗?", "批量删除", {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: "warning",
      }).then(() => {
        let ids = this.selectList.map((item) => item.id).join(","); // 选中列表拼接结果: 1,2,3
        // 请求接口
        request.get("/banner/batchDel/"+ids).then(res=>{
          if (res.code === '200'){
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            if(this.params.pageNum !== 1 && this.bannerList.length==1){
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
        this.$refs.bannerTable.clearSelection()
        this.$message({
          type: 'info',
          message: '取消删除'
        });
      });
    },
    // 上移标签
    up(id){
      request.get("/banner/toUpBanner/"+id).then(res=>{
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
      request.get("/banner/toDownBanner/"+id).then(res=>{
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
        bannerImg:'',
        order:'',
        bannerStatus:''
      };
      request.get("/banner/getBannerById/"+id).then(res=>{
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
    // 添加窗体上传轮播图
    EditFormChangeUpload(file) {
      let tempImg = file.name.substring(file.name.lastIndexOf('.') + 1)
      const isLt10M = file.size / 1024 / 1024 < 10;
      const isJPG = tempImg === 'jpg'
      const isPNG = tempImg === 'png'

      if (!isLt10M) {
        this.$message.error('上传图片大小不能超过 10MB!');
      }
      if (!isJPG && !isPNG) {
        this.$message.error('上传图片只能是 JPG 或 PNG 格式!');
        return;
      }
      this.$nextTick(() => { // 赋值给裁剪窗体
        this.$refs.EditFormCropperImgRef.option.img = file.url
        this.$refs.EditFormCropperImgRef.option.name = file.name
        this.$refs.EditFormCropperImgRef.cropperVisible = true
      })
    },
    // 添加窗体轮播图回显
    setEditFormBannerImg(data){
      this.editForm.bannerImg = data;
    },
    // 编辑
    edit(){
        request.post('/banner/update',this.editForm).then(res=>{
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
    },
    // 删除确认
    del(data){
      this.$confirm('是否删除轮播图,编号【'+data.id+'】?', '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        request.get("/banner/delete/"+data.id).then(res=>{
          if (res.code === '200'){
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            if(this.params.pageNum !== 1 && this.bannerList.length==1){
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
.bannerImg-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 320px;
  height: 180px;
}
.bannerImg-uploader:hover {
  border-color: #409eff;
}
.bannerImg-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 320px;
  height: 180px;
  line-height: 180px;
  text-align: center;
}
.bannerImg {
  width: 320px;
  height: 180px;
  display: block;
}
</style>
