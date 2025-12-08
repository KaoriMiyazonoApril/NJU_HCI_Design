<script setup lang="ts">
import { ElForm, ElFormItem, ElMessage, ElLoading } from 'element-plus'
import { ref, computed, nextTick } from 'vue'
import { router } from '../../router'
import { userInfo, userLogin } from '../../api/accounts.ts'

// 输入值
const username = ref('')
const password = ref('')

// ref（登录按钮和输入框，用于聚焦）
const usernameInputRef = ref()
const passwordInputRef = ref()

// 登录中防重复提交
const isLoggingIn = ref(false)

// 校验
const isUsernameValid = computed(() => {
  const trimmed = username.value.trim()
  return trimmed.length > 0 && trimmed.length <= 30
})

const isPasswordValid = computed(() => {
  return password.value.length >= 6 && password.value.length <= 20
})

const canLogin = computed(() => {
  return isUsernameValid.value && isPasswordValid.value && !isLoggingIn.value
})

// 登录处理
async function handleLogin() {
  if (!canLogin.value) return

  isLoggingIn.value = true

  const loading = ElLoading.service({
    target: '.login-card',
    text: '正在为您登录…',
    background: 'rgba(255, 255, 255, 0.6)',
    fullscreen: false
  })

  try {
    const res = await userLogin({
      username: username.value.trim(),
      password: password.value
    })

    if (res.data.code === '200') {
      ElMessage.success('欢迎回来！登录成功')
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

      router.push('/home/allproduct')
    } else {
      const msg = res.data.msg || '用户名或密码错误'
      ElMessage.error(msg)

      // 聚焦到密码框
      await nextTick()
      password.value = ''
      passwordInputRef.value?.focus()
    }
  } catch (err) {
    console.error('网络或系统错误:', err)
    ElMessage.error('网络连接失败，请稍后再试')

    await nextTick()
    usernameInputRef.value?.focus()
  } finally {
    loading.close()
    isLoggingIn.value = false
  }
}

// 回车登录
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    if (!isUsernameValid.value) {
      usernameInputRef.value?.focus()
      return
    }
    if (!isPasswordValid.value) {
      passwordInputRef.value?.focus()
      return
    }
    handleLogin()
  }
}
</script>

<template>
  <el-main class="main-frame bgImage">
    <el-card class="login-card" @keydown="onKeydown">
      <div class="login-content">
        <h1>登录您的账户</h1>

        <el-form>
          <!-- 用户名 -->
          <el-form-item>
            <label for="username" class="form-label">用户名</label>
            <el-input
                id="username"
                ref="usernameInputRef"
                v-model="username"
                type="text"
                placeholder="请输入用户名"
                :class="{ 'error-input': username && !isUsernameValid }"
                aria-invalid="true"
                :aria-describedby="username && !isUsernameValid ? 'username-error' : undefined"
            />
            <div
                v-if="username && !isUsernameValid"
                id="username-error"
                class="error-hint"
                role="alert"
            >
              用户名不能超过30个字符
            </div>
          </el-form-item>

          <!-- 密码 -->
          <el-form-item>
            <label for="password" class="form-label">密码</label>
            <el-input
                id="password"
                ref="passwordInputRef"
                v-model="password"
                type="password"
                placeholder="请输入密码"
                :class="{ 'error-input': password && !isPasswordValid }"
                aria-invalid="true"
                :aria-describedby="password && !isPasswordValid ? 'password-error' : undefined"
            />
            <div
                v-if="password && !isPasswordValid"
                id="password-error"
                class="error-hint"
                role="alert"
            >
              密码长度需为6-20位
            </div>
          </el-form-item>

          <!-- 按钮组 -->
          <div class="button-group">
            <el-button
                type="primary"
                :disabled="!canLogin"
                :loading="isLoggingIn"
                @click="handleLogin"
                style="flex: 1"
            >
              {{ isLoggingIn ? '登录中...' : '登录' }}
            </el-button>

            <router-link to="/register" style="text-decoration: none">
              <el-button>注册账号</el-button>
            </router-link>
          </div>
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
}

.bgImage {
  background-image: linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.9)),
  url('../../assets/sakura2.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.login-card {
  width: 480px;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  background-color: rgba(255, 255, 255, 0.95);
}

.login-content h1 {
  text-align: center;
  margin-bottom: 24px;
  font-weight: 600;
  color: #2c3e50;
}

/* 错误输入框动画与提示 */
.error-input :deep(.el-input__inner) {
  border-color: #e53e3e !important;
  animation: shake 0.2s ease-in-out;
}

@keyframes shake {
  0% { transform: translateX(0) }
  25% { transform: translateX(-3px) }
  50% { transform: translateX(3px) }
  75% { transform: translateX(-3px) }
  100% { transform: translateX(0) }
}

.error-hint {
  color: #e53e3e;
  font-size: 12px;
  margin-top: 4px;
}

.button-group {
  margin-top: 24px;
  display: flex;
  gap: 12px;
}
</style>
