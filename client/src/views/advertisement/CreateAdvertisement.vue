<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { createAdvertisement } from '../../api/advertisements';
import { uploadImage } from '../../api/tools';
import { getAllProducts } from '../../api/products'; // 获取商品列表的API
import { ElMessage } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import { Back } from "@element-plus/icons-vue"
const router = useRouter();

// 表单数据
const form = reactive({
  title: '',
  content: '',
  productId: null as number | null, // 修改为null类型以适应下拉框未选择的情况
  cover: '', // 存储图片 URL
});

// 商品列表
const products = ref<any[]>([]); // 存储商品列表

// 图片上传相关
const imageFileList = ref<[]>([]);

// 获取所有商品列表
onMounted(async () => {
  try {
    const response = await getAllProducts();
    console.log('API 返回值:', response); // 打印完整响应
    if (response && response.data.data) {
      products.value = response.data.data;
      console.log('商品列表:', products.value); // 打印商品列表
    } else {
      console.error('获取商品列表失败：返回数据为空');
      ElMessage.error('获取商品列表失败：返回数据为空');
    }
  } catch (err) {
    console.error('获取商品列表失败:', err);
    ElMessage.error('获取商品列表失败');
  }
});

// 图片上传处理
function handleChange(file: any, fileList: any) {
  imageFileList.value = fileList;

  const formData = new FormData();
  formData.append('file', file.raw);

  uploadImage(formData)
      .then(res => {
        form.cover = res.data.data; // 将返回的图片 URL 存储到 form.cover
        ElMessage.success('图片上传成功');
      })
      .catch(err => {
        ElMessage.error('图片上传失败');
        console.error(err);
      });
}

function handleExceed() {
  ElMessage.warning('当前限制选择1个文件');
}

function uploadHttpRequest() {
  return new XMLHttpRequest();
}

// 提交表单
const submitForm = async () => {
  if (!form.productId) {
    ElMessage.error('请选择关联的商品');
    return;
  }

  try {
    await createAdvertisement({ ...form, imgUrl: form.cover }); // 使用 cover 替代 imgUrl
    ElMessage.success('创建成功');
    router.push('/alladvertisements'); // 返回广告列表页面
  } catch (err) {
    ElMessage.error('创建失败');
    console.error(err);
  }
};
function toBackPage() {
  router.push("/AllAdvertisements")
}
</script>

<template>
  <el-main class="background">
    <el-button @click="toBackPage()" type="primary" circle plain>
      <el-icon><Back /></el-icon>
    </el-button>
  <div class="create-advertisement-container">
    <h1>创建广告</h1>
    <el-form :model="form" label-width="100px" style="max-width: 600px" class="form-container">
      <!-- 标题 -->
      <el-form-item label="标题" required>
        <el-input v-model="form.title" placeholder="请输入广告标题" />
      </el-form-item>

      <!-- 内容 -->
      <el-form-item label="内容" required>
        <el-input v-model="form.content" type="textarea" placeholder="请输入广告内容" />
      </el-form-item>

      <!-- 商品选择 -->
      <el-form-item label="关联商品" required>
        <el-select v-model="form.productId" placeholder="请选择商品">
          <el-option
              v-for="product in products"
              :key="product.id"
              :label="product.title"
          :value="product.id"
          v-if="products && products.length > 0"
          />
          <el-option
              v-else
              label="暂无商品"
              value=""
              disabled
          />
        </el-select>
      </el-form-item>

      <!-- 图片上传 -->
      <el-form-item label="图片链接" required>
        <el-upload
            v-model:file-list="imageFileList"
            :on-change="handleChange"
            :on-remove="handleChange"
            :on-exceed="handleExceed"
            :http-request="uploadHttpRequest"
            class="upload-demo"
            list-type="picture"
            drag
            :limit="1"
        >
          <el-icon class="el-icon--upload">
            <UploadFilled />
          </el-icon>
          <div class="el-upload__text">
            将文件拖到此处或单击此处上传。
          </div>
        </el-upload>
      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button type="primary" @click="submitForm">提交</el-button>
      </el-form-item>
    </el-form>
  </div>
    </el-main>
</template>

<style scoped>

.background {
  display: flex; /* 使用 Flexbox */
  justify-content: center; /* 水平居中 */

  position: relative;
  background-image: url("../../assets/book1.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 30px;
  min-height: 100vh;
}

.create-advertisement-container {
  padding: 20px;
}

.form-container {
  margin-top: 20px;
}

.upload-demo {
  width: 100%;
  text-align: center;
}

.el-upload__text {
  font-size: 12px;
  color: #888;
  margin-top: 5px;
}
</style>
