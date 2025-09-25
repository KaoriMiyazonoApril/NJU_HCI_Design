<script setup lang="ts">
import { OrderPay } from "../../api/order.ts";
import { useRoute } from "vue-router";
import { onMounted, ref } from "vue";
import { ElMessage, ElLoading } from "element-plus";

const route = useRoute();
const orderId = String(route.params.orderId);
const paymentForm = ref<string>("");
const isSubmitting = ref(false);
const paymentStatus = ref<"pending" | "success" | "failed">("pending");

const fetchPaymentForm = async () => {
  try {
    if (!orderId) {
      ElMessage.warning("订单ID无效！");
      return;
    }

    const loading = ElLoading.service({
      lock: true,
      text: "正在获取支付信息...",
      background: "rgba(0, 0, 0, 0.7)",
    });

    const payData = await OrderPay(orderId);
    paymentForm.value = payData.paymentForm;

    setTimeout(() => {
      const form = document.querySelector("form");
      if (form) {
        form.submit();
        paymentStatus.value = "pending";
      } else {
        ElMessage.warning("支付表单加载失败，请手动提交");
      }
    }, 500);

    loading.close();
  } catch (error) {
    ElMessage.error("获取支付信息失败，请稍后再试！");
    paymentStatus.value = "failed";
    console.error("支付失败:", error);
  }
};

const handleManualSubmit = () => {
  if (isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    const form = document.querySelector("form");
    if (form) {
      form.submit();
      paymentStatus.value = "pending";
    } else {
      ElMessage.warning("支付表单未正确加载");
    }
  } catch (error) {
    ElMessage.error("提交支付失败");
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  fetchPaymentForm();
});
</script>

<template>
  <div class="payment-container">
    <h1>订单支付</h1>

    <div v-if="paymentStatus === 'failed'" class="error-message">
      支付加载失败，请<el-button type="primary" @click="fetchPaymentForm" size="small">重试</el-button>
    </div>

    <div v-else>
      <!-- 支付信息展示 -->
      <div v-if="paymentForm" class="payment-info">
        <div class="payment-loading" v-if="paymentStatus === 'pending'">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>正在跳转支付平台...</span>
        </div>

        <!-- 隐藏的支付表单 -->
        <div v-html="paymentForm" style="display: none;"></div>

        <div class="manual-submit" v-if="paymentStatus === 'pending'">
          <p>如果没有自动跳转，请点击下方按钮</p>
          <el-button
              type="primary"
              :loading="isSubmitting"
              @click="handleManualSubmit"
              :disabled="!paymentForm"
          >
            确认并支付
          </el-button>
        </div>
      </div>

      <div v-else class="loading-payment">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>正在加载支付信息...</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.payment-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px;
  text-align: center;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

h1 {
  margin-bottom: 30px;
  color: #333;
}

.payment-info {
  margin: 20px 0;
}

.payment-loading,
.loading-payment {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
  color: #666;
}

.error-message {
  color: #f56c6c;
  margin: 20px 0;
}

.manual-submit {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.manual-submit p {
  margin-bottom: 15px;
  color: #888;
}

.el-button {
  padding: 12px 24px;
}

.el-button--primary {
  background-color: #409eff;
  border-color: #409eff;
}

.el-button:disabled {
  background-color: #a0cfff;
  border-color: #a0cfff;
}
</style>
