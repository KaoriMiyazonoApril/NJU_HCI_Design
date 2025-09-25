<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAllAdvertisements, deleteAdvertisement } from '../../api/advertisements';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Back } from "@element-plus/icons-vue"
const router = useRouter();
const advertisements = ref<any[]>([]);

// 获取广告列表
const fetchAdvertisements = async () => {
  try {
    const res = await getAllAdvertisements();
    advertisements.value = res.data.data;
  } catch (err) {
    ElMessage.error('获取广告列表失败');
    console.error(err);
  }
};

onMounted(() => {
  fetchAdvertisements();
});

// 跳转到创建广告页面
const toCreateAdvertisementPage = () => {
  router.push('/createadvertisement');
};

// 编辑广告
const editAdvertisement = (ad: any) => {
  if (ad.id) {
    router.push(`/editadvertisement/${ad.id}`); // 使用路径参数
  } else {
    ElMessage.warning('该广告缺少ID');
  }
};

// 删除广告
const deleteAdvertisementById = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除该广告吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await deleteAdvertisement(id);
    ElMessage.success('删除成功');
    fetchAdvertisements(); // 刷新广告列表
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('删除失败');
      console.error(err);
    }
  }
};
function toBackPage() {
  router.push("/Allproduct")
}
</script>

<template>
  <el-main class="background">
    <el-button @click="toBackPage()" type="primary" circle plain>
      <el-icon><Back /></el-icon>
    </el-button>
  <div class="advertisement-container">
    <h1>广告管理</h1>

    <!-- 创建广告按钮 -->
    <el-button type="primary" @click="toCreateAdvertisementPage" class="create-button">创建广告</el-button>

    <!-- 广告表格 -->
    <el-table :data="advertisements" style="width: 100%; margin-top: 20px" border stripe>
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="title" label="标题" width="200" align="center" />
      <el-table-column prop="content" label="内容" align="center" />
      <el-table-column prop="imgUrl" label="图片预览" width="300" align="center">
        <template #default="scope">
          <img :src="scope.row.imgUrl" alt="广告图片" class="ad-image" />
        </template>
      </el-table-column>
      <el-table-column prop="productId" label="商品ID" width="100" align="center" />
      <el-table-column label="操作" width="200" align="center">
        <template #default="scope">
          <el-button type="primary" size="small" @click="editAdvertisement(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="deleteAdvertisementById(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
    </el-main>
</template>

<style scoped>
.background {
  position: relative;
  background-image: url("../../assets/book1.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 30px;
  min-height: 100vh;
}
.advertisement-container {
  padding: 20px;
}

.create-button {
  margin-bottom: 20px;
}

.ad-image {
  width: 100px;
  height: 50px;
  object-fit: cover;
}
</style>
