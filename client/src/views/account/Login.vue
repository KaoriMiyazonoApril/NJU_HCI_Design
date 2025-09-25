<script setup lang="ts">
import {ElForm, ElFormItem, ElMessage} from "element-plus"
import {ref, computed} from 'vue'
import {router} from '../../router'
import {userInfo, userLogin} from "../../api/accounts.ts"

// 输入框值（需要在前端拦截不合法输入：是否为空+额外规则）
const username = ref('')
const password = ref('')
const hasUsernameInput = computed(() => username.value != '')
// 简单的用户名合法性检查：非空即可
const usernameLegal = computed(() => username.value.trim().length > 0);
// 密码是否为空
const hasPasswordInput = computed(() => password.value != '')
// 登录按钮可用性
const loginDisabled = computed(() => {
  return !(hasUsernameInput.value && hasPasswordInput.value)
})

// 登录按钮触发
function handleLogin() {
  userLogin({
    username: username.value,
    password: password.value
  }).then(res => {
    if (res.data.code === '200') {
      ElMessage({
        message: "登录成功！",
        type: 'success',
        center: true,
      })
      const token = res.data.data
      sessionStorage.setItem('token', token)
      sessionStorage.setItem('username', username.value)


      // 获取用户信息
      userInfo(username.value).then(res => {
        sessionStorage.setItem('name', res.data.data.name);
        sessionStorage.setItem('role', res.data.data.role);
        sessionStorage.setItem('id', res.data.data.id);
        // router.push({path: "/dashboard/" + username.value})
        router.push({ path: '/allproduct' })
      })
    } else if (res.data.code === '400') {
      ElMessage({
        message: res.data.msg,
        type: 'error',
        center: true,
      })
      password.value = ''
    }
  })
}
</script>


<template>
  <el-main class="main-frame bgImage">
    <el-card class="login-card">
      <div>
        <h1>登入您的账户</h1>
        <el-form>
          <el-form-item>
            <label v-if="!hasUsernameInput" for="username">用户名</label>
            <label v-else-if="!usernameLegal" for="username" class="error-warn">用户名不能为空</label>
            <label v-else for="username">用户名</label>
            <el-input id="username" type="text" v-model="username"
                      required :class="{'error-warn-input': !hasUsernameInput || (hasUsernameInput && !usernameLegal)}"
                      placeholder="请输入用户名"/>
          </el-form-item>

          <el-form-item>
            <label for="password">账户密码</label>
            <el-input id="password" type="password" v-model="password"
                      required
                      placeholder="••••••••"/>
          </el-form-item>

          <span class="button-group">
              <el-button @click.prevent="handleLogin" :disabled="loginDisabled"
                         type="primary">登入</el-button>
              <router-link to="/register" v-slot="{navigate}">
                <el-button @click="navigate">去注册</el-button>
              </router-link>
          </span>
        </el-form>
      </div>
    </el-card>
  </el-main>
</template>


<!--<style scoped>-->
<!--.main-frame {-->
<!--  width: 100%;-->
<!--  height: 100%;-->

<!--  display: flex;-->
<!--  align-items: center;-->
<!--  justify-content: center;-->
<!--}-->

<!--.bgImage {-->
<!--  background-image: url("../../assets/login_background.jpg");-->
<!--}-->

<!--.login-card {-->
<!--  width: 60%;-->
<!--  padding: 10px;-->
<!--}-->

<!--.error-warn {-->
<!--  color: red;-->
<!--}-->

<!--.error-warn-input {-->
<!--  &#45;&#45;el-input-focus-border-color: red;-->
<!--}-->

<!--.button-group {-->
<!--  padding-top: 10px;-->
<!--  display: flex;-->
<!--  flex-direction: row;-->
<!--  gap: 30px;-->
<!--  align-items: center;-->
<!--  justify-content: right;-->
<!--}-->
<!--</style>-->
<style scoped>
.main-frame {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bgImage {
  background-image: linear-gradient(rgba(255, 55, 255, 0.1), rgba(255, 255, 255, 0.8)),
  url("../../assets/sakura2.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.login-card {
  width: 400px;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  background-color: rgba(255, 255, 255, 0.95);
}

.login-content h1 {
  font-family: 'Georgia', serif;
  color: #2c3e50;
  margin-bottom: 10px;
}

.button-group {
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  gap: 16px;
  justify-content: space-between;
}

/* 错误提示 */
.error-warn {
  color: red;
  font-size: 13px;
  margin-top: -10px;
  margin-bottom: 5px;
  display: block;
}

.error-warn-input :deep(.el-input__inner) {
  border-color: red;
  box-shadow: 0 0 5px rgba(255, 0, 0, 0.2);
}
</style>