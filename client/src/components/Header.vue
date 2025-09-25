<script setup lang="ts">
import {router} from '../router'
import {parseRole} from "../utils"
import {User, SwitchButton} from "@element-plus/icons-vue"
import {ElMessageBox} from "element-plus";   //图标
const role = sessionStorage.getItem('role')    //登录的时候插入的
//退出登录
function logout() {
  ElMessageBox.confirm(
      '是否要出退登录？',
      '提示',
      {
        customClass: "customDialog",
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: "warning",
        showClose: false,
        roundButton: true,
        center: true
      }
  ).then(() => {
    sessionStorage.setItem('token', '')
    router.push({path: "/login"})
  })
}

const navigateToDashboard = () => {
  const username = sessionStorage.getItem('username')
  router.push({path: "/dashboard/" + username})
}
</script>


<template>
  <el-header class="custom-header" height="20">
    <el-row :gutter="10">

      <el-col :span="3" class="header-icon">
        <router-link to="/allproduct"  v-slot="{navigate}" class="no-link">
          <h1 @click="navigate" class="header-text"> 读了么?</h1>
        </router-link>
      </el-col>

      <el-col :span="2">
        <el-tag class="role-tag" size="large">{{ parseRole(role) }}版</el-tag>
      </el-col>

      <el-col :span="16">
      </el-col>

      <el-col :span="1" class="header-icon">
          <el-icon @click="navigateToDashboard" :size="35" color="white"><User /></el-icon>
      </el-col>

      <el-col :span="1" class="header-icon">
        <a @click="logout">
          <el-icon :size="35" color="white" ><SwitchButton /></el-icon>
        </a>
      </el-col>
    </el-row>
  </el-header>
</template>
<style scoped>
.custom-header {
  background: url("../assets/sakura.jpg") no-repeat center center fixed; /* 樱花背景 */
  background-size: cover;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  padding: 10px 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px); /* 可选：添加模糊效果以突出前景内容 */
}

.no-link {
  text-decoration: none;
}

.role-tag {
  margin-top: 15px;
  font-size: 18px;
  background-color: rgba(255, 255, 255, 0.2);
  color: #f9f6f2;
  border: none;
}

.header-text-container {
  display: flex;
  align-items: center;
}

.header-text {
  color: #f9f6f2;
  font-size: xx-large;
  font-family: 'Georgia', serif;
  font-weight: bold;
  min-width: max-content;
  margin: 0;
  transition: color 0.3s ease;
}

.header-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.header-icon .el-icon {
  cursor: pointer;
  transition: transform 0.3s ease, color 0.3s ease;
}

.header-icon .el-icon:hover {
  transform: scale(1.1);
  color: #f3c677; /* 古铜色高亮 */
}

.logo-img {
  width: 100%;
  height: auto;
  max-width: 100px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.logo-img:hover {
  transform: scale(1.1);
}
</style>