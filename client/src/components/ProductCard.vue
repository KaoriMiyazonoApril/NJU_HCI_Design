<script setup lang="ts">
import { ElMessageBox, ElMessage } from 'element-plus'
import type { Product } from "../api/products"
import { deleteProduct } from "../api/products"

defineProps<{
  product: Product
}>()

const emit = defineEmits(['delete'])
const role = sessionStorage.getItem("role")
// 删除商品
const handleDelete = (id: number) => {
  ElMessageBox.confirm(
      '确定要删除该商品吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    // 调用删除 API
    deleteProduct(id).then(() => {
      ElMessage.success('删除成功')
      emit('delete', id) // 通知父组件删除商品
    }).catch(err => {
      ElMessage.error('删除失败')
      console.error(err)
    })
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}
</script>

<template>
  <el-card v-if="product && typeof product === 'object'" class="product-card" :body-style="{ padding: '0px' }" shadow="hover">
    <!-- 删除按钮 -->
    <div v-if="role === 'MANAGER'" class="delete-button">
      <el-button type="danger" size="small" @click.stop="handleDelete(product.id!)">删除</el-button>
    </div>

    <!-- 修改图片容器，使用标准书籍封面比例 -->
    <div class="book-cover-container">
      <el-image class="book-cover-image" :src="product.cover || 'https://via.placeholder.com/240x300'" fit="cover" />
    </div>

    <div style="padding: 14px">
      <h3 class="product-title">{{ product.title || '未知商品' }}</h3>

      <div class="product-meta">
        <span class="product-price">¥{{ (product.price || 0).toFixed(2) }}</span>
        <el-rate v-model="product.rate" disabled show-score />
      </div>
      <p class="product-description">{{ product.description || '暂无描述' }}</p>
      <p class="product-description">{{ product.category || '暂无分类' }}</p>
    </div>
  </el-card>
</template>

<style scoped>
.product-card {
  position: relative;
  width: 280px;
  transition: all 0.3s;
  cursor: pointer;
  background-color: transparent; /* 主卡片本身透明 */
}

.delete-button {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}

.product-image {
  width: 100%;
  height: 180px;
  display: block;
  object-fit: cover;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

/* 内容区域：应用玻璃透明效果 */
.product-card > div {
  padding: 14px;
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.7); /* 半透明白色 */
  border-radius: 0 0 4px 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: background-color 0.3s ease;
}

.product-title {
  font-size: 16px;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #333;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.product-score {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.product-price {
  color: #f56c6c;
  font-size: 18px;
  font-weight: bold;
}

.product-description {
  font-size: 14px;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}
</style>
