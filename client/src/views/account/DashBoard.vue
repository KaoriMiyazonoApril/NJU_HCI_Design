<script setup lang="ts">
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {parseRole} from "../../utils"
import {userInfo, userInfoUpdate, type UpdateInfo, deleteUser} from "../../api/accounts.ts"
import { ElMessageBox, ElMessage } from 'element-plus'
import { User, Lock, Phone, Message, Location, Calendar } from '@element-plus/icons-vue'

const user = ref({
  id: '',
  username: '',
  name: '',
  avatar: '',
  telephone: '',
  email: '',
  location: '',
  role: '',
});

const router = useRouter()

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    editableUser.value.avatar = URL.createObjectURL(file);
  }
}

const editableUser = ref({ ...user.value });
const displayInfoCard = ref(false);
const displayPasswordCard = ref(false);

const passwordForm = ref({
  newPassword: '',
  confirmPassword: '',
});

const passwordErrors = ref({
  newPassword: '',
  confirmPassword: '',
});

const validateTelephone = (telephone: string): boolean => {
  const telephoneRegex = /^1\d{10}$/;
  return telephoneRegex.test(telephone);
};

const toggleEditMode = () => {
  if (displayInfoCard.value) {
    Object.assign(editableUser.value, user.value);
  }
  displayInfoCard.value = !displayInfoCard.value;
};

getUserInfo()

function getUserInfo() {
  const username = sessionStorage.getItem("username");
  if (!username) {
    ElMessage.error("无法获取用户信息，请先登录！");
    return;
  }

  userInfo(username)
      .then(res => {
        console.log(res);
        user.value = {
          id: res.data.data.id,
          username: res.data.data.username,
          name: res.data.data.name,
          avatar: res.data.data.avatar,
          telephone: res.data.data.telephone,
          email: res.data.data.email,
          location: res.data.data.location,
          role: res.data.data.role,
        };
        editableUser.value = { ...user.value };
      })
      .catch(error => {
        console.error("Error fetching user info:", error.response?.data || error.message);
        ElMessage.error("获取用户信息失败，请稍后再试！");
      });
}

const updateUserInfo = async () => {
  if (!editableUser.value.name || !editableUser.value.telephone) {
    ElMessage.error('请填写完整信息');
    return;
  }

  if (!validateTelephone(editableUser.value.telephone || '')) {
    ElMessage.error('电话号码格式不正确，请输入以 1 开头的 11 位数字');
    return;
  }

  try {
    const token = sessionStorage.getItem("token");
    if (!token) {
      ElMessage.error("登录已过期，请重新登录！");
      return;
    }

    const updateData: UpdateInfo = {
      name: editableUser.value.name,
      avatar: editableUser.value.avatar,
      telephone: editableUser.value.telephone,
      email: editableUser.value.email,
      location: editableUser.value.location,
    };

    const username = user.value.username;
    const response = await userInfoUpdate(updateData, username, { headers: { token } });

    if (response.data.code === '200') {
      Object.assign(user.value, editableUser.value);
      displayInfoCard.value = false;
      ElMessage.success(response.data.data || '更新成功');
    } else {
      ElMessage.error(response.data.msg || '用户信息更新失败');
    }
  } catch (error: any) {
    console.error('用户信息更新失败', error);
    if (error.response) {
      ElMessage.error(error.response.data.msg || '用户信息更新失败');
    } else {
      ElMessage.error('网络错误，请稍后再试');
    }
  }
};

const togglePasswordEditMode = () => {
  if (displayPasswordCard.value) {
    Object.assign(passwordForm.value, {
      newPassword: '',
      confirmPassword: '',
    });
    Object.assign(passwordErrors.value, {
      newPassword: '',
      confirmPassword: '',
    });
  }
  displayPasswordCard.value = !displayPasswordCard.value;
};

const validatePasswordForm = (): boolean => {
  let isValid = true;
  Object.assign(passwordErrors.value, {
    newPassword: '',
    confirmPassword: '',
  });

  if (!passwordForm.value.newPassword) {
    passwordErrors.value.newPassword = '请输入新密码';
    isValid = false;
  } else if (passwordForm.value.newPassword.length < 6) {
    passwordErrors.value.newPassword = '密码长度不能小于6位';
    isValid = false;
  }

  if (!passwordForm.value.confirmPassword) {
    passwordErrors.value.confirmPassword = '请确认新密码';
    isValid = false;
  } else if (passwordForm.value.confirmPassword !== passwordForm.value.newPassword) {
    passwordErrors.value.confirmPassword = '两次输入的密码不一致';
    isValid = false;
  }

  return isValid;
};

const updatePassword = async () => {
  if (!validatePasswordForm()) {
    return;
  }

  try {
    const token = sessionStorage.getItem("token");
    if (!token) {
      ElMessage.error("登录已过期，请重新登录！");
      return;
    }
    const updateData: UpdateInfo = {
      password: passwordForm.value.newPassword,
    };

    const username = user.value.username;
    const response = await userInfoUpdate(updateData, username, { headers: { token } });

    if (response.data.code === '200') {
      ElMessage.success('密码修改成功，请重新登录');
      togglePasswordEditMode();
    } else {
      ElMessage.error(response.data.msg || '密码修改失败');
    }
  } catch (error) {
    console.error('密码修改失败', error);
    ElMessage.error('密码修改失败，请稍后再试');
  }
};

const handleLogout = () => {
  ElMessageBox.confirm('确定要注销账户吗？此操作不可恢复', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
    confirmButtonClass: 'el-button--danger',
    center: true
  }).then(async () => {
    const userId = Number(user.value.id);
    if (!userId) {
      ElMessage.error("无法获取用户ID");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        ElMessage.error("登录已过期，请重新登录！");
        return;
      }

      const response = await deleteUser(userId, {
        headers: { token }
      });

      if (response.data.code === '200') {
        ElMessage.success('注销成功，即将跳转至登录页');
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("username");

        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        ElMessage.error(response.data.msg || '注销失败');
      }
    } catch (error: any) {
      console.error("注销失败", error);
      ElMessage.error(error.response?.data?.msg || '网络错误或注销失败，请稍后再试');
    }

  }).catch(() => {
    ElMessage.info('已取消注销');
  });
};

const goHome = () => {
  router.push({ path: '/home/allproduct' })
}
</script>

<template>
  <div class="dashboard-container">
    <!-- 用户信息卡片 -->
    <el-card class="user-profile-card" shadow="hover">
      <div class="profile-header">
        <div class="avatar-container">
          <div class="avatar-wrapper">
            <el-avatar
                :src="typeof user.avatar === 'string' ? user.avatar : undefined"
                :size="100"
                class="profile-avatar"
            >
              <span v-if="!user.avatar" class="avatar-fallback">
                {{ user.name?.charAt(0) || 'U' }}
              </span>
            </el-avatar>
            <div class="avatar-status"></div>
          </div>
          <div class="user-identity">
            <h2 class="user-name">{{ user.name }}</h2>
            <p class="user-handle">@{{ user.username }}</p>
            <el-tag
                :type="user.role === 'admin' ? 'danger' : 'primary'"
                size="small"
                class="role-tag"
            >
              {{ parseRole(user.role) }}
            </el-tag>
          </div>
        </div>

        <div class="welcome-section">
          <div class="welcome-header">
            <h1 class="welcome-title">欢迎回来！</h1>
            <el-button
                type="primary"
                @click="goHome"
                plain
                class="home-button"
            >
              返回主页
            </el-button>
          </div>
          <div class="welcome-content">
            <el-icon class="calendar-icon"><Calendar /></el-icon>
            <span class="current-date">
              {{ new Date().toLocaleDateString('zh-CN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) }}
            </span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 信息和安全卡片 -->
    <div class="content-grid">
      <!-- 个人信息卡片 -->
      <el-card class="info-section-card" shadow="hover">
        <template #header>
          <div class="section-header">
            <div class="section-title">
              <el-icon class="section-icon"><User /></el-icon>
              <span>个人信息</span>
            </div>
            <el-button
                type="primary"
                @click="toggleEditMode"
                size="small"
                :icon="displayInfoCard ? 'Close' : 'Edit'"
                plain
            >
              {{ displayInfoCard ? '取消编辑' : '编辑信息' }}
            </el-button>
          </div>
        </template>

        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">用户名</div>
            <div class="info-value">{{ user.username }}</div>
          </div>

          <div class="info-item">
            <div class="info-label">姓名</div>
            <div class="info-value">{{ user.name }}</div>
          </div>

          <div class="info-item">
            <div class="info-label">
              <el-icon><Phone /></el-icon>
              联系电话
            </div>
            <div class="info-value">{{ user.telephone }}</div>
          </div>

          <div class="info-item">
            <div class="info-label">
              <el-icon><Message /></el-icon>
              邮箱地址
            </div>
            <div class="info-value">{{ user.email || '未设置' }}</div>
          </div>

          <div class="info-item">
            <div class="info-label">
              <el-icon><Location /></el-icon>
              所在地
            </div>
            <div class="info-value">{{ user.location || '未设置' }}</div>
          </div>
        </div>
      </el-card>

      <!-- 安全设置卡片 -->
      <el-card class="security-section-card" shadow="hover">
        <template #header>
          <div class="section-header">
            <div class="section-title">
              <el-icon class="section-icon"><Lock /></el-icon>
              <span>账户安全</span>
            </div>
            <el-button
                type="primary"
                @click="togglePasswordEditMode"
                size="small"
                :icon="displayPasswordCard ? 'Close' : 'Edit'"
                plain
            >
              {{ displayPasswordCard ? '取消修改' : '修改密码' }}
            </el-button>
          </div>
        </template>

        <div class="security-items">
          <div class="security-item">
            <div class="security-status active">
              <el-icon><Lock /></el-icon>
            </div>
            <div class="security-content">
              <div class="security-title">密码保护</div>
              <div class="security-desc">已设置高强度密码</div>
            </div>
          </div>

          <div class="security-item">
            <div class="security-status" :class="{ active: user.telephone }">
              <el-icon><Phone /></el-icon>
            </div>
            <div class="security-content">
              <div class="security-title">手机验证</div>
              <div class="security-desc">{{ user.telephone ? '已绑定手机' : '未绑定手机' }}</div>
            </div>
          </div>

          <div class="security-item">
            <div class="security-status" :class="{ active: user.email }">
              <el-icon><Message /></el-icon>
            </div>
            <div class="security-content">
              <div class="security-title">邮箱验证</div>
              <div class="security-desc">{{ user.email ? '已绑定邮箱' : '未绑定邮箱' }}</div>
            </div>
          </div>
        </div>

        <div class="danger-zone">
          <el-divider content-position="left">危险区域</el-divider>
          <el-button
              type="danger"
              @click="handleLogout"
              plain
              class="logout-button"
              icon="Delete"
          >
            注销账户
          </el-button>
          <p class="danger-tip">注意：此操作将永久删除您的账户，且不可恢复</p>
        </div>
      </el-card>
    </div>

    <!-- 编辑信息弹窗 -->
    <el-dialog
        v-model="displayInfoCard"
        title="编辑个人信息"
        width="500px"
        class="edit-dialog"
        :close-on-click-modal="false"
    >
      <el-form label-width="90px">
        <el-form-item label="用户名">
          <el-input v-model="user.username" disabled />
        </el-form-item>

        <el-form-item label="姓名" required>
          <el-input
              v-model="editableUser.name"
              placeholder="请输入您的姓名"
              clearable
          />
        </el-form-item>

        <el-form-item label="头像">
          <div class="avatar-uploader">
            <el-avatar
                :src="editableUser.avatar"
                :size="80"
                class="upload-avatar"
            />
            <div class="upload-controls">
              <label class="upload-btn">
                <input
                    type="file"
                    accept="image/*"
                    @change="onFileChange"
                    class="file-input"
                />
                <span>选择图片</span>
              </label>
              <p class="upload-tip">支持 JPG、PNG 格式，大小不超过 5MB</p>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="联系电话" required>
          <el-input
              v-model="editableUser.telephone"
              placeholder="请输入11位手机号"
              maxlength="11"
              clearable
          />
          <div class="input-tip">请输入以1开头的11位数字</div>
        </el-form-item>

        <el-form-item label="邮箱">
          <el-input
              v-model="editableUser.email"
              placeholder="请输入邮箱地址"
              clearable
          />
        </el-form-item>

        <el-form-item label="所在地">
          <el-input
              v-model="editableUser.location"
              placeholder="请输入所在地"
              clearable
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="toggleEditMode">取消</el-button>
          <el-button type="primary" @click="updateUserInfo">保存更改</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 修改密码弹窗 -->
    <el-dialog
        v-model="displayPasswordCard"
        title="修改密码"
        width="500px"
        class="password-dialog"
        :close-on-click-modal="false"
    >
      <el-form label-width="100px">
        <el-form-item label="新密码" :error="passwordErrors.newPassword" required>
          <el-input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="请输入6位以上新密码"
              show-password
              clearable
          />
        </el-form-item>

        <el-form-item label="确认密码" :error="passwordErrors.confirmPassword" required>
          <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              show-password
              clearable
          />
        </el-form-item>

        <div class="password-tips">
          <p><el-icon><Warning /></el-icon> 密码修改成功后需要重新登录</p>
          <p><el-icon><Lock /></el-icon> 建议使用字母、数字和符号的组合</p>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="togglePasswordEditMode">取消</el-button>
          <el-button type="primary" @click="updatePassword">确认修改</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.dashboard-container {
  padding: 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: calc(100vh - 60px);
}

/* 用户信息卡片 */
.user-profile-card {
  border-radius: 16px;
  margin-bottom: 24px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.user-profile-card :deep(.el-card__body) {
  padding: 0;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px;
  gap: 32px;
}

.avatar-container {
  display: flex;
  align-items: center;
  gap: 24px;
}

.avatar-wrapper {
  position: relative;
}

.profile-avatar {
  border: 4px solid rgba(255, 255, 255, 0.2);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-size: 36px;
  font-weight: bold;
}

.avatar-fallback {
  color: white;
}

.avatar-status {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  background: #52c41a;
  border: 2px solid white;
  border-radius: 50%;
}

.user-identity {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-name {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: white;
}

.user-handle {
  margin: 0;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
}

.role-tag {
  align-self: flex-start;
  font-weight: 500;
  border: none;
}

.welcome-section {
  text-align: right;
}

.welcome-header {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.welcome-title {
  margin: 0;
  font-size: 32px;
  font-weight: 600;
  color: white;
}

.home-button {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
  font-weight: 500;
}

.home-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: white;
}

.welcome-content {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.calendar-icon {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
}

.current-date {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
}

/* 内容网格布局 */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

/* 信息卡片样式 */
.info-section-card,
.security-section-card {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.info-section-card:hover,
.security-section-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.section-icon {
  color: #3b82f6;
  font-size: 20px;
}

/* 信息网格 */
.info-grid {
  display: grid;
  gap: 20px;
}

.info-item {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #6b7280;
  font-size: 14px;
}

.info-label .el-icon {
  font-size: 16px;
  color: #9ca3af;
}

.info-value {
  font-weight: 500;
  color: #1f2937;
  font-size: 15px;
}

/* 安全区域 */
.security-items {
  display: grid;
  gap: 20px;
  margin-bottom: 32px;
}

.security-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.security-item:hover {
  background: #f3f4f6;
}

.security-status {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #9ca3af;
  font-size: 20px;
}

.security-status.active {
  background: #dbeafe;
  color: #3b82f6;
}

.security-content {
  flex: 1;
}

.security-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.security-desc {
  font-size: 13px;
  color: #6b7280;
}

/* 危险区域 */
.danger-zone {
  margin-top: 32px;
}

.danger-zone :deep(.el-divider__text) {
  color: #ef4444;
  font-weight: 500;
  background: white;
}

.logout-button {
  width: 100%;
  margin-bottom: 12px;
}

.danger-tip {
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
  margin: 0;
}

/* 对话框样式 */
.edit-dialog,
.password-dialog {
  border-radius: 12px;
}

.avatar-uploader {
  display: flex;
  align-items: center;
  gap: 20px;
}

.upload-avatar {
  flex-shrink: 0;
  border: 2px dashed #dcdfe6;
}

.upload-controls {
  flex: 1;
}

.upload-btn {
  display: inline-block;
  padding: 8px 16px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.upload-btn:hover {
  background: #e5e7eb;
}

.file-input {
  display: none;
}

.upload-tip {
  margin: 8px 0 0;
  font-size: 12px;
  color: #9ca3af;
}

.input-tip {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

.password-tips {
  padding: 16px;
  background: #f0f9ff;
  border-radius: 8px;
  margin-top: 20px;
}

.password-tips p {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
  font-size: 13px;
  color: #0369a1;
}

.password-tips .el-icon {
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
    padding: 24px;
  }

  .avatar-container {
    flex-direction: column;
  }

  .user-identity {
    align-items: center;
  }

  .welcome-header {
    flex-direction: column;
    text-align: center;
  }

  .welcome-content {
    justify-content: center;
  }

  .info-item {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .content-grid {
    gap: 16px;
  }
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>