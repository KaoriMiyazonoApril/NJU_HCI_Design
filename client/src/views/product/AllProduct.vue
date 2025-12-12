<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue"
import { useRouter } from 'vue-router'
import ProductCard from "../../components/ProductCard.vue"
import {
  Search as SearchIcon,
  Plus,
  User,
  SwitchButton,
  ShoppingCart,
  Filter,
  Refresh
} from "@element-plus/icons-vue"
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
const isFilterExpanded = ref(false)

// ============ 用户操作 ============
const navigateToDashboard = () => {
  router.push({path: "/home/dashboard/" + username})
}

const logout = () => {
  ElMessageBox.confirm(
      '确定要退出登录吗？',
      '确认退出',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: "warning",
        showClose: false,
        roundButton: true,
        center: true,
        customClass: 'logout-confirm-dialog'
      }
  ).then(() => {
    sessionStorage.clear()
    ElMessage.success('已成功退出登录')
    setTimeout(() => {
      router.push({path: "/login"})
    }, 500)
  }).catch(() => {
    // 取消操作
  })
}

// ============ 搜索和筛选 ============
const searchQuery = ref('')
const selectedCategory = ref('')
const sortBy = ref('newest') // newest, price-low, price-high
const categories = [
  '玄幻', '科幻', '奇幻', '冒险', '都市言情',
  '科普', '军事', '哲学', '物理', '生物',
  '化学', '文学', '悬疑', '恐怖', '儿童'
]

// 防抖搜索计时器
let searchTimeout: ReturnType<typeof setTimeout> | null = null

// 监听搜索框变化，实时搜索
watch([searchQuery, selectedCategory, sortBy], async () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(async () => {
    if (!searchQuery.value.trim() && !selectedCategory.value) {
      await fetchAllData()
    } else {
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
    applySorting()
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
    applySorting()
    ElMessage.success(`找到 ${products.value.length} 件商品`)
  } catch (err) {
    console.error('搜索失败:', err)
    ElMessage.error("搜索失败，请重试")
  } finally {
    isLoading.value = false
  }
}

// 应用排序
const applySorting = () => {
  if (sortBy.value === 'newest') {
    // 按 id 从大到小排序，id 越大表示越新
    products.value.sort((a, b) => b.id - a.id)
  } else if (sortBy.value === 'price-low') {
    products.value.sort((a, b) => a.price - b.price)
  } else if (sortBy.value === 'price-high') {
    products.value.sort((a, b) => b.price - a.price)
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

const handleSortChange = () => {
  applySorting()
}

const handleClearFilters = async () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  sortBy.value = 'newest'
  await fetchAllData()
}

const toggleFilterPanel = () => {
  isFilterExpanded.value = !isFilterExpanded.value
}

// ============ 导航 ============
const toCreateProductPage = () => {
  router.push("/home/createproduct")
}

const toProductDetailPage = (productId: number) => {
  router.push(`/home/products/${productId}`)
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
  <div class="product-center">
    <!-- 头部导航栏 -->
    <header class="main-header">
      <div class="header-container">
        <!-- Logo和标题 -->
        <div class="brand-section">
          <div class="logo-wrapper">
            <div class="logo-icon">📚</div>
            <h1 class="brand-name">书海商城</h1>
          </div>
          <div class="title-wrapper">
            <h2 class="page-title">商品中心</h2>
            <el-tag class="role-tag">{{ parseRole(role) }}版</el-tag>
          </div>
        </div>

        <!-- 用户操作区 -->
        <div class="user-section">
          <div class="user-info">
            <el-avatar :size="36" class="user-avatar">
              {{ username?.charAt(0).toUpperCase() }}
            </el-avatar>
            <span class="username">{{ username }}</span>
          </div>

          <div class="action-buttons">
            <el-button
                type="primary"
                @click="toCartPage"
                :icon="ShoppingCart"
                class="action-btn cart-btn"
                circle
                size="large"
            />

            <el-button
                v-if="role === 'MANAGER'"
                type="success"
                @click="toCreateProductPage"
                :icon="Plus"
                class="action-btn create-btn"
                circle
                size="large"
            />

            <el-button
                v-if="role === 'MANAGER'"
                type="warning"
                @click="toAllAdvertisementsPage"
                class="action-btn ad-btn"
                circle
                size="large"
            >
              AD
            </el-button>

            <el-button
                @click="navigateToDashboard"
                :icon="User"
                class="action-btn profile-btn"
                circle
                size="large"
            />

            <el-button
                @click="logout"
                :icon="SwitchButton"
                class="action-btn logout-btn"
                circle
                size="large"
            />
          </div>
        </div>
      </div>

      <!-- 搜索和筛选栏 -->
      <div class="search-section">
        <div class="search-container">
          <el-input
              v-model="searchQuery"
              placeholder="搜索商品名称或描述..."
              :prefix-icon="SearchIcon"
              clearable
              size="large"
              class="search-input"
          />

          <el-button
              @click="toggleFilterPanel"
              :icon="Filter"
              class="filter-toggle-btn"
              :type="isFilterExpanded ? 'primary' : 'default'"
              circle
              size="large"
          />

          <el-button
              @click="handleClearFilters"
              :icon="Refresh"
              v-if="searchQuery || selectedCategory"
              class="clear-btn"
              circle
              size="large"
          />
        </div>

        <!-- 扩展筛选面板 -->
        <div v-if="isFilterExpanded" class="filter-panel">
          <div class="filter-content">
            <div class="filter-group">
              <span class="filter-label">分类筛选</span>
              <el-select
                  v-model="selectedCategory"
                  placeholder="全部分类"
                  @change="handleCategoryChange"
                  clearable
                  size="large"
                  class="category-select"
              >
                <el-option
                    v-for="category in categories"
                    :key="category"
                    :label="category"
                    :value="category"
                />
              </el-select>
            </div>

            <div class="filter-group">
              <span class="filter-label">排序方式</span>
              <el-radio-group v-model="sortBy" @change="handleSortChange" size="large">
                <el-radio-button label="newest">最新上架</el-radio-button>
                <el-radio-button label="price-low">价格从低到高</el-radio-button>
                <el-radio-button label="price-high">价格从高到低</el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 广告轮播区 -->
      <div v-if="advertisements.length > 0" class="ad-carousel-section">
        <div class="section-header">
          <h3 class="section-title">热门推荐</h3>
          <span class="section-subtitle">发现精选好书</span>
        </div>
        <el-carousel
            :interval="5000"
            arrow="always"
            height="400px"
            autoplay
            trigger="click"
            class="ad-carousel"
        >
          <el-carousel-item v-for="ad in advertisements" :key="ad.id">
            <div class="carousel-item">
              <img
                  :src="ad.imgUrl"
                  :alt="ad.title || '广告'"
                  class="carousel-image"
                  @click="navigateToProduct(ad.productId)"
              />
              <div v-if="ad.title" class="carousel-caption">
                <h4>{{ ad.title }}</h4>
                <p v-if="ad.description">{{ ad.description }}</p>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>

      <!-- 商品展示区 -->
      <div class="products-section">
        <div class="section-header">
          <h3 class="section-title">
            全部商品
            <span class="product-count">(共 {{ products.length }} 件)</span>
          </h3>

          <div class="view-controls">
            <span class="showing-text">
              显示 {{ Math.min((currentPage - 1) * pageSize + 1, products.length) }}-{{ Math.min(currentPage * pageSize, products.length) }} 件
            </span>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading-state">
          <div class="skeleton-grid">
            <div v-for="i in 6" :key="i" class="product-skeleton">
              <div class="skeleton-image"></div>
              <div class="skeleton-info">
                <div class="skeleton-title"></div>
                <div class="skeleton-price"></div>
                <div class="skeleton-button"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="products.length === 0" class="empty-state">
          <div class="empty-illustration">
            <div class="empty-icon">📦</div>
            <h3>未找到相关商品</h3>
            <p>尝试调整搜索词或筛选条件</p>
            <el-button
                type="primary"
                @click="handleClearFilters"
                :icon="Refresh"
                size="large"
                class="empty-action-btn"
            >
              查看全部商品
            </el-button>
          </div>
        </div>

        <!-- 商品网格 -->
        <div v-else class="product-grid">
          <ProductCard
              v-for="product in paginatedProducts"
              :key="product.id"
              :product="product"
              @delete="handleProductDelete"
              @click="toProductDetailPage(product.id)"
              class="product-card-item"
          />
        </div>

        <!-- 分页器 -->
        <div v-if="products.length > pageSize" class="pagination-section">
          <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="products.length"
              :pager-count="5"
              layout="total, prev, pager, next, jumper"
              @current-change="handleCurrentChange"
              background
              class="custom-pagination"
          />
        </div>
      </div>
    </main>

    <!-- 回到顶部按钮 -->
    <el-backtop :right="30" :bottom="30" class="back-to-top" />

    <!-- 悬浮购物车按钮 -->
    <div class="floating-cart-btn" @click="toCartPage">
      <el-badge :value="0" :max="99" class="cart-badge">
        <el-button
            type="primary"
            :icon="ShoppingCart"
            circle
            size="large"
            class="cart-float-btn"
        />
      </el-badge>
      <span class="cart-label">购物车</span>
    </div>
  </div>
</template>

<style scoped>
/* ============ 全局样式 ============ */
.product-center {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* ============ 头部样式 ============ */
.main-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 0;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
}

/* 品牌区域 */
.brand-section {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  font-size: 32px;
  background: rgba(255, 255, 255, 0.1);
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.brand-name {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #fff 0%, #e2e8f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  opacity: 0.95;
}

.role-tag {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

/* 用户区域 */
.user-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-weight: 600;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.username {
  font-weight: 500;
  font-size: 14px;
  opacity: 0.95;
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cart-btn:hover {
  background: rgba(59, 130, 246, 0.3);
}

.create-btn:hover {
  background: rgba(34, 197, 94, 0.3);
}

.ad-btn {
  font-weight: 700;
}

.ad-btn:hover {
  background: rgba(245, 158, 11, 0.3);
}

.profile-btn:hover {
  background: rgba(139, 92, 246, 0.3);
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

/* 搜索区域 */
.search-section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 16px;
}

.search-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  flex: 1;
  max-width: 600px;
}

.search-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 0 16px;
  transition: all 0.3s ease;
}

.search-input :deep(.el-input__wrapper:hover),
.search-input :deep(.el-input__wrapper.is-focus) {
  background: white;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-toggle-btn,
.clear-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.filter-toggle-btn:hover,
.clear-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 筛选面板 */
.filter-panel {
  background: rgba(255, 255, 255, 0.95);
  border-top: 1px solid #e2e8f0;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 24px;
  display: flex;
  gap: 40px;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.filter-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
  min-width: 80px;
}

.category-select {
  min-width: 200px;
}

/* ============ 主内容区 ============ */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

/* 分区标题 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-subtitle {
  font-size: 14px;
  color: #64748b;
  margin-left: 12px;
}

.product-count {
  font-size: 16px;
  color: #64748b;
  font-weight: 400;
}

.view-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.showing-text {
  font-size: 14px;
  color: #64748b;
}

/* 广告轮播区 */
.ad-carousel-section {
  margin-bottom: 48px;
}

.ad-carousel {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.carousel-item {
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  cursor: pointer;
}

.carousel-image:hover {
  transform: scale(1.02);
}

.carousel-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;
  padding: 24px;
}

.carousel-caption h4 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
}

.carousel-caption p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

/* 加载状态 */
.loading-state {
  padding: 40px 0;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.product-skeleton {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-image {
  width: 100%;
  height: 180px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.skeleton-info {
  padding: 16px;
}

.skeleton-title {
  height: 20px;
  background: #f0f0f0;
  border-radius: 4px;
  margin-bottom: 12px;
  width: 70%;
}

.skeleton-price {
  height: 16px;
  background: #f0f0f0;
  border-radius: 4px;
  margin-bottom: 16px;
  width: 40%;
}

.skeleton-button {
  height: 36px;
  background: #f0f0f0;
  border-radius: 8px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 空状态 */
.empty-state {
  padding: 80px 0;
  text-align: center;
}

.empty-illustration {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 24px;
  opacity: 0.3;
}

.empty-state h3 {
  font-size: 24px;
  color: #64748b;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.empty-state p {
  color: #94a3b8;
  margin: 0 0 24px 0;
  font-size: 16px;
}

.empty-action-btn {
  padding: 12px 32px;
  border-radius: 12px;
  font-weight: 600;
}

/* 商品网格 */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.product-card-item {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card-item:hover {
  transform: translateY(-4px);
}

/* 分页器 */
.pagination-section {
  padding: 24px 0;
  border-top: 1px solid #e2e8f0;
  margin-top: 24px;
}

.custom-pagination {
  display: flex;
  justify-content: center;
}

.custom-pagination :deep(.el-pagination) {
  --el-pagination-bg-color: white;
  --el-pagination-button-bg-color: white;
  --el-pagination-button-hover-color: #667eea;
  --el-pagination-button-disabled-bg-color: #f8fafc;
}

.custom-pagination :deep(.el-pager li) {
  border-radius: 8px;
  margin: 0 4px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.custom-pagination :deep(.el-pager li:hover) {
  border-color: #667eea;
  color: #667eea;
}

.custom-pagination :deep(.el-pager li.active) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: white;
}

.custom-pagination :deep(.btn-prev),
.custom-pagination :deep(.btn-next) {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.custom-pagination :deep(.btn-prev:hover),
.custom-pagination :deep(.btn-next:hover) {
  border-color: #667eea;
  color: #667eea;
}

/* 回到顶部按钮 */
.back-to-top {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  width: 48px !important;
  height: 48px !important;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.back-to-top:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

/* 悬浮购物车按钮 */
.floating-cart-btn {
  position: fixed;
  right: 32px;
  bottom: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 99;
  cursor: pointer;
}

.cart-badge :deep(.el-badge__content) {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: 2px solid white;
  font-weight: 600;
}

.cart-float-btn {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  animation: float 3s ease-in-out infinite;
}

.cart-float-btn:hover {
  transform: scale(1.1) rotate(15deg);
  box-shadow: 0 6px 24px rgba(102, 126, 234, 0.4);
}

.cart-label {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
  pointer-events: none;
  backdrop-filter: blur(10px);
}

.floating-cart-btn:hover .cart-label {
  opacity: 1;
  transform: translateY(0);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* ============ 响应式设计 ============ */
@media (max-width: 1024px) {
  .header-container {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .brand-section {
    justify-content: space-between;
  }

  .user-section {
    justify-content: space-between;
  }

  .filter-content {
    flex-direction: column;
    align-items: stretch;
    gap: 24px;
  }

  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .filter-label {
    min-width: auto;
  }

  .category-select {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .header-container,
  .search-container,
  .filter-content,
  .main-content {
    padding-left: 16px;
    padding-right: 16px;
  }

  .brand-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .logo-wrapper {
    width: 100%;
    justify-content: center;
  }

  .title-wrapper {
    width: 100%;
    justify-content: center;
  }

  .user-section {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .user-info {
    justify-content: center;
  }

  .action-buttons {
    justify-content: center;
    flex-wrap: wrap;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .view-controls {
    justify-content: center;
  }

  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  .floating-cart-btn {
    right: 16px;
    bottom: 16px;
  }

  .cart-float-btn {
    width: 48px;
    height: 48px;
  }
}

@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .logo-icon {
    width: 40px;
    height: 40px;
    font-size: 24px;
  }

  .brand-name {
    font-size: 18px;
  }

  .page-title {
    font-size: 16px;
  }

  .section-title {
    font-size: 20px;
  }

  .search-container {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    max-width: 100%;
  }

  .filter-toggle-btn,
  .clear-btn {
    align-self: flex-end;
  }
}
</style>