<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { getAllCarts, deleteCartItem, updateCartItemQuantity } from "../../api/cart";
import {CancelOrder, CheckoutOrders} from "../../api/order.ts"; // 假设这是提交订单的 API 方法
import { Back } from "@element-plus/icons-vue";

const router = useRouter();
const cartItems = ref<any[]>([]);
const totalAmount = ref<number>(0);
const orderItems = ref<any[]>([]);
const orderTotalAmount = ref<number>(0);
// 弹窗相关状态
const isDialogVisible = ref(false);
const checkOrderMsg = ref(false);

const shippingAddress = ref({
  name: "",
  phone: "",
  postalCode: "",
  address: "",
});
const paymentMethod = ref("");
const currentOrderId = ref<string | null>(null);
// 获取购物车商品列表
const fetchCartItems = async () => {
  try {
    const response = await getAllCarts();
    if (response.data.code === "200") {
      cartItems.value = response.data.data.items || [];
      totalAmount.value = response.data.data.totalAmount || 0;
    } else {
      ElMessage.error(response.data.msg || "获取购物车信息失败");
    }
  } catch (err) {
    ElMessage.error("获取购物车信息失败");
    console.error(err);
  }
};

// 删除购物车商品
const handleDeleteCartItem = async (cartItemId: string) => {
  try {
    const response = await deleteCartItem(cartItemId);
    if (response.data.code === "200") {
      cartItems.value = cartItems.value.filter(item => item.cartItemId !== cartItemId);
      ElMessage.success("删除成功");
    } else {
      ElMessage.error(response.data.msg || "删除失败");
    }
  } catch (err) {
    ElMessage.error("删除失败");
    console.error(err);
  }
  await fetchCartItems();
};

// 修改购物车商品数量
const handleChangeQuantity = async (cartItemId: string, quantity: number) => {
  try {
    const response = await updateCartItemQuantity(cartItemId, quantity);
    if (response.data.code === "200") {
      ElMessage.success("修改数量成功");
      await fetchCartItems(); // 刷新数据
    } else {
      ElMessage.error(response.data.msg || "修改数量失败");
    }
  } catch (err) {
    ElMessage.error("修改数量失败");
    console.error(err);
  }
};

// 提交订单
const handleSubmitOrder = async () => {
  // 检查是否有商品
  if (cartItems.value.length === 0) {
    ElMessage.warning("购物车为空，无法提交订单！");
    return;
  }

  // 打开弹窗
  isDialogVisible.value = true;
};

// 确认提交订单
const confirmSubmitOrder = async () => {
  try {
    const requestData = {
      cartItemIds: cartItems.value.map(item => item.cartItemId),
      shipping_address: shippingAddress.value,
      paymentMethod: paymentMethod.value,
    };
    console.log(requestData);
    const response = await CheckoutOrders(requestData);
    if (response.code == 200) {
      ElMessage.success("订单提交成功！");
      isDialogVisible.value = false; // 关闭弹窗
      checkOrderMsg.value = true;
      currentOrderId.value = response.data.orderId;
      orderTotalAmount.value = response.data.totalAmount;
      // 保存订单商品明细
      orderItems.value = cartItems.value.map(item => ({
        title: item.title, // 商品名称
        price: item.price, // 单价
        quantity: item.quantity, // 数量
        total: item.price * item.quantity, // 总价
      }));

      await fetchCartItems(); // 刷新购物车
    } else {
      ElMessage.error(response.msg || "订单提交失败");
    }
  } catch (err) {
    ElMessage.error("订单提交失败");
    console.error(err);
  }
};
// 取消订单
const handleCancelOrder = async () => {
  if (!currentOrderId.value) {
    ElMessage.warning("未找到当前订单信息！");
    return;
  }

  try {
    const response = await CancelOrder(currentOrderId.value);
    if (response.code == 200) {
      ElMessage.success("订单已取消！");
      checkOrderMsg.value = false;
      currentOrderId.value = null;
      await fetchCartItems();
    } else {
      ElMessage.error(response.msg || "取消订单失败");
    }
  } catch (err) {
    ElMessage.error("取消订单失败");
    console.error(err);
  }
};

function toBackPage() {
  router.back();
}
function toOrderPage(orderId: string | null) {
  if (!orderId) {
    ElMessage.warning("订单ID无效！");
    return;
  }
  router.push({
    name: 'Order',  // 使用路由名称而不是路径
    params: { orderId: orderId }
  });
}
onMounted(() => {
  fetchCartItems();
});
</script>

<template>
  <el-main class="background">

    <!-- 返回按钮 -->
    <el-button class="back-button" @click="toBackPage()" type="text" >
        <el-icon><Back /></el-icon>
        <span>返回</span>
    </el-button>

    <div class="cart-container">
      <h1 class="cart-title">您的购物车</h1>

      <div v-if="cartItems.length === 0" class="empty-cart">
        购物车为空，请添加商品！
      </div>

      <!-- 商品列表 -->
      <div v-else class="cart-items">
        <div
            v-for="item in cartItems"
            :key="item.cartItemId"
            class="cart-item"
        >
          <img :src="item.cover" alt="商品封面" class="cart-item-image" />

          <div class="cart-item-info">
            <h3>{{ item.title }}</h3>

            <p class="price">单价：{{ item.price }} 元</p>

            <div class="quantity-row">
              数量：
              <el-input-number
                  v-model="item.quantity"
                  :min="1"
                  size="small"
                  @change="(value)=>handleChangeQuantity(item.cartItemId,value)"
              />
            </div>
          </div>

          <el-button
              type="danger"
              size="small"
              @click="handleDeleteCartItem(item.cartItemId)"
              class="delete-btn"
          >
            删除
          </el-button>
        </div>
      </div>

      <!-- 总金额 -->
      <div v-if="cartItems.length > 0" class="total-amount">
        总金额：<span class="amount">{{ totalAmount }} 元</span>
      </div>

      <!-- 提交订单按钮 -->
      <div class="submit-order">
        <el-button type="primary" size="large" @click="handleSubmitOrder">
          提交订单
        </el-button>
      </div>
    </div>

    <!-- 填写订单弹窗 -->
    <el-dialog v-model="isDialogVisible" title="填写订单信息" width="55%">
      <el-form label-width="110px" class="dialog-form">

        <el-form-item label="收货人姓名">
          <el-input v-model="shippingAddress.name"></el-input>
        </el-form-item>

        <el-form-item label="联系电话">
          <el-input v-model="shippingAddress.phone"></el-input>
        </el-form-item>

        <el-form-item label="邮政编码">
          <el-input v-model="shippingAddress.postalCode"></el-input>
        </el-form-item>

        <el-form-item label="详细地址">
          <el-input v-model="shippingAddress.address"></el-input>
        </el-form-item>

        <el-form-item label="支付方式">
          <el-select v-model="paymentMethod">
            <el-option label="支付宝" value="ALIPAY" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="isDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmSubmitOrder">确认提交</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 确认订单弹窗 -->
    <el-dialog v-model="checkOrderMsg" title="确认订单信息" width="55%">
      <el-form label-width="110px">

        <el-form-item label="收货人姓名"><strong>{{ shippingAddress.name }}</strong></el-form-item>
        <el-form-item label="联系电话"><strong>{{ shippingAddress.phone }}</strong></el-form-item>
        <el-form-item label="邮政编码"><strong>{{ shippingAddress.postalCode }}</strong></el-form-item>
        <el-form-item label="详细地址"><strong>{{ shippingAddress.address }}</strong></el-form-item>

        <el-form-item label="订单金额">
          <strong class="confirm-price">{{ orderTotalAmount.toFixed(2) }} 元</strong>
        </el-form-item>

        <h3>商品明细</h3>

        <el-table :data="orderItems">
          <el-table-column prop="title" label="商品名称" width="200" />
          <el-table-column prop="price" label="单价（元）" />
          <el-table-column prop="quantity" label="数量" width="80" />
          <el-table-column prop="total" label="总价（元）" />
        </el-table>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancelOrder">取消订单</el-button>
          <el-button type="primary" @click="toOrderPage(currentOrderId)">确认并支付</el-button>
        </div>
      </template>
    </el-dialog>

  </el-main>
</template>

<style scoped>

.background {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-image: url("../../assets/book1.jpg");
  background-size: cover;
  padding: 40px 20px;
  min-height: 100vh;
  position: relative;
}

.back-button {
  position: absolute;
  top: 30px;
  left: 30px;
  backdrop-filter: blur(6px);
  padding: 8px 16px;
  font-size: 14px;
  color: #666;
  transition: all 0.3s;
}

.back-button:hover {
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
}

/* 购物车容器 */
.cart-container {
  width: 100%;
  max-width: 850px;
  background: rgba(255, 255, 255, 0.92);
  padding: 30px;
  border-radius: 18px;
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.15);
}

.cart-title {
  margin-bottom: 20px;
  text-align: center;
}

/* 商品项 */
.cart-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #fafafa;
  border-radius: 12px;
  gap: 15px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.cart-item-image {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: 10px;
}

.cart-item-info {
  flex: 1;
}

.price {
  color: #333;
  margin-bottom: 6px;
}

.quantity-row {
  margin-top: 4px;
}

/* 删除按钮 */
.delete-btn {
  min-width: 70px;
}

/* 总金额 */
.total-amount {
  margin-top: 25px;
  font-size: 20px;
  text-align: right;
}

.amount {
  font-weight: bold;
  color: #409eff;
}

/* 提交订单按钮 */
.submit-order {
  margin-top: 25px;
  text-align: center;
}

/* 弹窗表单 */
.dialog-form .el-form-item {
  margin-bottom: 16px;
}

/* 弹窗底部按钮对齐 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 确认金额更突出 */
.confirm-price {
  color: #f56c6c;
  font-size: 18px;
}

</style>
