<script setup lang="ts">
import { ref, computed } from 'vue'
import { router } from '../../router'
import { userRegister } from "../../api/accounts.ts"
import { ElMessage } from "element-plus"
import { uploadImage } from "../../api/tools.ts"
import { UploadFilled } from "@element-plus/icons-vue"

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

// ======== 输入框 ref（支持错误聚焦） ========
const usernameInputRef = ref()
const telInputRef = ref()
const passwordInputRef = ref()
const confirmInputRef = ref()

// ======== 校验规则 ========
// 中国手机号
const chinaMobileRegex = /^1(3[0-9]|4[579]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[189])\d{8}$/

// 手机校验
const telError = ref('')
const validateTel = () => {
  if (!tel.value) {
    telError.value = ''
  } else if (!chinaMobileRegex.test(tel.value)) {
    telError.value = '请输入正确的中国大陆手机号'
  } else {
    telError.value = ''
  }
}

// 密码校验
const passwordError = ref('')
const validatePasswordMatch = () => {
  if (!confirmPassword.value) {
    passwordError.value = ''
  } else if (confirmPassword.value !== password.value) {
    passwordError.value = '两次密码输入不一致'
  } else {
    passwordError.value = ''
  }
}

// 是否所有字段满足注册条件
const registerDisabled = computed(() => {
  const coreValid =
      name.value &&
      username.value &&
      identity.value &&
      chinaMobileRegex.test(tel.value) &&
      password.value.length >= 6 &&
      confirmPassword.value === password.value &&
      location.value

  return !coreValid
})

// ======== 注册提交 ========
async function handleRegister() {
  if (registerDisabled.value) return

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
      ElMessage.success("注册成功！请登录")
      router.push("/login")
    } else {
      ElMessage.error(res.data.msg || '注册失败，请检查输入')
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('网络错误，请稍后再试')
  }
}

// ======== 头像上传 ========
function handleChange(file: any, fileList: any) {
  imageFileList.value = fileList

  let formData = new FormData()
  formData.append('file', file.raw)

  uploadImage(formData).then(res => {
    avatarUrl.value = res.data.data
    ElMessage.success("头像上传成功")
  }).catch(() => {
    ElMessage.error("头像上传失败")
  })
}

function handleExceed() {
  ElMessage.warning("最多上传 1 个头像")
}

function uploadHttpRequest() {
  return new XMLHttpRequest()
}
</script>

<template>
  <el-main class="main-frame bgImage">
    <el-card class="login-card">
      <div class="form-title">
        <h1>欢迎加入我们</h1>
        <p>请填写以下信息完成账户创建</p>
      </div>

      <el-form
          @submit.prevent="handleRegister"
          label-width="90px"
          label-position="right"
      >
        <!-- 用户名 -->
        <el-form-item label="用户名">
          <el-input
              ref="usernameInputRef"
              v-model="username"
              placeholder="请输入用户名（建议 3-16 位）"
              maxlength="20"
              show-word-limit
          />
        </el-form-item>

        <!-- 姓名 -->
        <el-form-item label="姓名">
          <el-input v-model="name" placeholder="请输入姓名" maxlength="20" />
        </el-form-item>

        <!-- 身份 -->
        <el-form-item label="身份">
          <el-select v-model="identity" placeholder="请选择您的角色" style="width:100%">
            <el-option value="CUSTOMER" label="顾客" />
            <el-option value="STAFF" label="管理员" />
          </el-select>
        </el-form-item>

        <!-- 手机号 -->
        <el-form-item label="手机号" :error="telError">
          <el-input
              ref="telInputRef"
              v-model="tel"
              placeholder="请输入大陆手机号"
              @input="validateTel"
              maxlength="11"
          />
        </el-form-item>

        <!-- 邮箱 -->
        <el-form-item label="邮箱" class="optional">
          <el-input v-model="email" placeholder="请输入邮箱（可选）" />
        </el-form-item>

        <!-- 地址 -->
        <el-form-item label="地址">
          <el-input
              v-model="location"
              placeholder="请输入详细地址"
              maxlength="50"
          />
        </el-form-item>

        <!-- 密码 -->
        <el-form-item label="密码">
          <el-input
              ref="passwordInputRef"
              v-model="password"
              type="password"
              show-password
              placeholder="至少 6 位，建议包含数字和字母"
              minlength="6"
              @input="validatePasswordMatch"
          />
        </el-form-item>

        <!-- 确认密码 -->
        <el-form-item label="确认密码" :error="passwordError">
          <el-input
              ref="confirmInputRef"
              type="password"
              v-model="confirmPassword"
              @input="validatePasswordMatch"
              show-password
              placeholder="请再次输入密码"
          />
        </el-form-item>

        <!-- 头像上传 -->
        <el-form-item label="头像" class="optional">
          <el-upload
              v-model:file-list="imageFileList"
              :limit="1"
              drag
              accept="image/*"
              :on-change="handleChange"
              :on-exceed="handleExceed"
              :http-request="uploadHttpRequest"
          >
            <el-icon><UploadFilled /></el-icon>
            <div class="el-upload__text">拖拽或点击上传头像</div>
          </el-upload>
        </el-form-item>

      </el-form>

      <!-- 独立按钮区 -->
      <el-form-item class="button-area">
        <el-button
            type="primary"
            :disabled="registerDisabled"
            class="btn-main"
            @click="handleRegister"
        >
          创建账户
        </el-button>


        <router-link to="/login" class="login-link">
          已有账号？去登录
        </router-link>
      </el-form-item>

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
  background-image: linear-gradient(
      rgba(255, 255, 255, 0.8),
      rgba(255, 255, 255, 0.9)
  ),
  url("../../assets/sakura.jpg");
  background-size: cover;
}

.login-card {
  width: 480px;
  margin: 0 auto;
  padding: 40px 50px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(6px);
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.form-container h1 {
  font-weight: 600;
  font-size: 22px;
  text-align: center;
  color: #2c3e50;
  margin-bottom: 24px;
}

/* 错误 shake */
.el-form-item.is-error :deep(.el-input__inner) {
  animation: shake 0.18s ease-in-out;
}

@keyframes shake {
  0% { transform: translateX(0) }
  25% { transform: translateX(-3px) }
  50% { transform: translateX(3px) }
  75% { transform: translateX(-3px) }
  100% { transform: translateX(0) }
}
.form-title {
  text-align: center;
  margin-bottom: 24px;
}

.form-title h1 {
  font-size: 26px;
  font-weight: 650;
  margin: 0;
  color: #2c3e50;
  letter-spacing: 0.5px;
}

.form-title p {
  font-size: 14px;
  margin-top: 6px;
  color: #606266;
}
.button-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px; /* 控制按钮之间的距离 */
  margin-top: 10px;
}

.btn-main {
  width: 100%;
  height: 40px;
  font-size: 15px;

}

.login-link {
  color: #409eff;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
}

:deep(.el-form-item__label)::before {
  content: "*";
  color: #f56c6c;
  margin-right: 4px;
}
:deep(.optional .el-form-item__label)::before {
  content: ""; /* 删除星号 */
}

</style>
