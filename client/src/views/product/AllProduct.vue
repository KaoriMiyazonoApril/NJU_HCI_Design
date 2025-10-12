<script setup lang="ts">
import {onMounted, ref, computed} from "vue"
import { useRouter } from 'vue-router'
import ProductCard from "../../components/ProductCard.vue"
import { Back } from "@element-plus/icons-vue"
import { getAllProducts } from "../../api/products"
import productApi from "../../api/products"
import { getAllAdvertisements } from "../../api/advertisements.ts"
import { ElMessage } from "element-plus"
import type { Product } from "../../api/products"
import {getProductsByCategory} from "../../api/products"
import { mockProducts, mockAdvertisements } from "../../api/mockData"

const currentPage = ref(1)
const pageSize = 10 // 每页显示15个商品

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return products.value.slice(start, end)
})
const handleCurrentChange = (page: number) => {
  currentPage.value = page
}


const router = useRouter()
const role = sessionStorage.getItem("role")
const products = ref<Product[]>([])
// const products = ref<Product[]>(mockProducts)

const top3Products = ref<Product[]>([])
const advertisements = ref<any[]>([]);
// const advertisements = ref<any[]>(mockAdvertisements); // 广告列表

getAllProducts().then(res => {
   products.value = res.data.data
}).catch(err => {
  ElMessage.error('获取商品列表失败')
  console.error(err)
})



const fetchTop3Products = async () => {
  try {
    const res = await getAllProducts()
    if (res.data.data && res.data.data.length > 0) {
      // 按销量降序排序
      const sorted = [...res.data.data].sort((a, b) => b.sales - a.sales)
      // 取前3个
      top3Products.value = sorted.slice(0, 3)
    }
  } catch (err) {
    console.error('获取销量前三商品失败:', err)
  }
}

// 获取广告列表（新增部分）
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
  fetchAdvertisements(); // 在页面加载时获取广告数据
  fetchTop3Products()
  performSearch() // 初始加载所有商品
});

// 点击创建商品按钮，跳转到创建商品界面
function toCreateProductPage() {
  router.push("/createproduct")
}

// 点击商品卡片，跳转到对应的商品详情界面
function toProductDetailPage(productId: number) {
  router.push(`/products/${productId}`)
}
function handleProductDelete(productId: number) {
  products.value = products.value?.filter(p => p.id !== productId)
}
function toBackPage() {
  router.back()
}
// 跳转到购物车页面
const toCartPage = () => {
  router.push("/cart");
};


const toAllAdvertisementsPage = () => {
  router.push("/alladvertisements");
};

// 点击广告图片，跳转到对应商品详情页面
function navigateToProduct(productId: number) {
  if (productId) {
    router.push(`/products/${productId}`);
  } else {
    ElMessage.warning('该广告未关联商品');
  }
}

const searchQuery = ref('')
const isSearching = ref(false)
const performSearch = async () => {
  const keyword = searchQuery.value.trim()
  if (!keyword && !selectedCategory.value) {
    // 如果既没有搜索词也没有选择分类，加载所有商品
    try {
      const res = await getAllProducts()
      products.value = res.data.data
      currentPage.value = 1
    } catch (err) {
      ElMessage.error('获取商品列表失败')
      console.error(err)
    }
    return

    // 重置为所有假数据
    // products.value = mockProducts
    // currentPage.value = 1
    // return
  }

  isSearching.value = true
  try {
    let res
    if (selectedCategory.value) {
      // 如果有分类筛选，先获取分类商品
      res = await getProductsByCategory(selectedCategory.value)
      if (keyword) {
        // 如果同时有关键词，在分类结果中过滤
        res.data.data = res.data.data.filter((product: Product) => (
            product.title?.includes(keyword) ||
            product.description?.includes(keyword)
        ));}
    } else {
      // 只有关键词，直接搜索
      res = await productApi.search(keyword)
    }

    products.value = res.data.data || []
  } catch (err) {
    console.error('操作出错:', err)
    ElMessage.error("操作失败，请重试")
  } finally {
    isSearching.value = false
  }
}

const categories = [
  '玄幻',
  '科幻'

]
const selectedCategory = ref('')

// 分类筛选事件处理
const handleCategoryChange = async (category: string) => {
  selectedCategory.value = category
  await performSearch() // 调用统一的处理函数
}


</script>

<template>
  <div class="background-overlay"></div> <!-- 背景遮罩层 -->
  <el-main class="custom-main">

    <div class="button-group">
      <el-button type="success" plain @click="toAllAdvertisementsPage">
        <el-icon name="document"></el-icon> 前往广告列表
      </el-button>
      <el-button v-if="role === 'MANAGER'" type="primary" plain @click="toCreateProductPage">
        <el-icon name="plus"></el-icon> 创建商品
      </el-button>
    </div>

  <el-button @click="toBackPage()" type="primary" circle plain style="margin-left: 30px;">
    <el-icon><Back /></el-icon>
  </el-button>

  <!-- 广告轮播 -->
  <div class="ad-carousel">
    <el-carousel :interval="4000" arrow="always" height="500px" autoplay>
      <el-carousel-item v-for="ad in advertisements" :key="ad.id">
        <img
            :src="ad.imgUrl"
            alt="广告图片"
            class="carousel-image"
            @click="navigateToProduct(ad.productId)"
            style="cursor: pointer;"
        />
      </el-carousel-item>
    </el-carousel>
  </div>



  <!-- 搜索与分类筛选 -->
  <div class="search-and-filter">
    <div class="search-container">
      <el-input
          v-model="searchQuery"
          placeholder="请输入关键词"
          @keyup.enter="performSearch"
          class="search-input"
      />
      <el-button type="primary" @click="performSearch">搜索</el-button>
    </div>

    <el-select
        v-model="selectedCategory"
        placeholder="请选择分类"
        @change="handleCategoryChange"
        class="custom-category-select"
    >
      <el-option
          v-for="category in categories"
          :key="category"
          :label="category"
          :value="category"
      />
    </el-select>
  </div>



    <!-- 新增销量前三展示区 -->
<!--    <div class="top3-container">-->
<!--      <h2 class="top3-title">🏆 畅销排行榜</h2>-->
<!--    <div class="top3-horizontal">-->
<!--      &lt;!&ndash; 亚军 &ndash;&gt;-->
<!--      <div v-if="top3Products[1]" class="top3-item runner-up" @click="toProductDetailPage(top3Products[1].id)">-->
<!--        <div class="top3-badge">🥈 亚军</div>-->
<!--        <div class="image-wrapper">-->
<!--          <img :src="top3Products[1].cover" alt="亚军商品" class="top3-image"/>-->
<!--        </div>-->
<!--        <div class="top3-info">-->
<!--          <h3>{{ top3Products[1].title }}</h3>-->
<!--          <p class="sales">销量: {{ top3Products[1].sales }}</p>-->
<!--        </div>-->
<!--      </div>-->

<!--      &lt;!&ndash; 冠军（现在在中间） &ndash;&gt;-->
<!--      <div v-if="top3Products[0]" class="top3-item champion" @click="toProductDetailPage(top3Products[0].id)">-->
<!--        <div class="top3-badge">👑 冠军</div>-->
<!--        <div class="image-wrapper">-->
<!--          <img :src="top3Products[0].cover" alt="冠军商品" class="top3-image"/>-->
<!--        </div>-->
<!--        <div class="top3-info">-->
<!--          <h3>{{ top3Products[0].title}}</h3>-->
<!--          <p class="sales">销量: {{ top3Products[0].sales }}</p>-->
<!--        </div>-->
<!--      </div>-->

<!--      &lt;!&ndash; 季军 &ndash;&gt;-->
<!--      <div v-if="top3Products[2]" class="top3-item third-place" @click="toProductDetailPage(top3Products[2].id)">-->
<!--        <div class="top3-badge">🥉 季军</div>-->
<!--        <div class="image-wrapper">-->
<!--          <img :src="top3Products[2].cover" alt="季军商品" class="top3-image"/>-->
<!--        </div>-->
<!--        <div class="top3-info">-->
<!--          <h3>{{ top3Products[2].title }}</h3>-->
<!--          <p class="sales">销量: {{ top3Products[2].sales }}</p>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
<!--    </div>-->


    <!-- 商品展示 -->
    <!-- 商品展示 -->
    <div class="product-container">
      <div class="product-grid">
        <ProductCard
            v-for="product in paginatedProducts"
            :key="product.id"
            :product="product"
            @delete="handleProductDelete"
            @click="toProductDetailPage(product.id)"
        />
      </div>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="products.length"
            layout="prev, pager, next, jumper, total"
            @current-change="handleCurrentChange"
            background
        />
      </div>
    </div>

    <!-- 悬浮购物车按钮 -->
    <div class="floating-cart-button" @click="toCartPage">
      🛒购物车
    </div>
  </el-main>

</template>

<style scoped>
/* 主体背景 */
.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: -1;
  pointer-events: none; /* 不拦截鼠标事件 */
}
.custom-main {
  position: relative;
  background-image: url("../../assets/book1.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 30px;
  min-height: 100vh;
}
/* 广告样式 */
.ad-banner {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 200px;
  height: 400px;
  z-index: 1000;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

.left-ad {
  left: 30px;
}

.right-ad {
  right: 30px;
}

.ad-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.close-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  cursor: pointer;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

/* 广告轮播 */
.ad-carousel {
  margin: 0px auto;
  max-width: 1200px;
  width: 90%;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  z-index: 1;
  position: relative;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.carousel-image:hover {
  transform: scale(1.05);
}

/* 搜索和分类 */
.search-and-filter {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  margin-top: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input {
  width: 300px;
}

.custom-category-select {
  width: 300px;
  font-size: 16px;
}

/* 商品展示 */
/* 商品展示 */
.product-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr); /* 5列 */
  grid-template-rows: repeat(2, 1fr); /* 3行 */
  gap: 20px;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

/* 分页样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .product-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 992px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
}

/* 添加商品按钮 */
.add-product-button {
  margin-left: 30px;
  margin-bottom: 20px;
}

/* 悬浮购物车按钮 */
.floating-cart-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #1677ff;
  color: white;
  padding: 10px 20px;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-size: 16px;
  z-index: 1001;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.3s ease;
}

.floating-cart-button:hover {
  background-color: #1890ff;
}



@keyframes assistant-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}


@keyframes fadeInOut {
  0% { opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; }
}

/* 按钮组容器 */
.button-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 0px;
  margin-bottom: 10px;
  z-index: 10;
}


.button-group .el-button {
  width: 180px;
  height: 45px;
  border-radius: 25px;
  font-weight: bold;
  font-size: 15px;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.9);
  border-width: 2px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  color: #333;
  backdrop-filter: blur(5px);
}

.button-group .el-button[type="success"] {
  border-color: #67c23a;
  color: #67c23a;
}

.button-group .el-button[type="success"]:hover {
  background-color: #67c23a;
  color: white;
}

.button-group .el-button[type="primary"] {
  border-color: #409EFF;
  color: #409EFF;
}

.button-group .el-button[type="primary"]:hover {
  background-color: #409EFF;
  color: white;
}

/* 按钮间距 */
.button-group .el-button:not(:last-child) {
  margin-bottom: 15px;
}

.top3-container {
  margin: 30px auto;

  max-width: 600px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 3px 9px rgba(0, 0, 0, 0.08);
}

.top3-title {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.top3-horizontal {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 10px;
}

/* 通用卡片样式 */
.top3-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-radius: 6px;
  width: 140px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

/* 冠军样式 */
.champion {
  background: linear-gradient(145deg, #fff8d6, #ffeb3b);
  border: 1px solid #ffc107;
  height: 190px;
  z-index: 3;
  transform: translateY(-10px) scale(1.1);
}

/* 亚军样式 */
.runner-up {
  background: linear-gradient(145deg, #f0f0f0, #e0e0e0);
  border: 1px solid #9e9e9e;
  height: 170px;
}

/* 季军样式 */
.third-place {
  background: linear-gradient(145deg, #ffd7c7, #ffab91);
  border: 1px solid #ff8a65;
  height: 170px;
}

/* 悬停效果 */
.top3-item:hover {
  transform: translateY(-12px) scale(1.05);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
}

.champion:hover {
  transform: translateY(-15px) scale(1.15);
}

/* 奖牌标识 */
.top3-badge {
  font-size: 11px;
  font-weight: bold;
  margin-bottom: 10px;
  padding: 4px 10px;
  border-radius: 15px;
}

.champion .top3-badge {
  box-shadow: 0 2px 4px rgba(255, 152, 0, 0.3);
}

.runner-up .top3-badge {
  box-shadow: 0 2px 4px rgba(158, 158, 158, 0.3);
}

.third-place .top3-badge {
  box-shadow: 0 2px 4px rgba(255, 112, 67, 0.3);
}

/* 图片容器 */
.image-wrapper {
  width: 150px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  border-radius: 4px;
  overflow: hidden; /* 确保图片不会溢出容器 */
  background: white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 2px; /* 减少内边距 */
}

.champion .image-wrapper {
  width: 160px;
  height: 280px;
}

.top3-image {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain; /* 保持比例完整显示 */
  object-position: center;
  transition: transform 0.2s ease;
}
/* 商品信息 */
.top3-info h3 {
  margin: 0 0 5px 0;
  font-size: 15px;
}

.sales {
  font-size: 15px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top3-horizontal {
    flex-direction: column;
    gap: 12px;
  }

  .top3-item {
    width: 80%;
    max-width: 150px;
    height: auto !important;
    transform: none !important;
  }

  .image-wrapper, .champion .image-wrapper {
    width: 70px;
    height: 90px;
  }
}
@media (max-width: 768px) {
  .image-wrapper,
  .champion .image-wrapper {
    width: 70px;
    height: 85px;
    padding: 2px;
  }
}
</style>


