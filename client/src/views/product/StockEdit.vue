<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getProductAmount, updateProductAmount } from "../../api/products";

// 获取路由参数
const route = useRoute();
const router = useRouter();
const productId = Number(route.params.id);

// 定义响应式数据
const stockpile = ref<{ amount: number; frozen: number }>({
  amount :0,
  frozen :0,
});
const error = ref<string | null>(null);

// 加载库存信息
async function fetchStockpile() {
  try {
    const response = await getProductAmount(productId);

    if (response && typeof response === "object") {
      stockpile.value = {
        amount: response.data.amount || 0,
        frozen: response.data.frozen || 0,

      };
    } else {
      throw new Error("Invalid response format");
    }
  } catch (err) {
    console.error("Error fetching stockpile info:", err);
    error.value = "库存信息加载失败";
  }
}
// 更新库存信息
async function updateStock() {
  try {
    const updatedStockpile = {
      amount: stockpile.value.amount,
      frozen: stockpile.value.frozen,
    };

    await updateProductAmount(productId, updatedStockpile);
    alert("库存更新成功！");
    router.back();
  } catch (err) {
    console.error("Error updating stockpile:", err);
    alert("库存更新失败！");
  }
}

// 在组件挂载时加载库存信息
onMounted(() => {
  fetchStockpile();
});
</script>

<template>
  <el-main class="background">
  <div v-if="error" class="error">
    <h1>{{ error }}</h1>
  </div>

  <div v-else class="stock-edit">
    <h1>编辑库存信息</h1>

    <!-- 总库存 -->
    <div class="form-item">
      <label for="amount">总库存：</label>
      <input
          type="number"
          id="amount"
          v-model.number="stockpile.amount"
          placeholder="请输入总库存"
      />
    </div>

    <!-- 冻结库存 -->
    <div class="form-item">
      <label for="frozen">冻结库存：</label>
      <input
          type="number"
          id="frozen"
          v-model.number="stockpile.frozen"
          placeholder="请输入冻结库存"
      />
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <button @click="updateStock" class="save-btn">保存</button>
      <button @click="router.back()" class="cancel-btn">取消</button>
    </div>
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

.stock-edit {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.form-item {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.actions {
  display: flex;
  justify-content: space-between;
}

.save-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.error {
  color: red;
  text-align: center;
}
</style>
