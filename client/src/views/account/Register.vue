<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { router } from '../../router'
import { userRegister } from "../../api/accounts.ts"
import { ElMessage } from "element-plus"
import { uploadImage } from "../../api/tools.ts"
import {
  UploadFilled,
  User,
  Lock,
  Phone,
  Message,
  Location,
  Check,
  Warning
} from "@element-plus/icons-vue"

// ======== 表单字段 ========
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

// ======== 输入框状态 ========
const activeField = ref('')
const isSubmitting = ref(false)

// ======== 校验规则 ========
const chinaMobileRegex = /^1(3[0-9]|4[579]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[189])\d{8}$/

// 错误信息
const telError = ref('')
const passwordError = ref('')
const usernameError = ref('')
const nameError = ref('')
const locationError = ref('')

// 验证函数
const validateTel = () => {
  if (!tel.value) {
    telError.value = ''
  } else if (!chinaMobileRegex.test(tel.value)) {
    telError.value = '请输入正确的中国大陆手机号'
  } else {
    telError.value = ''
  }
}

const validatePassword = () => {
  if (!password.value) {
    passwordError.value = ''
  } else if (password.value.length < 6) {
    passwordError.value = '密码长度至少6位'
  } else if (password.value.length > 20) {
    passwordError.value = '密码长度不能超过20位'
  } else {
    passwordError.value = ''
  }
}

const validatePasswordMatch = () => {
  if (!confirmPassword.value) {
    passwordError.value = ''
  } else if (confirmPassword.value !== password.value) {
    passwordError.value = '两次密码输入不一致'
  } else {
    passwordError.value = ''
  }
}

const validateUsername = () => {
  if (!username.value) {
    usernameError.value = ''
  } else if (username.value.length < 3) {
    usernameError.value = '用户名至少3位'
  } else if (username.value.length > 16) {
    usernameError.value = '用户名不能超过16位'
  } else {
    usernameError.value = ''
  }
}

const validateName = () => {
  if (!name.value) {
    nameError.value = ''
  } else if (name.value.length > 20) {
    nameError.value = '姓名不能超过20位'
  } else {
    nameError.value = ''
  }
}

const validateLocation = () => {
  if (!location.value) {
    locationError.value = ''
  } else if (location.value.length > 50) {
    locationError.value = '地址不能超过50个字符'
  } else {
    locationError.value = ''
  }
}

// 表单验证状态
const isFormValid = computed(() => {
  return (
      name.value &&
      !nameError.value &&
      username.value &&
      !usernameError.value &&
      identity.value &&
      chinaMobileRegex.test(tel.value) &&
      password.value.length >= 6 &&
      password.value.length <= 20 &&
      confirmPassword.value === password.value &&
      location.value &&
      !locationError.value
  )
})

// ======== 注册提交 ========
async function handleRegister() {
  if (!isFormValid.value || isSubmitting.value) return

  isSubmitting.value = true

  const payload = {
    role: identity.value,
    name: name.value,
    username: username.value,
    avatar: avatarUrl.value,
    phone: tel.value,
    email: email.value,
    password: password.value,
    location: location.value,
  }

  try {
    const res = await userRegister(payload)

    if (res.data.code === '200') {
      ElMessage.success({
        message: "🎉 注册成功！正在跳转到登录页面...",
        duration: 2000,
        grouping: true
      })

      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        router.push("/login")
      }, 1500)
    } else {
      ElMessage.error({
        message: res.data.msg || '注册失败，请检查输入信息',
        duration: 3000,
        grouping: true
      })
    }
  } catch (err: any) {
    console.error(err)
    const errorMsg = err.response?.status === 500
        ? '服务器暂时无法处理请求，请稍后再试'
        : '网络连接失败，请检查网络后重试'

    ElMessage.error({
      message: errorMsg,
      duration: 3000,
      grouping: true
    })
  } finally {
    isSubmitting.value = false
  }
}

// ======== 头像上传 ========
function handleChange(file: any, fileList: any) {
  imageFileList.value = fileList

  if (!file.raw) return

  if (file.raw.size > 5 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过5MB')
    imageFileList.value = []
    return
  }

  let formData = new FormData()
  formData.append('file', file.raw)

  ElMessage.info('正在上传头像...')

  uploadImage(formData).then(res => {
    avatarUrl.value = res.data.data
    ElMessage.success({
      message: "头像上传成功",
      icon: Check
    })
  }).catch(() => {
    ElMessage.error("头像上传失败，请稍后重试")
    imageFileList.value = []
  })
}

function handleExceed() {
  ElMessage.warning("最多上传1个头像，如需更换请先删除当前头像")
}

function handleRemove() {
  avatarUrl.value = ''
  imageFileList.value = []
}

function uploadHttpRequest() {
  return new XMLHttpRequest()
}

// 键盘快捷键
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleRegister()
  }
}

// 页面加载时自动聚焦
onMounted(() => {
  setTimeout(() => {
    const firstInput = document.querySelector('input')
    firstInput?.focus()
  }, 100)
})
</script>

<template>
  <div class="register-page">
    <!-- 装饰背景 -->
    <div class="background-overlay"></div>
    <div class="background-pattern"></div>

    <!-- 主注册卡片 -->
    <el-card class="register-card" shadow="always" @keydown="onKeydown">
      <!-- 头部 -->
      <div class="register-header">
        <div class="header-icon">
          <el-icon size="32"><User /></el-icon>
        </div>
        <h1 class="welcome-text">创建新账户</h1>
        <p class="welcome-subtext">填写以下信息，快速加入我们</p>
      </div>

      <!-- 表单区域 -->
      <div class="register-form">
        <div class="form-grid">
          <!-- 用户名 -->
          <div class="form-group" :class="{ 'has-error': usernameError, 'is-focused': activeField === 'username' }">
            <label for="username" class="form-label">
              <el-icon class="label-icon"><User /></el-icon>
              用户名
              <span class="required-star">*</span>
            </label>
            <div class="input-wrapper">
              <el-input
                  id="username"
                  v-model="username"
                  placeholder="3-16位字符"
                  :prefix-icon="User"
                  @focus="activeField = 'username'"
                  @blur="activeField = ''; validateUsername()"
                  @input="validateUsername"
                  clearable
                  size="large"
                  :disabled="isSubmitting"
                  maxlength="16"
              />
              <div v-if="usernameError" class="error-message" role="alert">
                <el-icon size="12"><Warning /></el-icon>
                {{ usernameError }}
              </div>
            </div>
          </div>

          <!-- 姓名 -->
          <div class="form-group" :class="{ 'has-error': nameError, 'is-focused': activeField === 'name' }">
            <label for="name" class="form-label">
              <el-icon class="label-icon"><User /></el-icon>
              姓名
              <span class="required-star">*</span>
            </label>
            <div class="input-wrapper">
              <el-input
                  id="name"
                  v-model="name"
                  placeholder="请输入真实姓名"
                  clearable
                  @focus="activeField = 'name'"
                  @blur="activeField = ''; validateName()"
                  @input="validateName"
                  size="large"
                  :disabled="isSubmitting"
                  maxlength="20"
              />
              <div v-if="nameError" class="error-message" role="alert">
                <el-icon size="12"><Warning /></el-icon>
                {{ nameError }}
              </div>
            </div>
          </div>

          <!-- 身份 -->
          <div class="form-group" :class="{ 'is-focused': activeField === 'identity' }">
            <label for="identity" class="form-label">
              <el-icon class="label-icon"><User /></el-icon>
              身份
              <span class="required-star">*</span>
            </label>
            <div class="input-wrapper">
              <el-select
                  id="identity"
                  v-model="identity"
                  placeholder="请选择您的角色"
                  @focus="activeField = 'identity'"
                  @blur="activeField = ''"
                  size="large"
                  :disabled="isSubmitting"
                  style="width: 100%"
              >
                <el-option value="CUSTOMER" label="👤 顾客" />
                <el-option value="STAFF" label="👨‍💼 管理员" />
              </el-select>
            </div>
          </div>

          <!-- 手机号 -->
          <div class="form-group" :class="{ 'has-error': telError, 'is-focused': activeField === 'tel' }">
            <label for="tel" class="form-label">
              <el-icon class="label-icon"><Phone /></el-icon>
              手机号
              <span class="required-star">*</span>
            </label>
            <div class="input-wrapper">
              <el-input
                  id="tel"
                  v-model="tel"
                  placeholder="11位中国大陆手机号"
                  :prefix-icon="Phone"
                  @focus="activeField = 'tel'"
                  @blur="activeField = ''; validateTel()"
                  @input="validateTel"
                  clearable
                  size="large"
                  :disabled="isSubmitting"
                  maxlength="11"
              />
              <div v-if="telError" class="error-message" role="alert">
                <el-icon size="12"><Warning /></el-icon>
                {{ telError }}
              </div>
            </div>
          </div>

          <!-- 邮箱 -->
          <div class="form-group" :class="{ 'is-focused': activeField === 'email' }">
            <label for="email" class="form-label">
              <el-icon class="label-icon"><Message /></el-icon>
              邮箱
            </label>
            <div class="input-wrapper">
              <el-input
                  id="email"
                  v-model="email"
                  placeholder="请输入邮箱（可选）"
                  :prefix-icon="Message"
                  @focus="activeField = 'email'"
                  @blur="activeField = ''"
                  clearable
                  size="large"
                  :disabled="isSubmitting"
                  type="email"
              />
            </div>
          </div>

          <!-- 地址 -->
          <div class="form-group" :class="{ 'has-error': locationError, 'is-focused': activeField === 'location' }">
            <label for="location" class="form-label">
              <el-icon class="label-icon"><Location /></el-icon>
              地址
              <span class="required-star">*</span>
            </label>
            <div class="input-wrapper">
              <el-input
                  id="location"
                  v-model="location"
                  placeholder="请输入详细地址"
                  :prefix-icon="Location"
                  @focus="activeField = 'location'"
                  @blur="activeField = ''; validateLocation()"
                  @input="validateLocation"
                  clearable
                  size="large"
                  :disabled="isSubmitting"
                  maxlength="50"
              />
              <div v-if="locationError" class="error-message" role="alert">
                <el-icon size="12"><Warning /></el-icon>
                {{ locationError }}
              </div>
            </div>
          </div>

          <!-- 密码 -->
          <div class="form-group" :class="{ 'has-error': passwordError, 'is-focused': activeField === 'password' }">
            <label for="password" class="form-label">
              <el-icon class="label-icon"><Lock /></el-icon>
              密码
              <span class="required-star">*</span>
            </label>
            <div class="input-wrapper">
              <el-input
                  id="password"
                  v-model="password"
                  type="password"
                  placeholder="至少6位密码"
                  :prefix-icon="Lock"
                  @focus="activeField = 'password'"
                  @blur="activeField = ''; validatePassword()"
                  @input="validatePassword"
                  clearable
                  size="large"
                  :disabled="isSubmitting"
                  show-password
              />
              <div v-if="passwordError" class="error-message" role="alert">
                <el-icon size="12"><Warning /></el-icon>
                {{ passwordError }}
              </div>
            </div>
          </div>

          <!-- 确认密码 -->
          <div class="form-group" :class="{ 'has-error': passwordError, 'is-focused': activeField === 'confirmPassword' }">
            <label for="confirmPassword" class="form-label">
              <el-icon class="label-icon"><Lock /></el-icon>
              确认密码
              <span class="required-star">*</span>
            </label>
            <div class="input-wrapper">
              <el-input
                  id="confirmPassword"
                  v-model="confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  :prefix-icon="Lock"
                  @focus="activeField = 'confirmPassword'"
                  @blur="activeField = ''; validatePasswordMatch()"
                  @input="validatePasswordMatch"
                  clearable
                  size="large"
                  :disabled="isSubmitting"
                  show-password
              />
              <div v-if="passwordError && confirmPassword" class="error-message" role="alert">
                <el-icon size="12"><Warning /></el-icon>
                {{ passwordError }}
              </div>
            </div>
          </div>

          <!-- 头像上传 -->
          <div class="form-group full-width">
            <label class="form-label">
              <el-icon class="label-icon"><UploadFilled /></el-icon>
              头像
            </label>
            <div class="avatar-uploader">
              <el-upload
                  v-model:file-list="imageFileList"
                  :limit="1"
                  drag
                  accept="image/*"
                  :on-change="handleChange"
                  :on-exceed="handleExceed"
                  :on-remove="handleRemove"
                  :http-request="uploadHttpRequest"
                  :disabled="isSubmitting"
                  class="avatar-upload"
              >
                <div class="upload-content">
                  <el-icon size="48" color="#667eea"><UploadFilled /></el-icon>
                  <div class="upload-text">
                    <p class="upload-title">点击或拖拽上传头像</p>
                    <p class="upload-hint">支持 JPG、PNG 格式，大小不超过 5MB</p>
                  </div>
                </div>
              </el-upload>
              <div v-if="avatarUrl" class="avatar-preview">
                <div class="preview-label">头像预览：</div>
                <el-image
                    :src="avatarUrl"
                    fit="cover"
                    class="preview-image"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 表单提示 -->
        <div class="form-hints">
          <p class="hint-item">
            <el-icon size="12" color="#f59e0b"><Warning /></el-icon>
            带 <span class="required-star">*</span> 的为必填项
          </p>
          <p class="hint-item">
            <el-icon size="12" color="#10b981"><Check /></el-icon>
            所有信息提交后不可修改，请仔细核对
          </p>
        </div>

        <!-- 注册按钮 -->
        <div class="button-group">
          <el-button
              type="primary"
              :disabled="!isFormValid || isSubmitting"
              :loading="isSubmitting"
              @click="handleRegister"
              size="large"
              class="register-button"
          >
            {{ isSubmitting ? '正在注册...' : '创建账户' }}
          </el-button>

          <!-- 登录链接 -->
          <div class="login-link">
            <span>已有账户？</span>
            <router-link to="/login" :disabled="isSubmitting">
              <el-button type="text" :disabled="isSubmitting">
                立即登录
              </el-button>
            </router-link>
          </div>
        </div>
      </div>

      <!-- 页脚 -->
      <div class="register-footer">
        <p>注册即代表同意我们的
          <el-button type="text" size="small">服务条款</el-button>
          和
          <el-button type="text" size="small">隐私政策</el-button>
        </p>
      </div>
    </el-card>

    <!-- 键盘提示 -->
    <div class="keyboard-hint">
      <kbd>Enter</kbd> 快速注册
    </div>
  </div>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow-x: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 背景装饰 */
.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(10px);
  z-index: 1;
}

.background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
      radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 20%),
      radial-gradient(circle at 90% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 20%);
  z-index: 2;
}

/* 注册卡片 */
.register-card {
  width: 100%;
  max-width: 900px;
  border: none;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  position: relative;
  z-index: 3;
  animation: cardEntrance 0.6s ease-out;
  padding: 40px;
}

@keyframes cardEntrance {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.register-card:hover {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15) !important;
}

/* 头部 */
.register-header {
  text-align: center;
  margin-bottom: 40px;
}

.header-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  margin-bottom: 20px;
  color: white;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.welcome-text {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtext {
  margin: 0;
  color: #666;
  font-size: 15px;
  opacity: 0.8;
}

/* 表单网格 */
.register-form {
  margin-bottom: 32px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

/* 表单组 */
.form-group {
  transition: all 0.3s ease;
}

.form-group.is-focused {
  transform: translateX(4px);
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 500;
  color: #333;
  font-size: 15px;
}

.label-icon {
  color: #667eea;
  font-size: 16px;
}

.required-star {
  color: #f56565;
  margin-left: 2px;
}

/* 输入框样式 */
.input-wrapper {
  position: relative;
}

:deep(.el-input),
:deep(.el-select) {
  --el-input-border-radius: 12px;
  --el-input-bg-color: rgba(248, 250, 252, 0.8);
  --el-input-border-color: #e2e8f0;
  --el-input-hover-border-color: #cbd5e1;
}

:deep(.el-input.is-focus),
:deep(.el-select.is-focus .el-input) {
  --el-input-border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group.has-error :deep(.el-input),
.form-group.has-error :deep(.el-select .el-input) {
  --el-input-border-color: #f56565;
  animation: errorShake 0.4s ease-in-out;
}

@keyframes errorShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.error-message {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #f56565;
  font-size: 12px;
  margin-top: 6px;
  padding-left: 4px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 头像上传 */
.avatar-uploader {
  width: 100%;
}

:deep(.avatar-upload .el-upload) {
  width: 100%;
  border-radius: 12px;
  border: 2px dashed #cbd5e1;
  background: rgba(248, 250, 252, 0.8);
  transition: all 0.3s ease;
}

:deep(.avatar-upload .el-upload:hover) {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

:deep(.avatar-upload .el-upload-dragger) {
  width: 100%;
  height: 120px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.upload-title {
  margin: 0;
  font-weight: 500;
  color: #333;
}

.upload-hint {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
}

.avatar-preview {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.preview-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.preview-image {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
  overflow: hidden;
}

/* 表单提示 */
.form-hints {
  padding: 16px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
  margin: 24px 0;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
  font-size: 13px;
  color: #64748b;
}

/* 按钮组 */
.button-group {
  margin-top: 32px;
  text-align: center;
}

.register-button {
  width: 100%;
  height: 56px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.register-button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(102, 126, 234, 0.3);
}

.register-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.register-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.register-button:hover::before {
  left: 100%;
}

.login-link {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: #64748b;
}

.login-link a {
  text-decoration: none;
}

.login-link :deep(.el-button) {
  padding: 4px 8px;
  font-weight: 500;
}

/* 页脚 */
.register-footer {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #f1f5f9;
  font-size: 13px;
  color: #94a3b8;
}

.register-footer :deep(.el-button) {
  padding: 0 4px;
  font-size: 13px;
  color: #667eea;
}

.register-footer :deep(.el-button):hover {
  color: #764ba2;
}

/* 键盘提示 */
.keyboard-hint {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  color: white;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.keyboard-hint:hover {
  opacity: 1;
}

.keyboard-hint kbd {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 2px 6px;
  font-family: monospace;
  font-size: 11px;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .register-page {
    padding: 16px;
  }

  .register-card {
    padding: 24px;
    border-radius: 20px;
  }

  .welcome-text {
    font-size: 28px;
  }

  .header-icon {
    width: 64px;
    height: 64px;
  }

  .form-grid {
    gap: 20px;
  }

  .register-button {
    height: 48px;
    font-size: 15px;
  }

  .keyboard-hint {
    bottom: 10px;
    right: 10px;
    font-size: 11px;
  }
}
</style>