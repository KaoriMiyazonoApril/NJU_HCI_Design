<script setup lang="ts">
import { ElForm, ElMessage, ElLoading } from 'element-plus'
import { ref, computed, nextTick, onMounted } from 'vue'
import { router } from '../../router'
import { userInfo, userLogin } from '../../api/accounts.ts'
import { User, Lock, Loading } from '@element-plus/icons-vue'

// 输入值
const username = ref('')
const password = ref('')

// ref（登录按钮和输入框，用于聚焦）
const usernameInputRef = ref()
const passwordInputRef = ref()
const loginButtonRef = ref()

// 登录中防重复提交
const isLoggingIn = ref(false)

// 自动聚焦和表单状态
const isUsernameFocused = ref(false)
const isPasswordFocused = ref(false)

// 校验
const isUsernameValid = computed(() => {
  const trimmed = username.value.trim()
  return trimmed.length > 0 && trimmed.length <= 30
})

const isPasswordValid = computed(() => {
  return password.value.length >= 6 && password.value.length <= 20
})

const usernameError = computed(() => {
  if (!username.value.trim()) return '请输入用户名'
  if (username.value.trim().length > 30) return '用户名不能超过30个字符'
  return ''
})

const passwordError = computed(() => {
  if (!password.value) return '请输入密码'
  if (password.value.length < 6) return '密码长度不能少于6位'
  if (password.value.length > 20) return '密码长度不能超过20位'
  return ''
})

const canLogin = computed(() => {
  return isUsernameValid.value && isPasswordValid.value && !isLoggingIn.value
})

// 登录处理
async function handleLogin() {
  if (!canLogin.value) {
    // 如果校验失败，显示对应的错误信息
    if (!isUsernameValid.value) {
      usernameInputRef.value?.focus()
    } else if (!isPasswordValid.value) {
      passwordInputRef.value?.focus()
    }
    return
  }

  isLoggingIn.value = true

  const loading = ElLoading.service({
    target: '.login-card',
    text: '正在验证您的信息…',
    background: 'rgba(255, 255, 255, 0.85)',
    spinner: 'el-icon-loading',
    lock: true
  })

  try {
    const res = await userLogin({
      username: username.value.trim(),
      password: password.value
    })

    if (res.data.code === '200') {
      ElMessage.success({
        message: '欢迎回来！登录成功',
        duration: 1500,
        showClose: true,
        grouping: true
      })

      const token = res.data.data
      sessionStorage.setItem('token', token)
      sessionStorage.setItem('username', username.value.trim())

      try {
        const infoRes = await userInfo(username.value.trim())
        const info = infoRes.data.data
        sessionStorage.setItem('name', info.name)
        sessionStorage.setItem('role', info.role)
        sessionStorage.setItem('id', info.id)
      } catch {
        console.warn('用户信息获取失败')
      }

      // 添加轻微延迟让用户看到成功提示
      setTimeout(() => {
        router.push('/home/allproduct')
      }, 300)
    } else {
      const msg = res.data.msg || '用户名或密码错误'
      ElMessage.error({
        message: msg,
        duration: 3000,
        showClose: true,
        grouping: true
      })

      // 清空密码并聚焦
      await nextTick()
      password.value = ''
      passwordInputRef.value?.focus()
    }
  } catch (err: any) {
    console.error('网络或系统错误:', err)
    const errorMsg = err.response?.status === 500
        ? '服务器错误，请稍后再试'
        : '网络连接失败，请检查网络后重试'

    ElMessage.error({
      message: errorMsg,
      duration: 3000,
      showClose: true,
      grouping: true
    })

    await nextTick()
    usernameInputRef.value?.focus()
  } finally {
    loading.close()
    setTimeout(() => {
      isLoggingIn.value = false
    }, 300)
  }
}

// 回车登录
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    handleLogin()
  }
}

// 切换密码显示状态
const showPassword = ref(false)

// 页面加载时自动聚焦用户名输入框
onMounted(() => {
  setTimeout(() => {
    usernameInputRef.value?.focus()
  }, 100)
})

// 清除输入
function clearUsername() {
  username.value = ''
  usernameInputRef.value?.focus()
}

function clearPassword() {
  password.value = ''
  passwordInputRef.value?.focus()
}
</script>

<template>
  <div class="login-page">
    <!-- 装饰背景 -->
    <div class="background-overlay"></div>
    <div class="background-pattern"></div>

    <!-- 主登录卡片 -->
    <el-card class="login-card" shadow="always" @keydown="onKeydown">
      <!-- 头部 -->
      <div class="login-header">
        <div class="header-icon">
          <el-icon size="32"><User /></el-icon>
        </div>
        <h1 class="welcome-text">欢迎回来</h1>
        <p class="welcome-subtext">请登录您的账户继续访问</p>
      </div>

      <!-- 表单区域 -->
      <div class="login-form">
        <el-form>
          <!-- 用户名输入 -->
          <div class="form-group" :class="{ 'has-error': usernameError, 'is-focused': isUsernameFocused }">
            <label for="username" class="form-label">
              <el-icon class="label-icon"><User /></el-icon>
              用户名
            </label>
            <div class="input-wrapper">
              <el-input
                  id="username"
                  ref="usernameInputRef"
                  v-model="username"
                  type="text"
                  placeholder="请输入用户名"
                  :prefix-icon="User"
                  @focus="isUsernameFocused = true"
                  @blur="isUsernameFocused = false"
                  @input="usernameError = ''"
                  clearable
                  @clear="clearUsername"
                  size="large"
                  :disabled="isLoggingIn"
              />
              <div v-if="usernameError" class="error-message" role="alert">
                <el-icon size="12"><Loading /></el-icon>
                {{ usernameError }}
              </div>
            </div>
          </div>

          <!-- 密码输入 -->
          <div class="form-group" :class="{ 'has-error': passwordError, 'is-focused': isPasswordFocused }">
            <label for="password" class="form-label">
              <el-icon class="label-icon"><Lock /></el-icon>
              密码
            </label>
            <div class="input-wrapper">
              <el-input
                  id="password"
                  ref="passwordInputRef"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入密码"
                  :prefix-icon="Lock"
                  @focus="isPasswordFocused = true"
                  @blur="isPasswordFocused = false"
                  @input="passwordError = ''"
                  clearable
                  @clear="clearPassword"
                  size="large"
                  :disabled="isLoggingIn"
              >
                <template #suffix>
                  <el-icon
                      class="password-toggle"
                      @click="showPassword = !showPassword"
                      :style="{ cursor: 'pointer' }"
                  >
                    {{ showPassword ? 'View' : 'Hide' }}
                  </el-icon>
                </template>
              </el-input>
              <div v-if="passwordError" class="error-message" role="alert">
                <el-icon size="12"><Loading /></el-icon>
                {{ passwordError }}
              </div>
            </div>
            <div class="password-hint">
              密码长度为6-20位，建议使用字母、数字和符号的组合
            </div>
          </div>

          <!-- 登录按钮 -->
          <div class="button-group">
            <el-button
                ref="loginButtonRef"
                type="primary"
                :disabled="!canLogin"
                :loading="isLoggingIn"
                @click="handleLogin"
                size="large"
                class="login-button"
                :icon="isLoggingIn ? Loading : ''"
            >
              {{ isLoggingIn ? '正在登录...' : '登录' }}
            </el-button>

            <!-- 辅助操作 -->
            <div class="helper-links">
              <router-link to="/register" class="register-link">
                <el-button type="text" :disabled="isLoggingIn">
                  没有账户？立即注册
                </el-button>
              </router-link>

              <el-divider direction="vertical" />

              <router-link to="/forgot-password" class="forgot-link">
                <el-button type="text" :disabled="isLoggingIn">
                  忘记密码？
                </el-button>
              </router-link>
            </div>
          </div>
        </el-form>

        <!-- 额外提示 -->
        <div class="additional-info">
          <p class="security-tip">
            <el-icon size="14" color="#409eff"><Lock /></el-icon>
            您的账户信息受SSL加密保护
          </p>
        </div>
      </div>

      <!-- 页脚 -->
      <div class="login-footer">
        <p>首次使用？<router-link to="/register" class="footer-link">创建新账户</router-link></p>
      </div>
    </el-card>

    <!-- 键盘提示 -->
    <div class="keyboard-hint">
      <kbd>Enter</kbd> 快速登录
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
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

/* 登录卡片 */
.login-card {
  width: 100%;
  max-width: 420px;
  border: none;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 3;
  transition: all 0.3s ease;
  animation: cardEntrance 0.6s ease-out;
}

.login-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
}

@keyframes cardEntrance {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 头部样式 */
.login-header {
  text-align: center;
  margin-bottom: 32px;
  padding-top: 10px;
}

.header-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  margin-bottom: 16px;
  color: white;
}

.welcome-text {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtext {
  margin: 0;
  color: #666;
  font-size: 14px;
}

/* 表单样式 */
.login-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 24px;
  transition: all 0.3s ease;
}

.form-group.is-focused {
  transform: translateX(4px);
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.label-icon {
  color: #667eea;
  font-size: 16px;
}

.input-wrapper {
  position: relative;
}

:deep(.el-input) {
  --el-input-border-radius: 12px;
  --el-input-bg-color: rgba(248, 250, 252, 0.8);
  --el-input-border-color: #e2e8f0;
  --el-input-hover-border-color: #cbd5e1;
}

:deep(.el-input.is-focus) {
  --el-input-border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group.has-error :deep(.el-input) {
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

.password-hint {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 6px;
  padding-left: 4px;
}

.password-toggle {
  color: #94a3b8;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: #667eea;
}

/* 按钮组 */
.button-group {
  margin-top: 32px;
}

.login-button {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  font-weight: 500;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.login-button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.login-button:hover::before {
  left: 100%;
}

/* 辅助链接 */
.helper-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

.helper-links :deep(.el-divider) {
  margin: 0;
  height: 16px;
  background-color: #e2e8f0;
}

.helper-links :deep(.el-button) {
  padding: 4px 8px;
  font-size: 13px;
  color: #64748b;
}

.helper-links :deep(.el-button):hover {
  color: #667eea;
}

/* 额外信息 */
.additional-info {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.security-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 0;
  font-size: 12px;
  color: #64748b;
}

/* 页脚 */
.login-footer {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
  font-size: 14px;
  color: #64748b;
}

.footer-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #764ba2;
  text-decoration: underline;
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

/* 响应式设计 */
@media (max-width: 640px) {
  .login-page {
    padding: 16px;
  }

  .login-card {
    max-width: 100%;
    border-radius: 16px;
  }

  .welcome-text {
    font-size: 24px;
  }

  .header-icon {
    width: 56px;
    height: 56px;
  }

  .helper-links {
    flex-direction: column;
    gap: 8px;
  }

  .helper-links :deep(.el-divider) {
    display: none;
  }

  .keyboard-hint {
    bottom: 10px;
    right: 10px;
    font-size: 11px;
  }
}

/* 加载状态样式 */
:deep(.el-loading-spinner) {
  color: #667eea;
}

:deep(.el-loading-text) {
  color: #667eea;
  margin-top: 10px;
  font-size: 14px;
}

/* 路由链接样式 */
.register-link,
.forgot-link {
  text-decoration: none;
}

.register-link:hover :deep(.el-button),
.forgot-link:hover :deep(.el-button) {
  color: #667eea;
}
</style>