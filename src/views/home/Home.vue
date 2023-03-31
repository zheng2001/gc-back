<template>
  <div class="homeContainer">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="always" :body-style="{ padding: '0px' }" class="item">
          <h2>总投稿量</h2>
          <span>{{info.allEssays}}</span>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="always" :body-style="{ padding: '0px' }" class="item">
          <h2>已通过稿件</h2>
          <span>{{info.passedEssays}}</span>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="always" :body-style="{ padding: '0px' }" class="item">
          <h2>用户总量</h2>
          <span>{{info.allUsers}}</span>
        </el-card>
      </el-col>
    </el-row>
    <el-row style="margin-top:20px">
      <el-card>
        <el-row id="line" style="width: 100%; height: 400px"></el-row>
      </el-card>
    </el-row>
  </div>
</template>
<script>
import request from "@/uitls/request";
import * as echarts from 'echarts'

const option = {
  title: {
    text: '最近一周的投稿统计'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['投稿数量', '通过数量']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  toolbox: {
    feature: {
      saveAsImage: {}
    }
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: []  // 从后台动态获取
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '投稿数量',
      type: 'line',
      stack: 'Total',
      smooth: true,
      data: []     // 从后台动态获取
    },
    {
      name: '通过数量',
      type: 'line',
      stack: 'Total',
      smooth: true,
      data: []     // 从后台动态获取
    }
  ]
}

export default {
  name: 'Home',
  components:{},
  data(){
    return{
      info:[],
      lineBox: null,
    }
  },
  created() {
    this.load()
  },
  mounted() {
    this.loadLine()
  },
  methods:{
    load(){
      request.get('/home/getInfo').then(res =>{
        if (res.code === '200'){
          this.info = res.data
        }
      })
    },
    loadLine(){
      if (!this.lineBox) {
        this.lineBox = echarts.init(document.getElementById('line'))  // 初始化echarts容器
      }
      // 从后台获取数据
      request.get('/home/lineCharts/').then(res => {
        option.xAxis.data = res.data.date;
        option.series[0].data = res.data.contribute;
        option.series[1].data = res.data.pass;
        this.lineBox.setOption(option)  // 设置容器的属性值，当你的数据发生变化的时候，一定要重新setOption
      })
    }
  }
}
</script>
<style scoped>
.homeContainer{
  padding: 20px;
}
.item{
  padding: 20px;
  height: 150px;
  text-align:center;
  display: flex;
  align-items: center;
  justify-content: center;
}
.item span{
  font-size: 20px;
  color: #409eff;
}
</style>
