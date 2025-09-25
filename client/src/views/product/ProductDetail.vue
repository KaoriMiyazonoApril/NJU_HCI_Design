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
const role = sessionStorage.getItem("role");
const isAdmin = computed(() => role === "MANAGER");
const username = sessionStorage.getItem("username");
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

const comments = ref<CommentVO[]>([]);
const newComment = ref<Omit<CommentVO, 'id'>>({
  userId: Number(sessionStorage.getItem("id")),
  productId: productId,
  detail: '',
  username: String(sessionStorage.getItem("username")),
});
function resetNewComment() {
  newComment.value = {
    userId: Number(sessionStorage.getItem("id")),
    productId: productId,
    detail: '',
    username: String(sessionStorage.getItem("username")),
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
      product.value.likes += 1;
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
      const myComment = comments.value.find(c => c === newComment.value);
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


const currentUser = sessionStorage.getItem("username")

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
  <el-main class="background">
  <!-- 返回按钮 -->
  <el-button @click="router.back()" type="primary" circle plain style="margin-bottom: 20px;">
    <el-icon><Back /></el-icon>
  </el-button>

  <!-- 商品详情内容 -->
  <el-main v-if="product" class="product-detail">
    <el-card shadow="always">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h1>{{ product.title }}</h1>
          <el-button
              :icon="isFavorited ? StarFilled : Star"
              circle
              :type="isFavorited ? 'danger' : 'default'"
              @click="toggleFavorite"
          >
          </el-button>
        </div>
      </template>


      <!-- 查看模式 -->
      <div v-if="!displayEditCard" class="product-content">
        <!-- 商品图片 -->
        <el-image :src="product.cover" :alt="product.title" class="product-image" fit="cover" />

        <!-- 商品基本信息 -->
        <div class="product-info">
          <p><strong>价格：</strong>￥{{ product.price.toFixed(2) }}</p>
          <p><strong>评分：</strong>{{ product.rate }}</p>
          <p><strong>描述：</strong>{{ product.description }}</p>
          <p><strong>详情：</strong>{{ product.detail }}</p>
          <p><strong>分类：</strong>{{ product.category }}</p>
          <p><strong>点赞数：</strong>{{ product.likes }}</p>
        </div>
        <!-- 添加点赞按钮 -->
        <el-button type="success" @click="handleLikeProduct" :disabled="isLiking">
          {{ isLiking ? '正在点赞...' : '点赞' }}
        </el-button>

        <div class="evaluate-section">
          <h4>请为该商品打分：</h4>
          <div class="rate-container">
            <el-rate v-model="score" :max="5" show-text />
            <el-button type="primary" @click="submitEvaluation">提交评分</el-button>
          </div>
        </div>
        <p><strong>综合评分：</strong>{{ parseFloat(product.score).toFixed(2) }}</p>
        <p><strong>评分人次：</strong>{{ product.scoreNum }}</p>

        <!-- 规格参数 -->
        <div class="specifications">
          <h2>规格参数</h2>
          <el-table :data="product.specifications" border style="margin-top: 10px">
            <el-table-column prop="item" label="参数名" width="150" />
            <el-table-column prop="value" label="参数值" />
          </el-table>
        </div>
        <!-- 库存信息 -->
        <div v-if="stockpile" class="stockpile">
          <h2>库存信息</h2>
          <el-table :data="[stockpile]" border style="width: 100%">
            <el-table-column prop="amount" label="总库存" />
            <el-table-column prop="frozen" label="冻结库存" />
          </el-table>
          <el-button v-if="isAdmin" @click="toStockEdit" type="primary">编辑库存</el-button>
          <!-- 仅管理员可见的编辑按钮 -->
          <el-button v-if="isAdmin" type="primary" @click="toggleEditMode">
            {{ displayEditCard ? "取消编辑" : "编辑商品信息" }}
          </el-button>
        </div>
        <div v-else>
          <p>库存信息加载失败</p>
        </div>
        <!-- 添加到购物车按钮 -->
        <el-button
            type="warning"
            @click="handleAddToCart"
            style="margin-top: 20px;"
            :disabled="!product || stockpile.amount <= 0"
        >
          添加到购物车
        </el-button>
        <!-- 评论区 -->
        <div class="comment-section">
          <h3>评论</h3>
          <el-input v-model="newComment.detail" type="textarea" :rows="3" placeholder="请输入您的评论..." />
          <el-button type="primary" @click="submitComment" style="margin-top: 10px;">
            {{ isEditing ? '更新评论' : '提交评论' }}
          </el-button>

          <div v-if="comments.length > 0" class="comment-list">
            <h4>已有评论：</h4>
            <div v-for="(comment, index) in comments" :key="index" class="comment-item">
              <p><strong>用户：{{ comment.username }}</strong></p>
              <p>{{ comment.detail }}</p>
              <el-button size="small" @click="removeComment(comment)">删除</el-button>
            </div>
          </div>
          <div v-else>
            <p>暂无评论</p>
          </div>
        </div>
      </div>

      <!-- 编辑模式 -->
      <div v-else class="edit-card">
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
            <input type="file" accept="image/*" @change="onFileChange" />
            <el-image
                v-if="editableProduct.cover"
                :src="editableProduct.cover"
                :alt="editableProduct.title"
                class="preview-image"
                fit="cover"
            />
          </el-form-item>

          <!-- 规格参数 -->
          <el-form-item label="规格参数">
            <div class="spec-form">
              <el-input
                  v-model="currentSpec.item"
                  placeholder="参数名"
                  style="width: 200px"
              />
              <el-input
                  v-model="currentSpec.value"
                  placeholder="参数值"
                  style="width: 200px; margin-left: 10px"
              />
              <el-button
                  type="primary"
                  @click="addSpecification"
                  style="margin-left: 10px"
              >
                添加
              </el-button>
            </div>

            <el-table
                :data="editableProduct.specifications"
                border
                style="margin-top: 10px"
            >
              <el-table-column prop="item" label="参数名" width="150" />
              <el-table-column prop="value" label="参数值" />
              <el-table-column label="操作" width="60">
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
          </el-form-item>

          <el-form-item>
            <el-button type="success" @click="updateProductInfo">保存</el-button>
            <el-button @click="toggleEditMode">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </el-main>

  <!-- 加载中状态 -->
  <div v-else-if="error" class="error">
    <h1>{{ error }}</h1>
  </div>

  <!-- 错误提示 -->
  <div v-else class="loading">
    <h1>加载中...</h1>
  </div>
  </el-main>
</template>


<style scoped>
.background {
  position: relative;
  background-image: url("../../assets/book1.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 30px;
  min-height: 100vh;
}
/* 商品详情容器 */
/* 商品详情容器 - 玻璃材质核心样式 */
.product-detail {
  width: 800px;
  margin: 40px auto;
  padding: 20px;
  box-sizing: border-box;

  /* 玻璃拟态效果 */
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}


.el-card {
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
}


/* 卡片标题行 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 返回按钮美化 */
.el-button--primary.is-plain {
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}
.el-button--primary.is-plain:hover {
  transform: scale(1.1);
}

/* 所有按钮统一圆角、过渡效果 */
.el-button {
  border-radius: 24px;
  font-weight: 500;
  padding-left: 18px;
  padding-right: 18px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

/* 按钮悬停放大效果 */
.el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

/* 点赞按钮特别样式 */
.el-button--success {
  background-color: #42b983;
  color: white;
}

/* 警告按钮样式 */
.el-button--warning {
  background-color: #f9c74f;
  color: #333;
}

/* 主按钮样式（如编辑按钮） */
.el-button--primary {
  background-color: #4a90e2;
  color: white;
}

/* 成功按钮（保存按钮） */
.el-button--success {
  background-color: #50c878;
  color: white;
}

/* 取消按钮浅灰色 */
.el-button--default {
  background-color: #e0e0e0;
  color: #333;
}

/* 商品图片样式 */
.product-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* 商品信息区域 */
.product-info {
  font-size: 16px;
  line-height: 1.6;
  background-color: #fafafa;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #eee;
}

.product-info strong {
  color: #333;
}

/* 规格参数区域 */
.specifications h2,
.stockpile h2,
.comment-section h3 {
  margin-top: 20px;
  font-size: 20px;
  color: #333;
  font-weight: bold;
}

/* 编辑表单中的输入框 */
.el-form-item__content .el-input,
.el-form-item__content .el-input-number {
  width: 100%;
}

/* 表格样式增强 */
.el-table {
  border-radius: 8px;
  overflow: hidden;
}

/* 评论区样式 */
.comment-section {
  margin-top: 20px;
}

.comment-list {
  margin-top: 10px;
}

.comment-item {
  background-color: #f9f6f2;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #eee;
  margin-bottom: 10px;
}

/* 响应式适配 */
@media (max-width: 900px) {
  .product-detail {
    width: 95%;
  }

  .product-image {
    height: 220px;
  }
}

.evaluate-section {
  margin-top: 20px;
}

.rate-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

/* 如果需要调整按钮和评分之间的间距 */
.rate-container .el-button {
  margin-left: 20px;
}

</style>

