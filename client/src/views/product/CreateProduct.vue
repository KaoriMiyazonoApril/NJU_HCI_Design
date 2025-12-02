<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Back, UploadFilled, Right, DocumentCopy, PictureFilled, SuccessFilled } from "@element-plus/icons-vue"
import { createProduct, updateProductAmount } from "../../api/products"
import { uploadImage } from "../../api/tools"
import { ElMessage } from 'element-plus'
import type { Specification } from '../../api/products'

// ============ 页面状态 ============
const router = useRouter()
const isSubmitting = ref(false)
const currentStep = ref(1)

// ============ 分类列表 ============
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

// ============ 表单数据 ============
const formData = ref({
  title: '',
  price: 0,
  rate: 3,
  description: '',
  cover: '',
  detail: '',
  specifications: [] as Specification[],
  category: '',
  stockAmount: 0
})

const currentSpec = ref({
  item: '',
  value: ''
})

const imageFileList = ref<[]>([])

// ============ 表单验证 ============
const hasTitleInput = computed(() => formData.value.title.trim().length > 0)
const hasPriceInput = computed(() => formData.value.price > 0)
const hasRateInput = computed(() => formData.value.rate >= 0 && formData.value.rate <= 5)
const hasCategorySelected = computed(() => formData.value.category !== '')
const hasCoverImage = computed(() => formData.value.cover !== '')

const step1Valid = computed(() => 
  hasTitleInput.value && hasPriceInput.value && hasRateInput.value && hasCategorySelected.value
)

const step2Valid = computed(() => 
  hasCoverImage.value
)

const canSubmit = computed(() => 
  step1Valid.value && step2Valid.value
)

// ============ 规格处理 ============
const addSpecification = () => {
  if (!currentSpec.value.item.trim()) {
    ElMessage.warning('请输入参数名')
    return
  }
  if (!currentSpec.value.value.trim()) {
    ElMessage.warning('请输入参数值')
    return
  }
  
  formData.value.specifications.push({
    id: 0,
    productId: 0,
    item: currentSpec.value.item.trim(),
    value: currentSpec.value.value.trim()
  })
  currentSpec.value = { item: '', value: '' }
  ElMessage.success('规格已添加')
}

const removeSpecification = (index: number) => {
  formData.value.specifications.splice(index, 1)
  ElMessage.success('规格已移除')
}

// ============ 图片上传 ============
const handleChange = (file: any, fileList: any) => {
  imageFileList.value = fileList
  let lformData = new FormData()
  lformData.append('file', file.raw)
  
  ElMessage.loading({ message: '上传中...', duration: 0 })
  
  uploadImage(lformData)
    .then(res => {
      formData.value.cover = res.data.data
      ElMessage.success('图片上传成功')
    })
    .catch(err => {
      ElMessage.error('图片上传失败')
      console.error(err)
    })
}

const handleExceed = () => {
  ElMessage.warning('仅支持上传1张图片')
}

const uploadHttpRequest = () => {
  return new XMLHttpRequest()
}

// ============ 提交表单 ============
const handleCreateProduct = () => {
  if (!canSubmit.value) {
    ElMessage.warning('请完善所有信息后提交')
    return
  }

  isSubmitting.value = true
  
  const payload = {
    title: formData.value.title.trim(),
    price: Number(formData.value.price),
    rate: Number(formData.value.rate),
    description: formData.value.description.trim() || '',
    cover: formData.value.cover,
    detail: formData.value.detail.trim() || '',
    specifications: formData.value.specifications,
    category: formData.value.category,
  }

  createProduct(payload)
    .then(async (res) => {
      if (res.data.code === "200") {
        const productId = res.data.data.id
        // 如果设置了库存，更新库存
        if (formData.value.stockAmount > 0) {
          await updateProductAmount(productId, { amount: formData.value.stockAmount })
        }
        ElMessage.success({
          message: '商品创建成功！',
          duration: 1.5,
          onClose: () => router.push('/allproduct')
        })
      } else {
        ElMessage.error(res.data.msg || '创建商品失败')
      }
    })
    .catch(err => {
      ElMessage.error('创建商品失败，请检查网络连接')
      console.error(err)
    })
    .finally(() => {
      isSubmitting.value = false
    })
}

// ============ 导航 ============
const toBackPage = () => {
  router.back()
}

const nextStep = () => {
  if (!step1Valid.value) {
    ElMessage.warning('请完善基本信息后继续')
    return
  }
  currentStep.value = 2
}

const prevStep = () => {
  currentStep.value = 1
}
</script>

<template>
  <el-main class="create-product-main">
    <!-- 头部导航 -->
    <div class="create-header">
      <el-button type="primary" link @click="toBackPage()">
        <el-icon><Back /></el-icon>
        返回
      </el-button>
      <h1 class="create-title">创建新商品</h1>
      <div style="width: 80px;"></div>
    </div>

    <!-- 步骤条 -->
    <div class="steps-container">
      <el-steps :active="currentStep - 1" align-center finish-status="success">
        <el-step title="基本信息" icon="DocumentCopy" />
        <el-step title="详细信息" icon="PictureFilled" />
        <el-step title="确认提交" icon="SuccessFilled" />
      </el-steps>
    </div>

    <!-- 第一步：基本信息 -->
    <el-card v-if="currentStep === 1" class="form-card">
      <template #header>
        <div class="card-header">
          <span class="step-label">第一步</span>
          <span class="card-title">商品基本信息</span>
        </div>
      </template>

      <el-form label-position="top" size="large" class="product-form">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="24" :md="12">
            <el-form-item label="商品名称" required>
              <el-input
                v-model="formData.title"
                placeholder="输入商品名称（必填）"
                maxlength="50"
                show-word-limit
                clearable
              />
              <span class="field-help">商品名称是用户搜索的重要依据</span>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="24" :md="12">
            <el-form-item label="商品分类" required>
              <el-select
                v-model="formData.category"
                placeholder="选择商品分类"
                clearable
                class="full-width"
              >
                <el-option
                  v-for="cat in categories"
                  :key="cat.value"
                  :label="cat.label"
                  :value="cat.value"
                />
              </el-select>
              <span class="field-help">分类有助于用户快速定位商品</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="商品价格" required>
              <el-input-number
                v-model="formData.price"
                :min="0"
                :precision="2"
                :step="10"
                placeholder="请输入价格"
                class="full-width"
              />
              <span class="field-help">单位：元</span>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="商品评分" required>
              <el-rate
                v-model="formData.rate"
                :colors="['#f78c6b', '#f7c664', '#67c23a']"
                allow-half
              />
              <span class="field-help">{{ formData.rate }} 分</span>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :md="8">
            <el-form-item label="库存数量">
              <el-input-number
                v-model="formData.stockAmount"
                :min="0"
                :max="9999"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="商品描述">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="输入商品简短描述（限制100字）"
            maxlength="100"
            show-word-limit
          />
          <span class="field-help">简洁的描述能提高转化率</span>
        </el-form-item>

        <!-- 导航按钮 -->
        <div class="form-actions">
          <el-button @click="toBackPage">取消</el-button>
          <el-button type="primary" @click="nextStep">
            下一步
            <el-icon class="el-icon--right"><Right /></el-icon>
          </el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 第二步：详细信息 -->
    <el-card v-if="currentStep === 2" class="form-card">
      <template #header>
        <div class="card-header">
          <span class="step-label">第二步</span>
          <span class="card-title">详细信息与图片</span>
        </div>
      </template>

      <el-form label-position="top" size="large" class="product-form">
        <el-row :gutter="30">
          <!-- 左侧：图片上传 -->
          <el-col :xs="24" :md="12">
            <el-form-item label="商品图片" required>
              <div class="upload-area">
                <el-upload
                  v-model:file-list="imageFileList"
                  :on-change="handleChange"
                  :on-remove="handleChange"
                  list-type="picture-card"
                  :http-request="uploadHttpRequest"
                  :limit="1"
                  @exceed="handleExceed"
                  drag
                >
                  <template #default>
                    <div class="upload-icon">
                      <el-icon><UploadFilled /></el-icon>
                      <span>拖拽或点击上传</span>
                      <span class="upload-tip">支持 JPG、PNG 格式，单张不超过 5MB</span>
                    </div>
                  </template>
                  <template #file="{ file }">
                    <div class="upload-preview">
                      <img :src="file.url" />
                    </div>
                  </template>
                </el-upload>
              </div>
              <div v-if="formData.cover" class="image-uploaded">
                <el-icon style="color: #67c23a; margin-right: 8px"><SuccessFilled /></el-icon>
                图片已上传
              </div>
            </el-form-item>
          </el-col>

          <!-- 右侧：商品详情 + 规格参数 -->
          <el-col :xs="24" :md="12">
            <el-form-item label="商品详情" required>
              <el-input
                v-model="formData.detail"
                type="textarea"
                :rows="6"
                placeholder="输入详细的商品说明（如规格、成分、使用方法等）"
                maxlength="500"
                show-word-limit
              />
              <span class="field-help">详细信息帮助用户做出购买决策</span>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 规格参数（全宽） -->
        <el-divider>规格参数（可选）</el-divider>

        <div class="spec-input-area">
          <el-row :gutter="12">
            <el-col :xs="24" :sm="8">
              <el-input
                v-model="currentSpec.item"
                placeholder="参数名（如：尺寸、颜色）"
                clearable
              />
            </el-col>
            <el-col :xs="24" :sm="8">
              <el-input
                v-model="currentSpec.value"
                placeholder="参数值"
                @keyup.enter="addSpecification"
                clearable
              />
            </el-col>
            <el-col :xs="24" :sm="8">
              <el-button type="primary" @click="addSpecification" class="full-width">
                添加规格
              </el-button>
            </el-col>
          </el-row>
        </div>

        <el-table
          v-if="formData.specifications.length > 0"
          :data="formData.specifications"
          stripe
          class="spec-table"
        >
          <el-table-column prop="item" label="参数名" width="120" />
          <el-table-column prop="value" label="参数值" />
          <el-table-column label="操作" width="80" align="center">
            <template #default="scope">
              <el-button
                type="danger"
                size="small"
                link
                @click="removeSpecification(scope.$index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 导航按钮 -->
        <div class="form-actions">
          <el-button @click="prevStep">上一步</el-button>
          <el-button type="primary" @click="currentStep = 3" :disabled="!step2Valid">
            下一步
            <el-icon class="el-icon--right"><Right /></el-icon>
          </el-button>
        </div>
      </el-form>
    </el-card>

    <!-- 第三步：确认提交 -->
    <el-card v-if="currentStep === 3" class="form-card">
      <template #header>
        <div class="card-header">
          <span class="step-label">第三步</span>
          <span class="card-title">确认商品信息</span>
        </div>
      </template>

      <div class="preview-container">
        <el-row :gutter="30">
          <el-col :xs="24" :md="12">
            <div class="preview-image">
              <img v-if="formData.cover" :src="formData.cover" alt="商品图片" />
              <div v-else class="no-image">暂无图片</div>
            </div>
          </el-col>

          <el-col :xs="24" :md="12">
            <div class="preview-info">
              <div class="info-item">
                <span class="label">商品名称</span>
                <span class="value">{{ formData.title }}</span>
              </div>

              <div class="info-item">
                <span class="label">商品分类</span>
                <span class="value">{{ formData.category }}</span>
              </div>

              <div class="info-item">
                <span class="label">商品价格</span>
                <span class="value price">¥{{ formData.price.toFixed(2) }}</span>
              </div>

              <div class="info-item">
                <span class="label">商品评分</span>
                <span class="value">
                  <el-rate
                    v-model="formData.rate"
                    disabled
                    :colors="['#f78c6b', '#f7c664', '#67c23a']"
                  />
                </span>
              </div>

              <div class="info-item">
                <span class="label">商品描述</span>
                <span class="value">{{ formData.description || '（未填）' }}</span>
              </div>

              <div class="info-item">
                <span class="label">规格参数</span>
                <span v-if="formData.specifications.length > 0" class="value">
                  <el-tag
                    v-for="(spec, idx) in formData.specifications"
                    :key="idx"
                    style="margin: 4px"
                  >
                    {{ spec.item }}: {{ spec.value }}
                  </el-tag>
                </span>
                <span v-else class="value">（无规格参数）</span>
              </div>

              <div class="info-item">
                <span class="label">初始库存</span>
                <span class="value">{{ formData.stockAmount }} 件</span>
              </div>
            </div>
          </el-col>
        </el-row>

        <el-divider></el-divider>

        <div class="preview-detail">
          <h4>商品详情</h4>
          <p>{{ formData.detail || '（未填）' }}</p>
        </div>

        <!-- 导航按钮 -->
        <div class="form-actions">
          <el-button @click="prevStep">返回修改</el-button>
          <el-button
            type="primary"
            @click="handleCreateProduct"
            :loading="isSubmitting"
            size="large"
          >
            确认创建商品
          </el-button>
        </div>
      </div>
    </el-card>
  </el-main>
</template>

<style scoped>
/* ============ 全局样式 ============ */
.create-product-main {
  background: #0a0e27;
  min-height: 100vh;
  padding: 20px;
  font-family: 'Poppins', 'Inter', sans-serif;
  position: relative;
}

.create-product-main::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 2px,
      rgba(214, 40, 40, 0.02) 2px,
      rgba(214, 40, 40, 0.02) 4px
    );
  pointer-events: none;
  z-index: 0;
}

/* ============ 头部导航 ============ */
.create-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  color: white;
  animation: slide-in-right 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.create-title {
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  font-weight: 900;
  margin: 0;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-shadow: 3px 3px 8px rgba(0, 0, 0, 0.5);
}

.create-header :deep(.el-button--primary) {
  color: white;
  background-color: rgba(255, 204, 0, 0.2);
  border-color: #ffcc00;
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.create-header :deep(.el-button--primary:hover) {
  background-color: #ffcc00;
  color: #d62828;
  border-color: #ffcc00;
  transform: translateX(-5px);
  box-shadow: 0 6px 20px rgba(255, 204, 0, 0.4);
}

/* ============ 步骤条 ============ */
.steps-container {
  max-width: 1000px;
  margin: 0 auto 40px;
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  border: 3px solid #d62828;
  animation: expand-grow 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.steps-container :deep(.el-step__main) {
  position: relative;
}

/* ============ 卡片样式 ============ */
.form-card {
  max-width: 1000px;
  margin: 0 auto 30px;
  border-radius: 8px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: slideUp 0.5s ease-out;
  border: 2px solid #ffcc00;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-card :deep(.el-card__header) {
  background: #d62828;
  border-bottom: 3px solid #ffcc00;
  padding: 25px;
  border-left: 4px solid #ffcc00;
  border-right: 4px solid #ffcc00;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 15px;
  color: white;
}

.step-label {
  display: inline-block;
  background-color: rgba(255, 204, 0, 0.25);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  color: #ffcc00;
  border: 2px solid #ffcc00;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.form-card :deep(.el-card__body) {
  padding: 40px 45px;
  background: white;
}

/* ============ 表单样式 ============ */
.product-form {
  width: 100%;
}

.product-form :deep(.el-form-item) {
  margin-bottom: 28px;
}

.product-form :deep(.el-form-item__label) {
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 10px;
  font-size: 15px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.product-form :deep(.el-input__wrapper),
.product-form :deep(.el-select__wrapper),
.product-form :deep(.el-input-number) {
  background-color: #f5f7fa;
  border: 3px solid #1a1a2e;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-weight: 600;
}

.product-form :deep(.el-input__wrapper:hover),
.product-form :deep(.el-input__wrapper:focus),
.product-form :deep(.el-select__wrapper:hover),
.product-form :deep(.el-select__wrapper--focused) {
  border-color: #d62828;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(214, 40, 40, 0.1);
}

.field-help {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 6px;
  font-weight: 500;
  font-style: italic;
}

.full-width {
  width: 100%;
}

/* ============ 上传区域 ============ */
.upload-area {
  margin-bottom: 20px;
}

.upload-area :deep(.el-upload-dragger) {
  background-color: #f5f7fa;
  border: 3px dashed #ffcc00;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  padding: 15px !important;
  height: 200px !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area :deep(.el-upload-dragger:hover) {
  border-color: #d62828;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(214, 40, 40, 0.15);
}

.upload-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 0;
  color: #1a1a2e;
  font-weight: 700;
}

.upload-icon .el-icon {
  font-size: 32px;
  color: #d62828;
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.upload-tip {
  font-size: 11px;
  color: #999;
  font-weight: 500;
  line-height: 1.2;
}

.upload-area :deep(.el-upload-list) {
  max-width: 100%;
  display: flex;
  flex-wrap: wrap;
}

.upload-area :deep(.el-upload-list__item) {
  margin: 0;
}

.upload-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 120px;
}

.upload-preview img {
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
}

.image-uploaded {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #00d084;
  margin-top: 12px;
  font-weight: 700;
  background-color: #f0fff9;
  padding: 8px 12px;
  border-radius: 6px;
}

/* ============ 规格参数 ============ */
.spec-input-area {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 3px solid #d62828;
}

.spec-input-area :deep(.el-input__wrapper) {
  background-color: #f5f7fa;
  border: 2px solid #1a1a2e;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.spec-input-area :deep(.el-input__wrapper:hover),
.spec-input-area :deep(.el-input__wrapper:focus-within) {
  border-color: #d62828;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(214, 40, 40, 0.1);
}

.spec-table {
  margin-top: 20px;
  border: 3px solid #d62828;
  border-radius: 6px;
  overflow: hidden;
}

.spec-table :deep(.el-table) {
  background-color: white;
}

.spec-table :deep(.el-table__header) {
  background-color: #ffcc00;
}

.spec-table :deep(.el-table__header th) {
  color: #1a1a2e;
  font-weight: 700;
}

/* ============ 预览样式 ============ */
.preview-container {
  width: 100%;
}

.preview-image {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 1;
  min-height: 300px;
}

.preview-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  color: #ccc;
  font-size: 16px;
}

.preview-info {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.label {
  font-size: 12px;
  color: #999;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.value {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.price {
  font-size: 24px;
  color: #d62828;
  font-weight: 700;
  background-color: #fff3cd;
  padding: 4px 8px;
  border-radius: 4px;
}

.preview-detail {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.preview-detail h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 16px;
}

.preview-detail p {
  margin: 0;
  color: #666;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

/* ============ 表单底部按钮 ============ */
.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 20px;
  border-top: 3px solid #d62828;
  margin-top: 30px;
  animation: expand-grow 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.form-actions :deep(.el-button) {
  min-width: 140px;
  height: 44px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'Poppins', sans-serif;
}

.form-actions :deep(.el-button--primary) {
  background: #d62828;
  border: 3px solid #1a1a2e;
  color: white;
  animation: elastic-bounce 0.4s ease-out;
  box-shadow: 0 0 0 2px #ffcc00, 0 4px 12px rgba(214, 40, 40, 0.4);
}

.form-actions :deep(.el-button--primary:hover) {
  transform: scale(1.08) rotate(-2deg);
  box-shadow: 0 8px 25px rgba(214, 40, 40, 0.5);
}

.form-actions :deep(.el-button--primary.is-loading) {
  opacity: 0.8;
}

.form-actions :deep(.el-button:not(.el-button--primary)) {
  background-color: #1a1a2e;
  border: 3px solid #d62828;
  color: #d62828;
}

.form-actions :deep(.el-button:not(.el-button--primary):hover) {
  background-color: #d62828;
  border-color: #ffcc00;
  color: white;
  transform: scale(1.08) rotate(2deg);
  box-shadow: 0 8px 24px rgba(214, 40, 40, 0.5);
  animation: elastic-bounce 0.3s ease-out;
}

/* ============ 响应式设计 ============ */
@media (max-width: 768px) {
  .create-product-main {
    padding: 15px;
  }

  .create-header {
    flex-direction: column;
    gap: 15px;
  }

  .create-title {
    font-size: 22px;
  }

  .form-card :deep(.el-card__body) {
    padding: 24px 16px;
  }

  .steps-container {
    padding: 20px;
    margin-bottom: 20px;
  }

  .preview-image {
    min-height: 200px;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions :deep(.el-button) {
    width: 100%;
    min-width: auto;
  }

  .upload-icon {
    padding: 30px 15px;
  }

  .upload-preview {
    height: 150px;
  }
}

@media (max-width: 480px) {
  .create-title {
    font-size: 18px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .product-form :deep(.el-form-item) {
    margin-bottom: 18px;
  }

  .preview-detail {
    font-size: 14px;
  }
}
</style>
