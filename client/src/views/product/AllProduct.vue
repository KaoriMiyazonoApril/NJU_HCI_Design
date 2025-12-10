<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue"
import { useRouter } from 'vue-router'
import ProductCard from "../../components/ProductCard.vue"
import { Back, Search as SearchIcon, Plus, User, SwitchButton } from "@element-plus/icons-vue"
import { getAllProducts } from "../../api/products"
import productApi from "../../api/products"
import { getAllAdvertisements } from "../../api/advertisements.ts"
import { ElMessage, ElMessageBox } from "element-plus"
import { parseRole } from "../../utils"
import type { Product } from "../../api/products"
import { getProductsByCategory } from "../../api/products"

// ============ 分页数据 ============
const currentPage = ref(1)
const pageSize = 12

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return products.value.slice(start, end)
})

// ============ 页面数据 ============
const router = useRouter()
const role = sessionStorage.getItem("role")
const username = sessionStorage.getItem("username")
const products = ref<Product[]>([])
const advertisements = ref<any[]>([])
const isLoading = ref(false)

// ============ 用户操作 ============
const navigateToDashboard = () => {
  router.push({path: "/home/dashboard/" + username})
}

const logout = () => {
  ElMessageBox.confirm(
      '是否要退出登录？',
      '提示',
      {
        confirmButtonText: '是',
        cancelButtonText: '否',
        type: "warning",
        showClose: false,
        roundButton: true,
        center: true
      }
  ).then(() => {
    sessionStorage.setItem('token', '')
    router.push({path: "/login"})
  })
}

// ============ 搜索和筛选 ============
const searchQuery = ref('')
const selectedCategory = ref('')
const categories = [
  '玄幻', '科幻', '奇幻', '冒险', '都市言情',
  '科普', '军事', '哲学', '物理', '生物',
  '化学', '文学', '悬疑', '恐怖', '儿童'
]

// 防抖搜索计时器
let searchTimeout: ReturnType<typeof setTimeout> | null = null

// 监听搜索框变化，实时搜索
watch(searchQuery, async (newQuery) => {
  // 清除之前的计时器
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  // 设置新的防抖计时器，延迟300ms执行搜索
  searchTimeout = setTimeout(async () => {
    // 如果搜索和分类都为空，显示所有商品
    if (!newQuery.trim() && !selectedCategory.value) {
      await fetchAllData()
    } else {
      // 否则执行搜索
      await performSearch()
    }
  }, 300)
})

// ============ API 请求 ============
const fetchAllData = async () => {
  isLoading.value = true
  try {
    const [productsRes, adsRes] = await Promise.all([
      getAllProducts(),
      getAllAdvertisements()
    ])
    products.value = productsRes.data.data || []
    advertisements.value = adsRes.data.data || []
    currentPage.value = 1
  } catch (err) {
    ElMessage.error('获取数据失败，请刷新重试')
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const performSearch = async () => {
  const keyword = searchQuery.value.trim()
  
  if (!keyword && !selectedCategory.value) {
    await fetchAllData()
    return
  }

  isLoading.value = true
  try {
    let res
    if (selectedCategory.value) {
      res = await getProductsByCategory(selectedCategory.value)
      if (keyword) {
        res.data.data = res.data.data.filter((product: Product) => (
          product.title?.toLowerCase().includes(keyword.toLowerCase()) ||
          product.description?.toLowerCase().includes(keyword.toLowerCase())
        ))
      }
    } else {
      res = await productApi.search(keyword)
    }
    products.value = res.data.data || []
    currentPage.value = 1
    // 搜索成功时弹出提示
    ElMessage.success(`找到 ${products.value.length} 件商品`)
  } catch (err) {
    console.error('搜索失败:', err)
    ElMessage.error("搜索失败，请重试")
  } finally {
    isLoading.value = false
  }
}

// ============ 事件处理 ============
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleProductDelete = (productId: number) => {
  products.value = products.value.filter(p => p.id !== productId)
  ElMessage.success('商品已删除')
}

const handleCategoryChange = async () => {
  currentPage.value = 1
  await performSearch()
}

const handleClearFilters = async () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  await fetchAllData()
}

// ============ 导航 ============
const toCreateProductPage = () => {
  router.push("/home/createproduct")
}

const toProductDetailPage = (productId: number) => {
  router.push(`/home/products/${productId}`)
}

const toBackPage = () => {
  router.back()
}

const toCartPage = () => {
  router.push("/home/cart")
}

const toAllAdvertisementsPage = () => {
  router.push("/home/alladvertisements")
}

const navigateToProduct = (productId: number) => {
  if (productId) {
    router.push(`/home/products/${productId}`)
  } else {
    ElMessage.warning('该广告未关联商品')
  }
}

// ============ 生命周期 ============
onMounted(() => {
  fetchAllData()
})


</script>

<template>
  <el-main class="product-main">
    <!-- 头部导航栏 -->
    <div class="header-bar">
      <!-- 第一行：标题、版本标签、用户、退出和操作按钮 -->
      <div class="header-top">
        <div class="header-left-space"></div>
        <div class="header-title">
          <h1 class="page-title">商品中心</h1>
        </div>
        <div class="header-right-top">
          <el-tag class="role-tag">{{ parseRole(role) }}版</el-tag>
          <div class="action-buttons-group">
            <el-button type="primary" @click="toCartPage" :icon="SearchIcon" class="header-action-btn">
              购物车
            </el-button>
            <el-button v-if="role === 'MANAGER'" type="success" @click="toCreateProductPage" :icon="Plus" class="header-action-btn">
              新建商品
            </el-button>
            <el-button v-if="role === 'MANAGER'" type="warning" @click="toAllAdvertisementsPage" plain class="header-action-btn">
              广告管理
            </el-button>
            <el-icon @click="navigateToDashboard" :size="28" class="header-icon-btn"><User /></el-icon>
            <el-icon @click="logout" :size="28" class="header-icon-btn"><SwitchButton /></el-icon>
          </div>
        </div>
      </div>

      <!-- 第二行：搜索和筛选 -->
      <div class="header-center">
        <div class="filter-row">
          <el-input
            v-model="searchQuery"
            placeholder="搜索商品名称或描述..."
            prefix-icon="Search"
            clearable
            class="search-input"
          />
          <el-select
            v-model="selectedCategory"
            placeholder="按分类筛选"
            @change="handleCategoryChange"
            clearable
            class="category-select"
          >
            <el-option
              v-for="category in categories"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>
          <el-button @click="handleClearFilters" type="info" plain v-if="searchQuery || selectedCategory" class="clear-btn">
            清除筛选
          </el-button>
        </div>
      </div>
    </div>

    <!-- 广告轮播区 -->
    <div v-if="advertisements.length > 0" class="carousel-section">
      <el-carousel :interval="5000" arrow="always" height="400px" autoplay>
        <el-carousel-item v-for="ad in advertisements" :key="ad.id">
          <img
            :src="ad.imgUrl"
            alt="广告"
            class="carousel-image"
            @click="navigateToProduct(ad.productId)"
          />
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-container">
      <el-skeleton :count="6" animated />
    </div>

    <!-- 空状态 -->
    <div v-else-if="products.length === 0" class="empty-state">
      <div class="empty-icon">📦</div>
      <p class="empty-text">未找到相关商品</p>
      <el-button type="primary" link @click="handleClearFilters">
        清除筛选条件，查看全部商品
      </el-button>
    </div>

    <!-- 商品网格 -->
    <div v-else class="products-section">
      <div class="product-grid">
        <ProductCard
          v-for="product in paginatedProducts"
          :key="product.id"
          :product="product"
          @delete="handleProductDelete"
          @click="toProductDetailPage(product.id)"
        />
      </div>

      <!-- 分页器 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="products.length"
          layout="total, prev, pager, next, jumper"
          @current-change="handleCurrentChange"
          background
        />
      </div>
    </div>

    <!-- 浮动购物车按钮 -->
    <div class="floating-action" @click="toCartPage">
      <span class="action-icon">🛒</span>
      <span class="action-text">购物车</span>
    </div>
  </el-main>
</template>

<style scoped>
/* ============ 全局 ============ */
.product-main {
  background: #0a0e27;
  min-height: 100vh;
  padding: 0;
  font-family: 'Poppins', 'Inter', sans-serif;
  position: relative;
}

.product-main::before {
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

/* ============ 头部导航栏 ============ */
.header-bar {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background: linear-gradient(135deg, #6b5b95 0%, #8b5fb5 100%);
  color: white;
  padding: 12px 40px;
  box-shadow: 0 0 0 2px #d4af37, 0 12px 40px rgba(107, 91, 149, 0.4);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 4px solid #d4af37;
  animation: slide-in-right 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-left: 5px solid #d4af37;
  border-right: 5px solid #d4af37;
  gap: 12px;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 20px;
}

.header-left-space {
  flex: 1;
  min-width: 100px;
}

.header-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.header-right-top {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;
}

.role-tag {
  font-size: 12px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  font-weight: 600;
  padding: 4px 8px;
  white-space: nowrap;
}

.action-buttons-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-action-btn {
  font-size: 12px;
  padding: 6px 12px !important;
  height: auto;
}

.header-icon-btn {
  cursor: pointer;
  transition: transform 0.3s ease, color 0.3s ease;
  color: white;
  margin-left: 8px;
}

.header-icon-btn:first-of-type {
  margin-left: 0;
}

.header-icon-btn:hover {
  transform: scale(1.15);
  color: #ffcc00;
}

.header-bar > div:nth-child(2),
.header-bar > div:nth-child(3) {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
  justify-content: space-between;
}

.header-center {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  font-weight: 900;
  margin: 0;
  color: white;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.5);
}

.header-bar :deep(.el-button--primary) {
  background-color: transparent;
  border-color: transparent;
  color: white;
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.header-bar :deep(.el-button--primary:hover) {
  background-color: rgba(212, 175, 55, 0.3);
  color: white;
  border-color: #d4af37;
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
  animation: elastic-bounce 0.5s ease-out;
}

.header-bar :deep(.el-button--success) {
  background-color: transparent;
  border-color: transparent;
  color: white;
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.header-bar :deep(.el-button--success:hover) {
  background-color: rgba(0, 208, 132, 0.3);
  border-color: #00d084;
  color: white;
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(0, 208, 132, 0.3);
  animation: elastic-bounce 0.5s ease-out;
}

.header-bar :deep(.el-button--warning) {
  background-color: transparent;
  border-color: transparent;
  color: white;
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.header-bar :deep(.el-button--warning:hover) {
  background-color: rgba(212, 175, 55, 0.3);
  border-color: #d4af37;
  color: white;
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
  animation: elastic-bounce 0.5s ease-out;
}

/* ============ 轮播区 ============ */
.carousel-section {
  max-width: 1200px;
  margin: 40px auto;
  border-radius: 0;
  overflow: hidden;
  box-shadow: 0 0 0 3px #ffcc00, 0 12px 40px rgba(0, 0, 0, 0.3);
  animation: expand-grow 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  background: white;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease;
  animation: pulse-glow 2s infinite;
}

.carousel-image:hover {
  transform: scale(1.05);
  animation: flash-shine 0.6s ease-in-out;
}

/* ============ 筛选区 ============ */
.filter-section {
  max-width: 1200px;
  margin: 40px auto;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-left: 5px solid #d62828;
  border-top: 3px solid #ffcc00;
  animation: expand-grow 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-family: 'Inter', 'Poppins', sans-serif;
}

.filter-row {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  margin-bottom: 0;
  flex-wrap: wrap;
  width: 100%;
}

.search-input {
  flex: 1;
  min-width: 250px;
  max-width: 350px;
}

.search-input :deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.9);
  border: 2px solid white;
  border-radius: 4px;
  transition: all 0.3s ease;
  font-weight: 600;
}

.search-input :deep(.el-input__wrapper:hover),
.search-input :deep(.el-input__wrapper:focus-within) {
  background-color: white;
  border-color: #d4af37;
  box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.3);
}

.category-select {
  flex: 0 0 150px;
  min-width: 150px;
}

.category-select :deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.9);
  border: 2px solid white;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.category-select :deep(.el-input__wrapper:hover),
.category-select :deep(.el-input__wrapper--focused) {
  background-color: white;
  border-color: #d4af37;
  box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.3);
}

.clear-btn {
  min-width: 100px;
}

/* ============ 加载状态 ============ */
.loading-container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 30px;
}

.loading-container :deep(.el-skeleton__item) {
  height: 280px;
  background: #e8e8e8;
  animation: pulse-glow 1.5s ease-in-out infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* ============ 空状态 ============ */
.empty-state {
  max-width: 1200px;
  margin: 80px auto;
  text-align: center;
  padding: 60px 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 3px dashed #d62828;
}

.empty-icon {
  font-size: 72px;
  margin-bottom: 20px;
  animation: pulse-glow 2s ease-in-out infinite;
}

.empty-text {
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
  font-weight: 700;
}

/* ============ 商品网格 ============ */
.products-section {
  max-width: 1200px;
  margin: 40px auto;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 3px solid #ffcc00;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.product-grid > :deep(*) {
}

/* ============ 分页 ============ */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 20px;
  border-top: 3px solid #d62828;
}

.pagination-wrapper :deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
}

.pagination-wrapper :deep(.el-pagination .btn-prev),
.pagination-wrapper :deep(.el-pagination .btn-next),
.pagination-wrapper :deep(.el-pagination .el-pager li) {
  background-color: #1a1a2e;
  border-color: #d62828;
  border-radius: 6px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  color: white;
  font-weight: 700;
}

.pagination-wrapper :deep(.el-pagination .btn-prev:hover),
.pagination-wrapper :deep(.el-pagination .btn-next:hover),
.pagination-wrapper :deep(.el-pagination .el-pager li:hover) {
  background-color: #d62828;
  border-color: #ffcc00;
  color: white;
  box-shadow: 0 4px 12px rgba(214, 40, 40, 0.4);
  animation: elastic-bounce 0.3s ease-out;
}

.pagination-wrapper :deep(.el-pagination .el-pager li.active) {
  background-color: #ffcc00;
  border-color: #ffcc00;
  color: #1a1a2e;
  font-weight: 700;
}

/* ============ 浮动按钮 ============ */
.floating-action {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 70px;
  height: 70px;
  background: #ffcc00;
  color: #1a1a2e;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 0 0 3px #d62828, 0 12px 32px rgba(214, 40, 40, 0.6);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 99;
  font-weight: 700;
  border: 5px solid #1a1a2e;
  animation: pulse-glow 2s ease-in-out infinite;
  clip-path: polygon(0 0, 85% 0, 100% 15%, 100% 100%, 15% 100%, 0 85%);
}

.floating-action:hover {
  transform: scale(1.2) rotate(-8deg);
  box-shadow: 0 16px 40px rgba(214, 40, 40, 0.7);
  filter: brightness(1.15);
  animation: elastic-bounce 0.4s ease-out;
}

.action-icon {
  font-size: 28px;
  margin-bottom: 2px;
}

.action-text {
  font-size: 12px;
}

/* ============ 响应式设计 ============ */
@media (max-width: 1200px) {
  .header-bar {
    flex-wrap: wrap;
    padding: 15px 20px;
    gap: 10px;
  }

  .page-title {
    font-size: 22px;
    width: 100%;
    order: 3;
    margin-top: 10px;
  }

  .filter-section {
    margin: 20px 15px;
    padding: 20px;
  }

  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .header-bar {
    padding: 10px 15px;
  }

  .header-top {
    flex-direction: column;
    gap: 10px;
  }

  .header-top {
    flex-direction: column;
    gap: 10px;
  }

  .header-title {
    width: 100%;
  }

  .header-right-top {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .header-action-btn {
    font-size: 11px;
    padding: 4px 8px !important;
  }

  .page-title {
    font-size: 16px;
  }

  .filter-row {
    flex-direction: column;
  }

  .search-input {
    width: 100%;
    max-width: 100%;
    min-width: unset;
  }

  .category-select {
    width: 100%;
    flex: unset;
    min-width: unset;
  }

  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }

  .floating-action {
    width: 60px;
    height: 60px;
    bottom: 20px;
    right: 20px;
  }

  .action-icon {
    font-size: 24px;
  }

  .action-text {
    font-size: 10px;
  }
}

@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }

  .header-bar {
    gap: 5px;
  }

  .header-bar :deep(.el-button) {
    font-size: 12px;
    padding: 6px 10px;
  }
}
</style>


