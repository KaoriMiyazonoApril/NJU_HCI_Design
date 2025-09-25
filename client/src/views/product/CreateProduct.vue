<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Back, UploadFilled } from "@element-plus/icons-vue"
import { createProduct } from "../../api/products"
import { uploadImage } from "../../api/tools"
import { ElMessage } from 'element-plus'
import type { Specification } from '../../api/products'

const router = useRouter()
// 商品分类列表（你可以从前端写死，也可以从接口获取）
const categories = [
  { label: '玄幻', value: '玄幻' },
  { label: '科幻', value: '科幻' },
  { label: '奇幻', value: '奇幻' },
  { label: '冒险', value: '冒险' },
  { label: '都市言情', value: '都市言情' },
  { label: '科普', value: '科普' },
  { label: '军事', value: '军事' },
  { label: '哲学', value: '哲学' },
  { label: '物理', value: '物理' },
  { label: '生物', value: '生物' },
  { label: '化学', value: '化学' },
  { label: '文学', value: '文学' },
  { label: '悬疑', value: '悬疑' },
  { label: '恐怖', value: '恐怖' },
  { label: '儿童', value: '儿童' },
]
// 表单数据
const formData = ref({
  title: '',
  price: 0,
  rate: 0,
  description: '',
  cover: '',
  detail: '',
  specifications: [] as Specification[],
  category: ''
})

// 当前规格输入
const currentSpec = ref({
  item: '',
  value: ''
})

// 图片上传相关
const imageFileList = ref<[]>([])
// 验证规则
const hasTitleInput = computed(() => formData.value.title.trim() !== '')
const hasPriceInput = computed(() => formData.value.price > 0)
const hasRateInput = computed(() => formData.value.rate >= 0 && formData.value.rate <= 5)
const hasCategorySelected = computed(() => formData.value.category !== '')

// 创建按钮禁用状态
const createDisabled = computed(() => {
  return !(hasTitleInput.value && hasPriceInput.value && hasRateInput.value&& hasCategorySelected.value)
})

// 添加规格
function addSpecification() {
  if (currentSpec.value.item && currentSpec.value.value) {
    formData.value.specifications.push({
      id: 0, // 默认值
      productId: 0, // 默认值
      item: currentSpec.value.item,
      value: currentSpec.value.value
    })
    currentSpec.value = { item: '', value: '' }
  }
}

// 移除规格
function removeSpecification(index: number) {
  formData.value.specifications.splice(index, 1)
}

// 图片上传处理
function handleChange(file: any, fileList: any) {
  imageFileList.value = fileList
  let lformData = new FormData()
  lformData.append('file', file.raw)
  uploadImage(lformData).then(res => {
    formData.value.cover = res.data.data
  })
}

function handleExceed() {
  ElMessage.warning('当前限制选择1个文件');
}

function uploadHttpRequest() {
  return new XMLHttpRequest()
}

// 提交创建商品
function handleCreateProduct() {
  const payload = {
    title: formData.value.title,
    price: Number(formData.value.price),
    rate: Number(formData.value.rate),
    description: formData.value.description || '',
    cover: formData.value.cover || '',
    detail: formData.value.detail || '',
    // 将 specifications 转换为后端期望的格式
    specifications: formData.value.specifications, // 直接传递数组
    category: formData.value.category, // 👈 发送商品分类
  }


  createProduct(payload).then(res => {
    if (res.data.code === "200") {
      ElMessage.success('创建商品成功')
      router.push('/Allproduct')
    } else {
      ElMessage.error(res.data.msg || '创建商品失败')
    }
  }).catch(err => {
    ElMessage.error('创建商品失败')
    console.error(err)
  })
}

function toBackPage() {
  router.push("/Allproduct")
}
</script>

<template>
  <el-main class="background">
  <el-main>
    <el-button @click="toBackPage()" type="primary" circle plain>
      <el-icon><Back /></el-icon>
    </el-button>

    <h1 class="create-product-title">新建商品</h1>

    <el-form label-position="left" label-width="90px" size="large" class="create-product-form">
      <!-- 基本信息 -->
      <el-form-item label="商品名称" required>
        <el-input v-model="formData.title" placeholder="请输入商品名称" />
      </el-form-item>

      <el-form-item label="商品价格" required>
        <el-input-number
            v-model="formData.price"
            :min="0"
            :precision="2"
            :step="100"
            placeholder="请输入商品价格"
        />
      </el-form-item>

      <el-form-item label="商品评分" required>
        <el-input-number
            v-model="formData.rate"
            :min="0"
            :max="5"
            :step="0.1"
            :precision="1"
            placeholder="0-5分"
        />
      </el-form-item>

      <el-form-item label="商品描述">
        <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入商品描述"
        />
      </el-form-item>

      <el-form-item label="商品详情">
        <el-input
            v-model="formData.detail"
            type="textarea"
            :rows="5"
            placeholder="请输入商品详细说明"
        />
      </el-form-item>

      <el-form-item label="商品分类" required>
        <el-select v-model="formData.category" placeholder="请选择分类">
          <el-option
              v-for="cat in categories"
              :key="cat.value"
              :label="cat.label"
              :value="cat.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="商品照片">
        <el-upload v-model:file-list="imageFileList" :on-change="handleChange" :on-remove="handleChange"
                   class="upload-demo" list-type="picture" :http-request="uploadHttpRequest" drag>
          <el-icon class="el-icon--upload">
            <upload-filled />
          </el-icon>
          <div class="el-upload__text">
            将文件拖到此处或单击此处上传。
          </div>
        </el-upload>
      </el-form-item>

      <!-- 规格参数 -->
      <el-form-item label="规格参数">
        <div class="spec-form">
          <el-input v-model="currentSpec.item" placeholder="参数名" style="width: 200px" />
          <el-input v-model="currentSpec.value" placeholder="参数值" style="width: 200px; margin-left: 10px" />
          <el-button type="primary" @click="addSpecification" style="margin-left: 10px">添加</el-button>
        </div>

        <el-table :data="formData.specifications" border style="margin-top: 10px">
          <el-table-column prop="item" label="参数名" width="150" />
          <el-table-column prop="value" label="参数值" />
          <el-table-column label="操作" width="60">
            <template #default="scope">
              <el-button type="danger" size="small" @click="removeSpecification(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item>
        <el-button
            type="primary"
            plain
            @click="handleCreateProduct"
            :disabled="createDisabled"
        >
          创建商品
        </el-button>
      </el-form-item>
    </el-form>
  </el-main>
  </el-main>
</template>

<style scoped>
.create-product-title {
  margin-left: 25%;
  margin-bottom: 30px;
}

.create-product-form {
  margin-left: 25%;
  width: 50%;
}

.spec-form {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.el-upload__tip {
  font-size: 12px;
  color: #888;
  margin-top: 5px;
}

.background {
  position: relative;
  background-image: url("../../assets/book1.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 30px;
  min-height: 100vh;
}

</style>
