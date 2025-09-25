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
  <el-button @click="toBackPage()" type="primary" circle plain>
    <el-icon><Back /></el-icon>
  </el-button>
  <div class="cart-container">
    <h1>您的购物车</h1>
    <div v-if="cartItems.length === 0" class="empty-cart">
      购物车为空，请添加商品！
    </div>
    <div v-else class="cart-items">
      <div v-for="item in cartItems" :key="item.cartItemId" class="cart-item">
        <img :src="item.cover" alt="商品封面" class="cart-item-image" />
        <div class="cart-item-info">
          <h3>{{ item.title }}</h3>
          <p>价格：{{ item.price }} 元</p>
          <p>
            数量：
            <input
                type="number"
                :value="item.quantity"
                @change="(e) => handleChangeQuantity(item.cartItemId, parseInt(e.target.value))"
                min="1"
            />
          </p>
        </div>
        <button @click="handleDeleteCartItem(item.cartItemId)" class="delete-btn">删除</button>
      </div>
    </div>
    <div v-if="cartItems.length > 0" class="total-amount">
      总金额：{{ totalAmount }} 元

    </div>

  </div>
  <el-button type="primary" @click="handleSubmitOrder">提交订单</el-button>
  <!-- 弹窗 -->
  <el-dialog v-model="isDialogVisible" title="填写订单信息" width="60%">
    <el-form label-width="100px">
      <el-form-item label="收货人姓名">
        <el-input v-model="shippingAddress.name" placeholder="请输入收货人姓名"></el-input>
      </el-form-item>
      <el-form-item label="联系电话">
        <el-input v-model="shippingAddress.phone" placeholder="请输入联系电话"></el-input>
      </el-form-item>
      <el-form-item label="邮政编码">
        <el-input v-model="shippingAddress.postalCode" placeholder="请输入邮政编码"></el-input>
      </el-form-item>
      <el-form-item label="详细地址">
        <el-input v-model="shippingAddress.address" placeholder="请输入详细地址"></el-input>
      </el-form-item>
      <el-form-item label="支付方式">
        <el-select v-model="paymentMethod" placeholder="请选择支付方式">
          <el-option label="ALIPAY" value="ALIPAY"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="isDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSubmitOrder">确认提交</el-button>
      </span>
    </template>
  </el-dialog>

  <el-dialog v-model="checkOrderMsg" title="确认订单信息" width="60%">
    <el-form label-width="100px">
      <el-form-item label="收货人姓名">
        <strong>{{shippingAddress.name}}</strong>
      </el-form-item>
      <el-form-item label="联系电话">
        <strong>{{shippingAddress.phone}}</strong>
      </el-form-item>
      <el-form-item label="邮政编码">
        <strong>{{shippingAddress.postalCode}}</strong>
      </el-form-item>
      <el-form-item label="详细地址">
        <strong>{{shippingAddress.address}}</strong>
      </el-form-item>
      <el-form-item label="商品总金额">
        <strong>{{ orderTotalAmount.toFixed(2) }} 元</strong>
      </el-form-item>
      <h3>商品明细</h3>
      <el-table :data="orderItems" style="width: 100%">
        <el-table-column prop="title" label="商品名称" width="200" />
        <el-table-column prop="price" label="单价（元）" width="120">
          <template #default="scope">
            {{ scope.row.price.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="80" />
        <el-table-column prop="total" label="总价（元）" width="120">
          <template #default="scope">
            {{ scope.row.total.toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancelOrder">取消订单</el-button>
        <el-button type="primary" @click="toOrderPage(currentOrderId)">确认并支付</el-button>
      </span>
    </template>
  </el-dialog>
  </el-main>
</template>

<style scoped>

.background {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background-image: url("../../assets/book1.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 60px 20px;
  min-height: 100vh;
}

.cart-container {
  backdrop-filter: blur(10px);
  width: 100%;
  max-width: 800px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin-bottom: 40px;
}

.empty-cart {
  text-align: center;
  color: #999;
  font-size: 16px;
  padding: 40px;
  border: 2px dashed #ddd;
  border-radius: 10px;
}

/* 商品列表 */
.cart-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.cart-item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}

.cart-item-info {
  flex: 1;
  margin-left: 15px;
}

.cart-item-info h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.cart-item-info p {
  margin: 5px 0;
  font-size: 14px;
  color: #555;
}

input[type="number"] {
  width: 60px;
  padding: 5px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.delete-btn {
  background-color: #ff4d4f;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.delete-btn:hover {
  background-color: #e63946;
}

.total-amount {
  margin-top: 20px;
  font-size: 20px;
  font-weight: bold;
  text-align: right;
  color: #333;
}


</style>
