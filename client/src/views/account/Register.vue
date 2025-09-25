<script setup lang="ts">
import { ref, computed } from 'vue'
import { router } from '../../router'
import { userRegister } from "../../api/accounts.ts"
import {ElForm, ElFormItem, ElMessage} from "element-plus"
import { UploadFilled } from "@element-plus/icons-vue"
import { uploadImage } from "../../api/tools.ts"
// 输入框值（需要在前端拦截不合法输入：是否为空+额外规则）
const name = ref('')
const username = ref('')
const identity = ref('')
const tel = ref('')
const email = ref('')
const location = ref('')
const password = ref('')
const confirmPassword = ref('')
const imageFileList = ref([])
const avatarUrl = ref('')

// 电话号码是否为空
const hasTelInput = computed(() => tel.value != '')
// 密码是否为空
const hasPasswordInput = computed(() => password.value != '')
// 重复密码是否为空
const hasConfirmPasswordInput = computed(() => confirmPassword.value != '')
// 地址是否为空
const hasAddressInput = computed(() => location.value != '')
// 身份是否为空
const hasIdentityChosen = computed(() => identity.value != '')
// 电话号码的规则
const chinaMobileRegex = /^1(3[0-9]|4[579]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[189])\d{8}$/
const telLegal = computed(() => chinaMobileRegex.test(tel.value))
// 重复密码的规则
const isPasswordIdentical = computed(() => password.value == confirmPassword.value)
// 注册按钮可用性
const registerDisabled = computed(() => {
  if (!hasIdentityChosen.value) {
    return true
  } else if (identity.value == 'CUSTOMER') {
    return !(hasTelInput.value && hasPasswordInput.value && hasConfirmPasswordInput && hasAddressInput.value &&
        telLegal.value && isPasswordIdentical.value)
  } else if (identity.value == 'STAFF') {
    return !(hasTelInput.value && hasPasswordInput.value && hasConfirmPasswordInput && hasAddressInput.value &&
        telLegal.value && isPasswordIdentical.value)
  }
})

// 注册按钮触发
function handleRegister() {
  userRegister({
    role: identity.value,
    name: name.value,
    username: username.value,
    avatar: avatarUrl.value,
    phone: tel.value,
    email: email.value,
    password: password.value,
    location: location.value,
  }).then(res => {
    if (res.data.code === '200') {  //类型守卫，它检查 res.data 对象中是否存在名为 code 的属性
      ElMessage({
        message: "注册成功！请登录账号",
        type: 'success',
        center: true,
      })
      router.push({ path: "/login" })
    } else if (res.data.code === '400') {
      ElMessage({
        message: res.data.msg,
        type: 'error',
        center: true,
      })
    }
  })
}

function handleChange(file: any, fileList: any) {
  imageFileList.value = fileList
  let formData = new FormData()
  formData.append('file', file.raw)
  uploadImage(formData).then(res => {
    avatarUrl.value = res.data.data
  })
}

function handleExceed() {
  ElMessage.warning(`当前限制选择 1 个文件`);
}

function uploadHttpRequest() {
  return new XMLHttpRequest()
}

// 错误提示相关
const telError = ref('')
function validateTel() {
  if (tel.value === '') {
    telError.value = ''
  } else if (!chinaMobileRegex.test(tel.value)) {
    telError.value = '请输入正确的中国大陆手机号'
  } else {
    telError.value = ''
  }
}

const passwordError = ref('')

function validatePassword() {
  if (confirmPassword.value === '') {
    passwordError.value = ''
  } else if (password.value !== confirmPassword.value) {
    passwordError.value = '两次输入的密码不一致'
  } else {
    passwordError.value = ''
  }
}

</script>


<template>
  <el-main class="main-frame bgImage">
    <el-card class="login-card">
      <div class="form-container">
        <h1>创建一个新的账户</h1>

        <el-form :model="{}" @submit.prevent="handleRegister">
          <!-- 用户名 -->
          <el-form-item label="用户名">
            <el-input id="username" v-model="username" placeholder="请输入登录用的用户名"></el-input>
          </el-form-item>

          <!-- 姓名 -->
          <el-form-item label="姓名">
            <el-input id="name" v-model="name" placeholder="请输入您的姓名"></el-input>
          </el-form-item>

          <!-- 身份选择 -->
          <el-form-item label="身份">
            <el-select id="identity" v-model="identity" placeholder="请选择" style="width: 100%;">
              <el-option value="CUSTOMER" label="顾客"></el-option>
              <el-option value="MANAGER" label="管理员"></el-option>
            </el-select>
          </el-form-item>

          <!-- 手机号 -->
          <el-form-item label="手机号" :error="telError">
            <el-input id="tel" v-model="tel" placeholder="请输入手机号" @input="validateTel"></el-input>
          </el-form-item>

          <!-- 邮箱 -->
          <el-form-item label="邮箱">
            <el-input id="email" v-model="email" placeholder="请输入您的邮箱地址"></el-input>
          </el-form-item>

          <!-- 地址 -->
          <el-form-item label="地址">
            <el-input id="address" v-model="location" placeholder="请输入地址"></el-input>
          </el-form-item>

          <!-- 密码 -->
          <el-form-item label="密码">
            <el-input type="password" id="password" v-model="password" placeholder="••••••••"></el-input>
          </el-form-item>

          <!-- 确认密码 -->
          <el-form-item label="确认密码" :error="passwordError">
            <el-input type="password" id="confirm-password" v-model="confirmPassword" placeholder="••••••••" @input="validatePassword"></el-input>
          </el-form-item>

          <!-- 头像上传 -->
          <el-form-item label="头像">
            <el-upload
                v-model:file-list="imageFileList"
                :limit="1"
                :on-change="handleChange"
                :on-exceed="handleExceed"
                :on-remove="handleChange"
                class="upload-demo"
                list-type="picture"
                :http-request="uploadHttpRequest"
                drag
                accept="image/*"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">将图片拖到此处或单击此处上传。仅允许上传一份图片。</div>
            </el-upload>
          </el-form-item>

          <!-- 注册按钮 -->
          <el-form-item>
            <el-button native-type="submit" :disabled="registerDisabled" type="primary" block>创建账户</el-button>
            <router-link to="/login" custom v-slot="{ navigate }">
              <el-button @click="navigate">去登录</el-button>
            </router-link>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </el-main>
</template>

<style scoped>
.main-frame {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.5)), url("../../assets/sakura.jpg");
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

.form-container h1 {
  font-family: 'Georgia', serif;
  color: #2c3e50;
  margin-bottom: 20px;
}

.button-group {
  margin-top: 20px;
  display: flex;
  flex-direction: row;
  gap: 16px;
  justify-content: space-between;
}

.el-form-item__error {
  color: red;
  font-size: 12px;
}
</style>


