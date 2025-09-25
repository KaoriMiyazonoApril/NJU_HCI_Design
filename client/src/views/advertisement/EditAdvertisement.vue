<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getAllAdvertisements, updateAdvertisement } from "../../api/advertisements";
import { getAllProducts, type Product } from "../../api/products";
import { ElMessage } from "element-plus";
import { uploadImage } from '../../api/tools';
import { UploadFilled } from "@element-plus/icons-vue";
import { Back } from "@element-plus/icons-vue"
const route = useRoute();
const router = useRouter();

// 表单数据 - 明确指定类型
const form = reactive({
  id: "",
  title: "",
  content: "",
  productId: null as number | null,
  cover: "",
});

// 商品列表
const products = ref<Product[]>([]); // 使用 Product[] 替代 any[]
// 图片文件列表
const imageFileList = ref<any[]>([]);
// 加载状态
const loading = ref(false);

// 获取广告 ID - 添加更严格的验证
const getAdvertisementId = (): string | null => {
  const id = route.params.id;

  if (typeof id === "string" && id.trim() !== "") {
    return id;
  }

  if (Array.isArray(id) && id.length > 0 && typeof id[0] === "string" && id[0].trim() !== "") {
    return id[0];
  }

  return null;
};

// 加载广告数据 - 添加错误处理
const fetchAdvertisement = async (id: string) => {
  try {
    loading.value = true;
    const res = await getAllAdvertisements();

    if (!res?.data?.data || !Array.isArray(res.data.data)) {
      throw new Error("广告数据格式错误");
    }

    const targetAd = res.data.data.find((ad: any) => ad.id === id);
    if (!targetAd) {
      throw new Error("未找到广告");
    }

    // 确保 productId 是数字类型
    Object.assign(form, {
      ...targetAd,
      productId: targetAd.productId ? Number(targetAd.productId) : null,
    });

    // 初始化图片文件列表
    if (targetAd.cover) {
      console.log("广告封面:", targetAd.cover); // 调试用
      const baseUrl = "https://your-domain.com"; // 如果是相对路径，补全为完整路径
      const fullUrl = targetAd.cover.startsWith("http") ? targetAd.cover : `${baseUrl}${targetAd.cover}`;
      imageFileList.value = [
        {
          name: "广告图片", // 固定名称或从后端获取
          url: fullUrl,
          uid: Date.now(), // 手动设置一个唯一标识符
        },
      ];
    } else {
      imageFileList.value = []; // 清空文件列表
    }
  } catch (err) {
    console.error("加载广告失败:", err);
    ElMessage.error("加载广告失败");
    router.push("/alladvertisements");
  } finally {
    loading.value = false;
  }
};

// 获取商品列表 - 添加类型转换
const fetchProducts = async () => {
  try {
    loading.value = true;
    const response = await getAllProducts();

    if (response?.data?.data && Array.isArray(response.data.data)) {
      // 确保商品ID是数字类型，并将数据转换为 Product[]
      products.value = response.data.data.map((product: any) => ({
        id: Number(product.id), // 确保 id 是数字类型
        title: String(product.title), // 确保 title 是字符串类型
      }));
    } else {
      throw new Error("商品数据格式错误");
    }
  } catch (err) {
    console.error("获取商品列表失败:", err);
    ElMessage.error("获取商品列表失败");
  } finally {
    loading.value = false;
  }
};

// 提交更新 - 增强数据验证
const submitUpdate = async () => {
  try {
    if (!form.productId) {
      ElMessage.error("请选择关联的商品");
      return;
    }

    if (!form.title || !form.content) {
      ElMessage.error("请填写标题和内容");
      return;
    }

    loading.value = true;

    // 准备更新数据，确保类型正确
    const updateData = {
      id: form.id,
      title: form.title,
      content: form.content,
      productId: form.productId, // 确保是数字
      imgUrl: form.cover,
    };

    console.log("提交的更新数据:", updateData); // 调试用

    const response = await updateAdvertisement(updateData);

    // 检查响应是否成功
    if (!response || !response.data) {
      throw new Error("更新失败: 无响应数据");
    }

    ElMessage.success("广告更新成功");
    router.push("/alladvertisements");
  } catch (err: any) {
    console.error("更新广告失败:", err);
    const errorMsg = err.response?.data?.message || err.message || "广告更新失败";
    ElMessage.error(errorMsg);
  } finally {
    loading.value = false;
  }
};

// 图片上传处理
const handleChange = (file: any, fileList: any) => {
  imageFileList.value = fileList;

  if (file.status === 'ready') {
    const formData = new FormData();
    formData.append("file", file.raw);

    uploadImage(formData)
        .then((res) => {
          if (res.data?.data) {
            form.cover = res.data.data;
            ElMessage.success("图片上传成功");
          } else {
            throw new Error("无效的图片URL");
          }
        })
        .catch((err) => {
          console.error("图片上传失败:", err);
          ElMessage.error("图片上传失败");
          imageFileList.value = [];
        });
  }
};

// 文件超出限制时的回调
const handleExceed = () => {
  ElMessage.warning("当前限制选择1个文件");
};

// 文件移除时的回调
const handleRemove = () => {
  imageFileList.value = [];
  form.cover = "";
};

onMounted(() => {
  const advertisementId = getAdvertisementId();
  if (!advertisementId) {
    ElMessage.error("无效的广告ID");
    router.push("/alladvertisements");
  } else {
    fetchAdvertisement(advertisementId);
    fetchProducts();
  }
});
function toBackPage() {
  router.push("/AllAdvertisements")
}
</script>

<template>
  <el-main class="background">
  <el-button @click="toBackPage()" type="primary" circle plain>
    <el-icon><Back /></el-icon>
  </el-button>
  <div class="edit-advertisement-container">
    <h1>编辑广告</h1>
    <el-form
        :model="form"
        label-width="100px"
        style="max-width: 600px"
        class="form-container"
        :disabled="loading"
    >
      <!-- 标题 -->
      <el-form-item label="标题" prop="title" required>
        <el-input v-model="form.title" placeholder="请输入广告标题" clearable />
      </el-form-item>

      <!-- 内容 -->
      <el-form-item label="内容" prop="content" required>
        <el-input
            v-model="form.content"
            type="textarea"
            placeholder="请输入广告内容"
            :rows="4"
            clearable
        />
      </el-form-item>

      <!-- 图片上传 -->
      <el-form-item label="广告图片" prop="cover" required>
        <el-upload
            v-model:file-list="imageFileList"
            :on-change="handleChange"
            :on-remove="handleRemove"
            :on-exceed="handleExceed"
            class="upload-demo"
            list-type="picture"
            drag
            :limit="1"
            :auto-upload="false"
            accept="image/*"
        >
          <el-icon class="el-icon--upload">
            <UploadFilled />
          </el-icon>
          <div class="el-upload__text">
            将文件拖到此处或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              请上传JPG/PNG格式图片，大小不超过5MB
            </div>
          </template>
        </el-upload>
      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button
            type="primary"
            @click="submitUpdate"
            :loading="loading"
        >
          {{ loading ? '保存中...' : '保存更改' }}
        </el-button>
        <el-button @click="router.push('/alladvertisements')">
          取消
        </el-button>
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

.edit-advertisement-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.form-container {
  margin-top: 20px;
}

.upload-demo {
  width: 100%;
  text-align: center;
}

.el-upload__text {
  font-size: 14px;
  color: #606266;
  margin: 10px 0;
}

.el-upload__tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

h1 {
  color: #303133;
  margin-bottom: 20px;
  text-align: center;
}
</style>
