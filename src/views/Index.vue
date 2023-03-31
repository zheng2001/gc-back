<template>
  <div>
    <!-- 头部区域 -->
    <div class="header">
      <div class="header_left">
        <img src="@/assets/img/logo.png">
        <span>游戏交流平台后台</span>
      </div>
      <div class="header_right">
        <el-dropdown size="medium">
          <span class="el-dropdown-link">
            {{admin.username}}<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown" style="margin-top: -10px;">
            <el-dropdown-item>
              <div style="width: 50px;text-align: center;" @click="logout">退出</div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <!-- 侧边栏和主体 -->
    <div class="aside_main">
      <!-- 侧边栏导航 -->
      <div class="aside">
        <el-menu :default-active="$route.path" router class="el-menu-demo">
          <el-menu-item index="/">
            <i class="el-icon-s-home"></i>
            <span>首页</span>
          </el-menu-item>
          <el-submenu index="admin">
            <template slot="title">
              <i class="el-icon-user-solid"></i>
              <span>管理员管理</span>
            </template>
            <el-menu-item index="/adminList">管理员列表</el-menu-item>
            <el-menu-item index="/addAdmin">管理员添加</el-menu-item>
          </el-submenu>
          <el-submenu index="user">
            <template slot="title">
              <i class="el-icon-user"></i>
              <span>用户管理</span>
            </template>
            <el-menu-item index="/userList">用户列表</el-menu-item>
            <el-menu-item index="/addUser">用户添加</el-menu-item>
          </el-submenu>
          <el-submenu index="tag">
            <template slot="title">
              <i class="el-icon-collection-tag"></i>
              <span>标签管理</span>
            </template>
            <el-menu-item index="/tagList">标签列表</el-menu-item>
          </el-submenu>
          <el-submenu index="banner">
            <template slot="title">
              <i class="el-icon-picture"></i>
              <span>轮播图管理</span>
            </template>
            <el-menu-item index="/bannerList">轮播图列表</el-menu-item>
          </el-submenu>
          <el-submenu index="essay">
            <template slot="title">
              <i class="el-icon-document"></i>
              <span>文章管理</span>
            </template>
            <el-menu-item index="/essayList">文章列表</el-menu-item>
          </el-submenu>
        </el-menu>
      </div>
      <!-- 主体数据 -->
      <!-- width: 0; 可以限制容器的宽度，不被子元素无限撑开-->
      <div class="main">
        <router-view />
      </div>
    </div>
  </div>
</template>
<script>
import Cookies from 'js-cookie'

export default {
  name: 'Index',
  data(){
    return{
      admin:Cookies.get('admin')?JSON.parse(Cookies.get('admin')):{}
    }
  },
  methods:{
    logout(){
      //清除浏览器用户的数据
      Cookies.remove('admin')
      this.$router.push("/login")
      this.$notify.success({
        duration: 2500,
        message: "退出成功",
        offset: 50
      })
    }
  }
}
</script>
<style scoped>
@import '../assets/css/index.css';
</style>
