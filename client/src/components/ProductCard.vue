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

    <el-image class="product-image" :src="product.cover || 'https://via.placeholder.com/300'" fit="cover" />

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
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
  background-color: transparent;
}

.product-card:hover {
  transform: scale(1.08) translateY(-10px);
  animation: pulse-glow 1s ease-in-out infinite;
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
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  transition: all 0.3s ease;
}

.product-card:hover .product-title {
  color: #d62828;
  animation: flash-shine 0.6s ease-in-out;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.product-price {
  color: #d62828;
  font-size: 20px;
  font-weight: 800;
  font-family: 'Poppins', sans-serif;
}

.product-card:hover .product-price {
  animation: pulse-glow 1.5s ease-in-out infinite;
  box-shadow: 0 0 15px rgba(214, 40, 40, 0.6);
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
