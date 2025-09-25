<script setup lang="ts">
import {router} from "../router";

const navigateToDashboard = () => {
  router.push({ path: '/allproduct' })
}
</script>


<template>
  <el-main class="main-frame">
    <el-result
        icon="error"
        title="错误"
        sub-title="您访问的页面不存在"
    >
      <template #extra>
        <el-button type="primary" @click="navigateToDashboard">
          回到主页
        </el-button>
      </template>
    </el-result>
  </el-main>
</template>


<style scoped>
.main-frame {
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
