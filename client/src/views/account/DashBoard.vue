<script setup lang="ts">
import {ref} from 'vue'
import {parseRole} from "../../utils"
import {userInfo, userInfoUpdate, type UpdateInfo, deleteUser} from "../../api/accounts.ts"
import { ElMessageBox, ElMessage } from 'element-plus'
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





function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    editableUser.value.avatar = URL.createObjectURL(file); // 生成临时图片 URL
  }
}
// 编辑模式下的临时数据
const editableUser = ref({ ...user.value });

// 是否显示编辑卡片
const displayInfoCard = ref(false);
// 是否显示密码修改表单
const displayPasswordCard = ref(false);

// 密码修改表单数据
const passwordForm = ref({
  newPassword: '',
  confirmPassword: '',
});

// 表单校验错误信息
const passwordErrors = ref({
  newPassword: '',
  confirmPassword: '',
});

// 校验电话号码格式
const validateTelephone = (telephone: string): boolean => {
  const telephoneRegex = /^1\d{10}$/; // 以 1 开头的 11 位数字
  return telephoneRegex.test(telephone);
};

// 切换编辑模式
const toggleEditMode = () => {
  if (displayInfoCard.value) {
    // 取消编辑时还原原始数据
    Object.assign(editableUser.value, user.value);
  }
  displayInfoCard.value = !displayInfoCard.value;
};

getUserInfo()

function getUserInfo() {
  const username = sessionStorage.getItem("username"); // 从 session storage 中获取用户名
  if (!username) {
    console.error("Username not found in session storage.");
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
        editableUser.value = { ...user.value }; // 初始化编辑模式的数据
      })
      .catch(error => {
        console.error("Error fetching user info:", error.response?.data || error.message);
        ElMessage.error("获取用户信息失败，请稍后再试！");
      });
}

// 更新用户数据
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
    const token = sessionStorage.getItem("token"); // 从 session storage 中获取 token
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

    // 添加 username 参数
    const username = user.value.username;

    // 调用后端 API 更新用户信息
    const response = await userInfoUpdate(updateData, username, { headers: { token } });

    if (response.data.code === '200') {
      Object.assign(user.value, editableUser.value); // 更新主数据
      displayInfoCard.value = false; // 关闭编辑模式
      ElMessage.success(response.data.data || '更新成功');
    } else {
      ElMessage.error(response.data.msg || '用户信息更新失败');
    }
  } catch (error: any) {
    console.error('用户信息更新失败', error);
    if (error.response) {
      console.error('响应数据:', error.response.data);
      console.error('请求配置:', error.response.config);
      ElMessage.error(error.response.data.msg || '用户信息更新失败');
    } else {
      ElMessage.error('网络错误，请稍后再试');
    }
  }
};

// 切换密码修改表单显示状态
const togglePasswordEditMode = () => {
  if (displayPasswordCard.value) {
    // 取消编辑时清空表单数据和错误信息
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
// 校验密码表单
const validatePasswordForm = (): boolean => {
  let isValid = true;
  // 清空之前的错误信息
  Object.assign(passwordErrors.value, {
    newPassword: '',
    confirmPassword: '',
  });

  // 校验新密码
  if (!passwordForm.value.newPassword) {
    passwordErrors.value.newPassword = '请输入新密码';
    isValid = false;
  } else if (passwordForm.value.newPassword.length < 6) {
    passwordErrors.value.newPassword = '密码长度不能小于6位';
    isValid = false;
  }

  // 校验确认密码
  if (!passwordForm.value.confirmPassword) {
    passwordErrors.value.confirmPassword = '请确认新密码';
    isValid = false;
  } else if (passwordForm.value.confirmPassword !== passwordForm.value.newPassword) {
    passwordErrors.value.confirmPassword = '两次输入的密码不一致';
    isValid = false;
  }

  return isValid;
};
// 修改密码
const updatePassword = async () => {
  if (!validatePasswordForm()) {
    return;
  }

  try {
    const token = sessionStorage.getItem("token"); // 从 session storage 中获取 token
    if (!token) {
      ElMessage.error("登录已过期，请重新登录！");
      return;
    }
    const updateData: UpdateInfo = {

      password: passwordForm.value.newPassword,
    };

    // 添加 username 参数
    const username = user.value.username;
    // 调用后端 API 更新用户信息
    const response = await userInfoUpdate(updateData, username, { headers: { token } });

    if (response.data.code === '200') {
      ElMessage.success('密码修改成功，请重新登录');
      togglePasswordEditMode(); // 关闭表单
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
    type: 'warning'
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
        // 清除 session 数据
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
</script>

<template>
  <el-main class="main-container">
    <el-card class="aside-card">
      <div class="avatar-area">
        <el-avatar :src="typeof user.avatar === 'string' ? user.avatar : undefined" :size="80">
        </el-avatar>
        <span class="avatar-text"> 欢迎您，{{ user.username }}</span>
      </div>

      <el-divider></el-divider>
      <!--      个人信息展示-->
      <el-descriptions :column="1" border title="个人信息">
        <template #extra>
          <el-button type="primary" @click="toggleEditMode">
            {{ displayInfoCard ? '取消编辑' : '编辑个人信息' }}
          </el-button>
        </template>

        <el-descriptions-item label="用户名">
          {{ user.username }}
        </el-descriptions-item>

        <el-descriptions-item label="身份">
          <el-tag>{{ parseRole(user.role) }}</el-tag>
        </el-descriptions-item>

        <el-descriptions-item label="联系电话">
          {{ user.telephone }}
        </el-descriptions-item>

        <el-descriptions-item label="邮箱">
          {{ user.email }}
        </el-descriptions-item>

        <el-descriptions-item label="地址">
          {{ user.location }}
        </el-descriptions-item>

      </el-descriptions>

      <el-divider></el-divider>
      <el-descriptions :column="1" border title="账户安全">
        <template #extra>
          <el-button type="primary" @click="togglePasswordEditMode">
            {{ displayPasswordCard ? '取消修改' : '修改密码' }}
          </el-button>
        </template>
      </el-descriptions>
      <el-divider />

      <div class="logout-container">
        <el-button type="danger" @click="handleLogout">注销账户</el-button>
      </div>
    </el-card>

    <el-card v-if="displayInfoCard" class="change-card">
      <template #header>
        <div class="card-header">
          <span>编辑个人信息</span>
          <el-button @click="updateUserInfo">更新</el-button>
        </div>
      </template>

      <el-form>

        <el-form-item label="用户名">
          {{ user.username }}
        </el-form-item>

        <el-form-item label="姓名">
          <el-input v-model="editableUser.name" placeholder="请输入您的姓名" />
        </el-form-item>

        <el-form-item label="头像">
          <input type="file" accept="image/*" @change="onFileChange" />
        </el-form-item>

        <el-form-item label="联系电话">
          <el-input v-model="editableUser.telephone" placeholder="请输入11位手机号" />
        </el-form-item>

        <el-form-item label="邮箱">
          <el-input v-model="editableUser.email" placeholder="请输入邮箱地址" />
        </el-form-item>

        <el-form-item label="所在地">
          <el-input v-model="editableUser.location" placeholder="请输入所在地" />
        </el-form-item>

      </el-form>
    </el-card>

    <el-card v-if="displayPasswordCard" class="change-password-card">
      <template #header>
        <div class="card-header">
          <span>修改密码</span>
          <el-button type="primary" @click="updatePassword">保存</el-button>
        </div>
      </template>

      <el-form>

        <el-form-item label="新密码" :error="passwordErrors.newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" />
        </el-form-item>

        <el-form-item label="确认新密码" :error="passwordErrors.confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" />
        </el-form-item>
      </el-form>
    </el-card>
  </el-main>

</template>

<style scoped>
.main-container {
  display: flex;
  flex-direction: row;
  padding: 15px;
  gap: 5px;
  justify-content: center;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.change-card {
  width: 66%;
}

.change-password-card {
  width: 66%;
}

.avatar-area {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 30px;
}

.avatar-text {
  font-size: x-large;
  font-weight: bolder;
  padding-right: 40px;
}
.logout-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
.avatar-upload-area {
  display: flex;
  align-items: center;
  gap: 20px;
}

.upload-label {
  cursor: pointer;
}
</style>
