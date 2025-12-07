<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { getProduct, updateProduct ,getProductAmount,type Stockpile ,likeProduct,evaluateProduct} from "../../api/products"; // 根据实际路径导入
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { addToCart } from "../../api/cart";
import { Back } from "@element-plus/icons-vue"
import {addComment, getCommentsByProductId, deleteComment, type CommentVO} from "../../api/comments";
import { Star, StarFilled } from '@element-plus/icons-vue'
import {addFavor, deleteFavor, findFavor, userInfo} from "../../api/accounts.ts";

// 获取用户角色信息
const getRole = () => {
  if (typeof window !== 'undefined') {
    return window.sessionStorage.getItem("role");
  }
  return null;
};

const role = getRole();
const isAdmin = computed(() => role === "MANAGER");

// 获取路由参数
const route = useRoute();
const router = useRouter();
const productId = Number(route.params.id);
const isLiking = ref(false);

// 定义响应式数据
const product = ref<any | null>(null);
const error = ref<string | null>(null);
const stockpile = ref<Stockpile>({
  amount: 0,     // 总库存设为 0
  frozen: 0,     // 冻结库存设为 0
  productId: productId,
});


const getSessionItem = (key: string): string | null => {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    return window.sessionStorage.getItem(key);
  }
  return null;
};

// 获取当前用户ID
const getCurrentUserId = (): number => {
  const id = getSessionItem('id');
  return id ? Number(id) : 0;
};

const comments = ref<CommentVO[]>([]);
const newComment = ref<Omit<CommentVO, 'id'>>({
  userId: Number(typeof window !== 'undefined' ? window.sessionStorage.getItem("id") : 0),
  productId: productId,
  detail: '',
  username: String(typeof window !== 'undefined' ? window.sessionStorage.getItem("username") : ''),
});

// 添加 showCommentInput 变量
const showCommentInput = ref(false);

function resetNewComment() {
  newComment.value = {
    userId: Number(typeof window !== 'undefined' ? window.sessionStorage.getItem("id") : 0),
    productId: productId,
    detail: '',
    username: String(typeof window !== 'undefined' ? window.sessionStorage.getItem("username") : ''),
  };
}
const isEditing = ref(false);

// 编辑模式下的临时数据
const editableProduct = ref({
  id: 0,
  title: "",
  price: 0,
  rate: 0,
  description: "",
  cover: "",
  detail: "",
  specifications: [] as { id: number; productId: number; item: string; value: string }[],
  category: "",
  sales: "",
});

// 是否显示编辑卡片
const displayEditCard = ref(false);

// 当前规格输入
const currentSpec = ref({
  item: "",
  value: "",
});

// 添加规格
function addSpecification() {
  if (currentSpec.value.item && currentSpec.value.value) {
    editableProduct.value.specifications.push({
      id: 0, // 默认值
      productId: productId, // 当前商品 ID
      item: currentSpec.value.item,
      value: currentSpec.value.value,
    });
    currentSpec.value = { item: "", value: "" };
  }
}

// 移除规格
function removeSpecification(index: number) {
  editableProduct.value.specifications.splice(index, 1);
}

// 获取商品信息的函数
async function fetchProductInfo() {
  try {
    const response = await getProduct(productId);

    if (response && response.data.data) {
      const rawProduct = response.data.data;

      // 处理规格参数，确保格式一致
      const specifications = Array.isArray(rawProduct.specifications)
          ? rawProduct.specifications
          : Object.entries(rawProduct.specifications).map(([key, value]) => ({
            id: 0, // 默认值
            productId: productId, // 当前商品 ID
            item: key,
            value: value,
          }));
      product.value = { ...rawProduct, specifications };
      editableProduct.value = { ...product.value }; // 初始化编辑模式的数据
    } else {
      throw new Error("Invalid response format");
    }
  } catch (err) {
    console.error("Error fetching product info:", err);
    error.value = "商品信息获取失败";
    ElMessage.error("加载商品信息失败");
  }
}

// 获取商品库存信息的函数
async function fetchProductAmountInfo() {
  try {

    const response = await getProductAmount(productId);

    if (response && response.data.data) {
      stockpile.value = response.data.data; // 解析 data 字段
    } else {
      throw new Error("Invalid response format");
    }
  } catch (err) {
    console.error("Error fetching product info:", err);
    // error.value = "商品库存信息获取失败";
    stockpile.value = {
      amount: 0,     // 总库存设为 0
      frozen: 0,     // 冻结库存设为 0
    };
  }

}

function toStockEdit() {
  router.push({ name: "StockEdit", params: { id: productId } });
}

// 在组件挂载时加载商品信息
onMounted(() => {
  fetchProductInfo();
  fetchProductAmountInfo();
  fetchComments(); // 新增这一行
});

// 切换编辑模式
const toggleEditMode = () => {
  if (displayEditCard.value) {
    // 取消编辑时还原原始数据
    Object.assign(editableProduct.value, product.value);
  }
  displayEditCard.value = !displayEditCard.value;
};

// 更新商品数据
const updateProductInfo = async () => {
  try {
    const payload = {
      id: editableProduct.value.id,
      title: editableProduct.value.title,
      price: Number(editableProduct.value.price),
      rate: Number(editableProduct.value.rate),
      description: editableProduct.value.description || "",
      cover: editableProduct.value.cover || "",
      detail: editableProduct.value.detail || "",
      category: editableProduct.value.category,
      // 确保 specifications 的格式与后端一致
      specifications: editableProduct.value.specifications.map((spec) => ({
        id: spec.id || 0, // 使用现有 id 或默认值
        productId: spec.productId || productId, // 使用现有 productId 或当前商品 ID
        item: spec.item,
        value: spec.value,
      })),
    };

    const response = await updateProduct(payload);

    if (response.data.code === "200") {
      Object.assign(product.value, editableProduct.value); // 更新主数据
      displayEditCard.value = false; // 关闭编辑模式
      ElMessage.success(response.data.msg || "更新成功");
    } else {
      ElMessage.error(response.data.msg || "更新失败");
    }
  } catch (error: any) {
    console.error("商品信息更新失败", error);
    ElMessage.error(error.response?.data?.msg || "网络错误，请稍后再试");
  }
};

// 图片上传处理
function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    editableProduct.value.cover = URL.createObjectURL(file); // 生成临时图片 URL
  }
}
// 添加到购物车
const handleAddToCart = async () => {
  try {
    const response = await addToCart(String(productId), 1); // 默认添加数量为 1
    if (response.data.code === "200") {
      ElMessage.success("已添加至购物车");
    } else {
      ElMessage.error(response.data.msg || "添加至购物车失败");
    }
  } catch (err) {
    ElMessage.error("添加至购物车失败");
    console.error(err);
  }
};
// 新增点赞处理函数
const handleLikeProduct = async () => {
  if (isLiking.value) return; // 避免重复点击
  isLiking.value = true;

  try {
    const response = await likeProduct(productId);
    if (response.data.code === "200") {
      // 更新本地商品信息中的点赞数
      if (product.value) {
        product.value.likes += 1;
      }
      ElMessage.success("点赞成功！");
    } else {
      ElMessage.error(response.data.msg || "点赞失败");
    }
  } catch (error: any) {
    console.error("点赞失败", error);
    ElMessage.error(error.response?.data?.msg || "网络错误，请稍后再试");
  } finally {
    isLiking.value = false;
  }
};

const score = ref<number | null>(null)
const submitEvaluation = async () => {
  if (score.value === null || score.value < 1 || score.value > 5) {
    ElMessage.warning('请选择1-5之间的评分')
    return
  }

  try {
    const res = await evaluateProduct(productId, score.value)
    if (res.data.code === '200') {
      ElMessage.success('评分成功！')
      fetchProductInfo();
    } else {
      ElMessage.error(res.data.msg || '评分失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后再试')
    console.error(error)
  }
}

// 获取该商品所有评论
async function fetchComments() {
  try {
    const response = await getCommentsByProductId(productId);
    if (response.data.code === "200") {
      comments.value = response.data.data || [];

      // 检查是否已有当前用户的评论，用于判断是新增还是更新
      const userId = Number(typeof window !== 'undefined' ? window.sessionStorage.getItem("id") : 0);
      const myComment = comments.value.find(c => c.userId === userId);
      if (myComment) {
        newComment.value = { ...myComment };
        isEditing.value = true;
      } else {
        newComment.value.detail = '';
        isEditing.value = false;
      }
    }
  } catch (err) {
    console.error("获取评论失败", err);
  }
}

// 提交评论
async function submitComment() {
  if (!newComment.value.detail.trim()) {
    ElMessage.warning('请输入评论内容');
    return;
  }

  try {
    const response = await addComment(newComment.value);
    if (response.data.code === '200') {
      ElMessage.success('评论成功');
      resetNewComment();
      showCommentInput.value = false; // 提交后隐藏输入框
      fetchComments();
    } else {
      ElMessage.error(response.data.msg || '评论失败');
    }
  } catch (err) {
    console.error('提交评论失败', err);
    ElMessage.error('网络错误，请稍后再试');
  }
}

// 删除评论
async function removeComment(comment: CommentVO) {
  try {
    const response = await deleteComment(comment);
    if (response.data.code === "200") {
      ElMessage.success("评论删除成功");
      fetchComments(); // 刷新评论列表
    } else {
      ElMessage.error(response.data.msg || "删除失败");
    }
  } catch (err) {
    console.error("删除评论失败", err);
    ElMessage.error("网络错误，请稍后再试");
  }
}

const isFavorited = ref(false)
const favorProductIds = ref<number[]>([])

// 获取当前用户
const getCurrentUser = () => {
  if (typeof window !== 'undefined') {
    return window.sessionStorage.getItem("username");
  }
  return null;
};

const currentUser = getCurrentUser();

const user = ref<{
  id: number | string;
}>({
  id: ''
})

onMounted(async () => {
  if (!currentUser) {
    ElMessage.error("请先登录")
    return
  }

  try {
    const res = await userInfo(currentUser)
    user.value.id = res.data.data.id
    console.log('用户ID:', user.value.id)
    await checkFavoriteStatus()
  } catch (err) {
    console.error("获取用户信息失败", err)
    ElMessage.error("无法获取用户信息，请重新登录")
  }
})

// 检查是否已收藏
const checkFavoriteStatus = async () => {
  if (!user.value.id) {
    console.log("用户ID不存在，无法检查收藏状态")
    return
  }

  try {
    const ids = await findFavor(Number(user.value.id))
    favorProductIds.value = ids
    isFavorited.value = ids.includes(productId)
  } catch (err) {
    console.error('无法获取收藏状态', err)
  }
}

// 切换收藏状态
const toggleFavorite = async () => {
  if (!user.value.id) {
    ElMessage.warning("请先登录")
    return
  }

  const userId = Number(user.value.id)

  if (isFavorited.value) {
    await deleteFavor({ userId, productId })
    ElMessage.success('已取消收藏')
    isFavorited.value = false
    favorProductIds.value = favorProductIds.value.filter(id => id !== productId)
  } else {
    await addFavor({ userId, productId })
    ElMessage.success('已加入收藏')
    isFavorited.value = true
    favorProductIds.value.push(productId)
  }
}

</script>

<template>
  <div class="book-detail-page">
    <!-- 返回按钮 -->
    <div class="page-header">
      <el-button @click="router.back()" class="back-button" type="text">
        <el-icon><Back /></el-icon>
        <span>返回</span>
      </el-button>
    </div>

    <!-- 主要内容区域 -->
    <div v-if="product" class="book-main-content">
      <div class="book-container">
        <!-- 书籍封面和基本信息 -->
        <div class="book-intro-section">
          <!-- 左侧封面区域 -->
          <div class="book-cover-area">
            <div class="book-cover-box">
              <el-image
                  :src="product.cover"
                  :alt="product.title"
                  class="book-cover-img"
                  fit="cover"
                  :preview-src-list="[product.cover]"
                  hide-on-click-modal
              >
                <template #placeholder>
                  <div class="image-placeholder">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="book-cover-label" v-if="product.sales > 1000">畅销</div>
            </div>

            <!-- 封面操作按钮 -->
            <div class="cover-actions-box">
              <el-button
                  :class="['collect-button', { 'collected': isFavorited }]"
                  @click="toggleFavorite"
                  size="large"
                  round
              >
                <el-icon class="collect-icon">
                  <StarFilled v-if="isFavorited" />
                  <Star v-else />
                </el-icon>
                <span>{{ isFavorited ? '已收藏' : '加入收藏' }}</span>
              </el-button>

              <el-button
                  class="like-button"
                  @click="handleLikeProduct"
                  :disabled="isLiking"
                  size="large"
                  round
              >
                <el-icon class="like-icon"><ChatDotRound /></el-icon>
                <span>推荐</span>
                <span class="like-count">{{ product.likes || 0 }}</span>
              </el-button>
            </div>
          </div>

          <!-- 右侧书籍信息 -->
          <div class="book-info-area">
            <!-- 标题信息 -->
            <div class="title-section">
              <h1 class="main-title">{{ product.title }}</h1>
              <div class="title-meta">
                <span class="category-badge">{{ product.category }}</span>
                <span class="sales-info">销量: {{ product.sales || 0 }}</span>
              </div>
            </div>

            <!-- 评分价格区域 -->
            <div class="price-rating-card">
              <div class="price-box">
                <div class="price-label">价格</div>
                <div class="current-price">¥{{ product.price.toFixed(2) }}</div>
              </div>

              <div class="rating-box">
                <div class="rating-label">评分</div>
                <div class="rating-display">
                  <el-rate
                      v-model="product.rate"
                      disabled
                      :colors="['#ff9900', '#ff9900', '#ff9900']"
                      class="book-rating"
                  />
                  <div class="rating-text">
                    <span class="score-number">{{ parseFloat(product.score).toFixed(2) }}</span>
                    <span class="score-total">/5.0</span>
                    <span class="rate-count">({{ product.scoreNum }}人评分)</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 作品简介 -->
            <div class="description-card">
              <h3 class="section-title">
                <el-icon><Reading /></el-icon>
                作品简介
              </h3>
              <div class="description-content">
                <p>{{ product.description }}</p>
              </div>
            </div>

            <!-- 主要操作按钮 -->
            <div class="main-actions">
              <el-button
                  type="primary"
                  @click="handleAddToCart"
                  :disabled="!product || stockpile.amount <= 0"
                  class="cart-action-btn"
                  size="large"
              >
                <el-icon class="cart-icon"><ShoppingCart /></el-icon>
                加入购物车
              </el-button>

              <el-button
                  type="success"
                  class="buy-action-btn"
                  size="large"
              >
                <el-icon class="buy-icon"><Wallet /></el-icon>
                立即购买
              </el-button>

              <el-button
                  type="info"
                  class="try-read-btn"
                  size="large"
              >
                <el-icon class="read-icon"><Reading /></el-icon>
                试读
              </el-button>
            </div>

            <!-- 评分区域 -->
            <div class="user-rating-section">
              <div class="rating-title">
                <el-icon><Star /></el-icon>
                我的评分
              </div>
              <div class="rating-input-area">
                <div class="rating-control">
                  <el-rate
                      v-model="score"
                      :max="5"
                      :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                      class="user-rating"
                  />
                  <el-button
                      type="primary"
                      @click="submitEvaluation"
                      size="small"
                      class="submit-rating"
                  >
                    提交评分
                  </el-button>
                </div>
                <div class="rating-stats">
                  <span class="average-score">综合评分: {{ parseFloat(product.score).toFixed(2) }}</span>
                  <span class="divider">|</span>
                  <span class="rating-count">评分人次: {{ product.scoreNum }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 详情和规格区域 -->
        <div class="detail-section-wrapper">
          <!-- 作品详情 -->
          <div class="book-detail-card">
            <div class="detail-header">
              <h2>
                <el-icon><Document /></el-icon>
                作品详情
              </h2>
            </div>
            <div class="detail-content">
              <div class="content-text">
                {{ product.detail }}
              </div>
            </div>
          </div>

          <!-- 作品信息表格 -->
          <div class="specifications-card">
            <div class="spec-header">
              <h2>
                <el-icon><InfoFilled /></el-icon>
                作品信息
              </h2>
            </div>
            <div class="spec-content">
              <el-table
                  :data="product.specifications"
                  :show-header="false"
                  class="book-spec-table"
              >
                <el-table-column width="120" align="right">
                  <template #default="{ row }">
                    <span class="spec-item-label">{{ row.item }}：</span>
                  </template>
                </el-table-column>
                <el-table-column>
                  <template #default="{ row }">
                    <span class="spec-item-value">{{ row.value }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <!-- 管理员操作区域 -->
          <div v-if="isAdmin" class="admin-section">
            <div class="admin-header">
              <h3>
                <el-icon><Setting /></el-icon>
                管理员操作
              </h3>
            </div>

            <!-- 库存信息 -->
            <div v-if="stockpile" class="stock-info-card">
              <div class="stock-header">
                <h4>库存信息</h4>
                <el-button type="primary" @click="toStockEdit" size="small">
                  编辑库存
                </el-button>
              </div>
              <div class="stock-content">
                <div class="stock-item">
                  <span class="stock-label">总库存</span>
                  <span class="stock-value">{{ stockpile.amount }}</span>
                </div>
                <div class="stock-item">
                  <span class="stock-label">冻结库存</span>
                  <span class="stock-value">{{ stockpile.frozen }}</span>
                </div>
                <div class="stock-item">
                  <span class="stock-label">可售库存</span>
                  <span class="stock-value">{{ stockpile.amount - stockpile.frozen }}</span>
                </div>
              </div>
            </div>

            <!-- 编辑按钮 -->
            <div class="admin-actions">
              <el-button type="primary" @click="toggleEditMode" class="edit-product-btn">
                <el-icon><Edit /></el-icon>
                编辑商品信息
              </el-button>
            </div>
          </div>

          <!-- 编辑模式卡片 -->
          <div v-if="displayEditCard" class="edit-card">
            <div class="edit-header">
              <h3><el-icon><Edit /></el-icon>编辑商品信息</h3>
              <el-button type="text" @click="toggleEditMode">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>

            <div class="edit-form-container">
              <el-form>
                <el-form-item label="商品名称">
                  <el-input v-model="editableProduct.title" placeholder="请输入商品名称" />
                </el-form-item>

                <el-form-item label="商品价格">
                  <el-input-number
                      v-model="editableProduct.price"
                      :min="0"
                      :precision="2"
                      :step="100"
                      placeholder="请输入商品价格"
                      style="width: 100%"
                  />
                </el-form-item>

                <el-form-item label="商品评分">
                  <el-input-number
                      v-model="editableProduct.rate"
                      :min="0"
                      :max="5"
                      :step="0.1"
                      :precision="1"
                      placeholder="0-5分"
                      style="width: 100%"
                  />
                </el-form-item>

                <el-form-item label="商品描述">
                  <el-input
                      v-model="editableProduct.description"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入商品描述"
                  />
                </el-form-item>

                <el-form-item label="商品详情">
                  <el-input
                      v-model="editableProduct.detail"
                      type="textarea"
                      :rows="5"
                      placeholder="请输入商品详细说明"
                  />
                </el-form-item>

                <el-form-item label="商品照片">
                  <div class="image-upload-section">
                    <input
                        type="file"
                        accept="image/*"
                        @change="onFileChange"
                        class="image-upload-input"
                    />
                    <div class="image-preview" v-if="editableProduct.cover">
                      <el-image
                          :src="editableProduct.cover"
                          :alt="editableProduct.title"
                          class="preview-image"
                          fit="cover"
                      />
                    </div>
                  </div>
                </el-form-item>

                <!-- 规格参数 -->
                <el-form-item label="规格参数">
                  <div class="spec-form">
                    <el-input
                        v-model="currentSpec.item"
                        placeholder="参数名"
                        class="spec-input"
                    />
                    <el-input
                        v-model="currentSpec.value"
                        placeholder="参数值"
                        class="spec-input"
                    />
                    <el-button
                        type="primary"
                        @click="addSpecification"
                        class="add-spec-btn"
                    >
                      添加规格
                    </el-button>
                  </div>

                  <div class="specifications-list">
                    <el-table
                        :data="editableProduct.specifications"
                        border
                        class="spec-table"
                    >
                      <el-table-column prop="item" label="参数名" width="150" />
                      <el-table-column prop="value" label="参数值" />
                      <el-table-column label="操作" width="80">
                        <template #default="scope">
                          <el-button
                              type="danger"
                              size="small"
                              @click="removeSpecification(scope.$index)"
                          >
                            删除
                          </el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </el-form-item>

                <el-form-item>
                  <el-button type="success" @click="updateProductInfo" class="save-btn">
                    保存修改
                  </el-button>
                  <el-button @click="toggleEditMode" class="cancel-btn">
                    取消
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </div>

        <!-- 评论区 -->
        <div class="comments-section">
          <div class="comments-header">
            <div class="comments-title">
              <h2>
                <el-icon><ChatLineRound /></el-icon>
                读者评论
                <span class="comment-count">({{ comments.length }})</span>
              </h2>
            </div>
            <div class="comments-action">
              <el-button
                  type="primary"
                  @click="showCommentInput = !showCommentInput"
                  class="write-comment-btn"
                  :icon="Edit"
              >
                发表评论
              </el-button>
            </div>
          </div>

          <!-- 评论输入区 -->
          <div v-if="showCommentInput" class="comment-input-area">
            <div class="comment-editor">
              <el-input
                  v-model="newComment.detail"
                  type="textarea"
                  :rows="4"
                  placeholder="分享您的阅读感受，留下宝贵的评论..."
                  maxlength="500"
                  show-word-limit
                  class="comment-textarea"
              />
              <div class="editor-actions">
                <el-button
                    type="primary"
                    @click="submitComment"
                    class="submit-comment-btn"
                >
                  {{ isEditing ? '更新评论' : '发表评论' }}
                </el-button>
                <el-button @click="showCommentInput = false" class="cancel-comment-btn">
                  取消
                </el-button>
              </div>
            </div>
          </div>

          <!-- 评论列表 -->
          <div v-if="comments.length > 0" class="comments-list">
            <div v-for="(comment, index) in comments" :key="index" class="comment-item">
              <div class="comment-main">
                <!-- 用户信息 -->
                <div class="comment-user">
                  <el-avatar
                      :size="44"
                      :src="'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
                      class="user-avatar"
                  />
                  <div class="user-info">
                    <div class="username">{{ comment.username }}</div>
                    <div class="comment-time">刚刚</div>
                  </div>
                </div>

                <!-- 评论内容 -->
                <div class="comment-content">
                  <p>{{ comment.detail }}</p>
                </div>

                <!-- 评论操作 -->
                <div class="comment-actions">
                  <div class="action-buttons">
                    <el-button
                        v-if="comment.userId === getCurrentUserId()"
                        size="small"
                        type="danger"
                        @click="removeComment(comment)"
                        class="delete-comment-btn"
                    >
                      删除
                    </el-button>
                    <el-button size="small" type="text" class="reply-btn">
                      回复
                    </el-button>
                    <el-button size="small" type="text" class="like-comment-btn">
                      <el-icon><Thumb /></el-icon>
                      点赞
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="no-comments">
            <div class="empty-comments">
              <el-icon class="empty-icon"><ChatLineSquare /></el-icon>
              <p class="empty-text">暂无评论，快来发表第一条评论吧！</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else-if="error" class="error-state">
      <div class="error-content">
        <el-icon class="error-icon"><Warning /></el-icon>
        <div class="error-text">
          <h3>{{ error }}</h3>
          <p>请稍后再试或返回首页</p>
        </div>
        <el-button type="primary" @click="fetchProductInfo">重试</el-button>
      </div>
    </div>

    <div v-else class="loading-state">
      <div class="skeleton-container">
        <el-skeleton :rows="6" animated />
      </div>
    </div>
  </div>
</template>

<style scoped>
.book-detail-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
}

/* 返回按钮样式 */
.page-header {
  max-width: 1200px;
  margin: 0 auto 20px;
}

.back-button {
  padding: 8px 16px;
  font-size: 14px;
  color: #666;
  transition: all 0.3s;
}

.back-button:hover {
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
}

/* 主要内容容器 */
.book-main-content {
  max-width: 1200px;
  margin: 0 auto;
}

.book-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* 书籍介绍区域 */
.book-intro-section {
  display: flex;
  padding: 30px;
  gap: 40px;
  border-bottom: 1px solid #e8e8e8;
  background: linear-gradient(to right, #ffffff 0%, #f8fafc 100%);
}

/* 封面区域 */
.book-cover-area {
  flex: 0 0 280px;
}

.book-cover-box {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  margin-bottom: 20px;
}

.book-cover-img {
  width: 100%;
  height: 380px;
  display: block;
  transition: transform 0.3s ease;
}

.book-cover-img:hover {
  transform: scale(1.02);
}

.book-cover-label {
  position: absolute;
  top: 12px;
  left: 0;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 0 4px 4px 0;
  font-size: 12px;
  font-weight: 500;
}

.image-placeholder {
  width: 100%;
  height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #909399;
  font-size: 24px;
}

/* 封面操作按钮 */
.cover-actions-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.collect-button {
  width: 100%;
  background: #f5f7fa;
  border: 1px solid #e8e8e8;
  color: #666;
  transition: all 0.3s;
}

.collect-button:hover {
  background: #fff0f0;
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.collect-button.collected {
  background: linear-gradient(135deg, #fff0f0 0%, #ffeaea 100%);
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.collect-icon {
  margin-right: 6px;
}

.like-button {
  width: 100%;
  background: #f5f7fa;
  border: 1px solid #e8e8e8;
  color: #666;
}

.like-button:hover {
  background: #f0f9ff;
  border-color: #409eff;
  color: #409eff;
}

.like-count {
  margin-left: 6px;
  font-weight: 600;
}

/* 书籍信息区域 */
.book-info-area {
  flex: 1;
}

.title-section {
  margin-bottom: 24px;
}

.main-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0 0 12px 0;
  line-height: 1.3;
}

.title-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.category-badge {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
}

.sales-info {
  color: #666;
  font-size: 14px;
}

/* 价格评分卡片 */
.price-rating-card {
  display: flex;
  gap: 40px;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%);
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.price-box, .rating-box {
  flex: 1;
}

.price-label, .rating-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  display: block;
}

.current-price {
  font-size: 32px;
  font-weight: 700;
  color: #ff6b6b;
  line-height: 1;
}

.book-rating {
  margin-bottom: 6px;
}

.rating-text {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.score-number {
  font-size: 24px;
  font-weight: 700;
  color: #ff9900;
}

.score-total {
  color: #999;
  font-size: 14px;
}

.rate-count {
  color: #666;
  font-size: 13px;
  margin-left: 8px;
}

/* 描述卡片 */
.description-card {
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #409eff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.description-content {
  color: #555;
  line-height: 1.8;
  font-size: 14px;
}

/* 主要操作按钮 */
.main-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 30px;
}

.cart-action-btn {
  flex: 2;
  background: linear-gradient(135deg, #ffd166 0%, #ffb347 100%);
  border: none;
  color: #333;
  font-weight: 600;
  height: 48px;
  font-size: 16px;
}

.cart-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 180, 71, 0.3);
}

.buy-action-btn {
  flex: 2;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  border: none;
  color: white;
  font-weight: 600;
  height: 48px;
  font-size: 16px;
}

.buy-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 107, 107, 0.3);
}

.try-read-btn {
  flex: 1;
  background: linear-gradient(135deg, #a0aec0 0%, #cbd5e0 100%);
  border: none;
  color: white;
  font-weight: 600;
  height: 48px;
}

.cart-icon, .buy-icon, .read-icon {
  margin-right: 6px;
}

/* 用户评分区域 */
.user-rating-section {
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.rating-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.rating-input-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rating-control {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-rating {
  flex: 1;
}

.submit-rating {
  min-width: 100px;
}

.rating-stats {
  display: flex;
  gap: 16px;
  color: #666;
  font-size: 14px;
}

.divider {
  color: #ddd;
}

/* 详情和规格区域 */
.detail-section-wrapper {
  padding: 30px;
}

.book-detail-card,
.specifications-card,
.admin-section {
  margin-bottom: 30px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.detail-header,
.spec-header,
.admin-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.detail-header h2,
.spec-header h2,
.admin-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.detail-content {
  line-height: 1.8;
  color: #555;
  font-size: 15px;
}

/* 规格表格 */
.book-spec-table {
  border: none;
}

.book-spec-table :deep(.el-table__row) {
  background: transparent;
}

.book-spec-table :deep(.el-table__cell) {
  border: none;
  padding: 12px 0;
}

.spec-item-label {
  color: #666;
  font-weight: 500;
}

.spec-item-value {
  color: #333;
  font-weight: 400;
}

/* 管理员区域 */
.admin-section {
  background: #f8fafc;
}

.stock-info-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
}

.stock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.stock-header h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.stock-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stock-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s;
}

.stock-item:hover {
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.stock-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.stock-value {
  font-size: 24px;
  font-weight: 700;
  color: #409eff;
}

.admin-actions {
  display: flex;
  justify-content: center;
}

.edit-product-btn {
  padding: 12px 32px;
  font-size: 16px;
}

/* 编辑模式样式 */
.edit-card {
  margin-bottom: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: white;
}

.edit-header h3 {
  margin: 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.edit-form-container {
  padding: 24px;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #333;
}

.image-upload-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.image-upload-input {
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.image-upload-input:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.image-preview {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.spec-form {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;
}

.spec-input {
  flex: 1;
}

.add-spec-btn {
  white-space: nowrap;
  min-width: 100px;
}

.specifications-list {
  margin-top: 16px;
}

.spec-table {
  width: 100%;
}

.save-btn {
  padding: 12px 36px;
  font-size: 16px;
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  border: none;
  color: white;
}

.cancel-btn {
  padding: 12px 36px;
  font-size: 16px;
}

/* 评论区 */
.comments-section {
  padding: 0 30px 30px;
}

.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.comments-title h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 20px;
  color: #333;
}

.comment-count {
  color: #409eff;
  font-weight: 600;
}

.write-comment-btn {
  padding: 10px 24px;
}

/* 评论输入区 */
.comment-input-area {
  margin-bottom: 30px;
}

.comment-editor {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.comment-textarea :deep(.el-textarea__inner) {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  transition: all 0.3s;
}

.comment-textarea :deep(.el-textarea__inner:focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.submit-comment-btn {
  min-width: 100px;
}

/* 评论列表 */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e8e8e8;
  transition: all 0.3s;
}

.comment-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.comment-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  border: 2px solid #e8e8e8;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username {
  font-weight: 600;
  color: #333;
  font-size: 15px;
}

.comment-time {
  color: #999;
  font-size: 12px;
}

.comment-content {
  color: #555;
  line-height: 1.7;
  font-size: 14px;
  padding-left: 56px;
}

.comment-actions {
  padding-left: 56px;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.delete-comment-btn {
  margin-right: auto;
}

.reply-btn,
.like-comment-btn {
  color: #666;
  transition: color 0.3s;
}

.reply-btn:hover {
  color: #409eff;
}

.like-comment-btn:hover {
  color: #ff6b6b;
}

.like-comment-btn .el-icon {
  margin-right: 4px;
}

/* 无评论状态 */
.no-comments {
  padding: 60px 0;
  text-align: center;
}

.empty-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  color: #cbd5e0;
}

.empty-text {
  font-size: 16px;
  margin: 0;
}

/* 加载和错误状态 */
.error-state,
.loading-state {
  max-width: 1200px;
  margin: 100px auto;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
}

.error-icon {
  font-size: 64px;
  color: #ff6b6b;
}

.error-text h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.error-text p {
  margin: 0;
  color: #666;
}

.skeleton-container {
  background: white;
  padding: 30px;
  border-radius: 12px;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .book-intro-section {
    flex-direction: column;
    gap: 30px;
  }

  .book-cover-area {
    width: 280px;
    margin: 0 auto;
  }

  .cover-actions-box {
    flex-direction: row;
  }

  .main-actions {
    flex-wrap: wrap;
  }

  .price-rating-card {
    flex-direction: column;
    gap: 20px;
  }

  .stock-content {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .book-detail-page {
    padding: 12px;
  }

  .book-intro-section,
  .detail-section-wrapper,
  .comments-section {
    padding: 20px;
  }

  .main-title {
    font-size: 24px;
  }

  .current-price {
    font-size: 28px;
  }

  .stock-content {
    grid-template-columns: 1fr;
  }

  .comment-content,
  .comment-actions {
    padding-left: 0;
  }

  .spec-form {
    flex-direction: column;
  }

  .add-spec-btn {
    width: 100%;
  }
}
</style>
