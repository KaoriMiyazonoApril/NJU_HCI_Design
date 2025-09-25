import { axios } from "../utils/request";
import { CART_MODULE } from "./_prefix";
import { ORDER_MODULE } from "./_prefix";

interface CheckoutRequest {
    cartItemIds: string[];
    shipping_address: {
        name: string;
        phone: string;
        postalCode: string;
        address: string;
    };
    paymentMethod: string;
}
interface OrderPayResponse {
    code: string;
    msg: string;
    paymentForm: string; // 支付表单 HTML
    orderId: string;     // 订单 ID
    totalAmount: string; // 订单总金额
    paymentMethod: string; // 支付方式

}

//提交订单
export const CheckoutOrders = (requestData:CheckoutRequest) => {
    return axios.post(`${CART_MODULE}/checkout`, requestData)
        .then(response => {
            if (response.data.code == 200) {
                return response.data; // 返回成功的响应数据
            } else {
                throw new Error(response.data.msg || "提交订单失败"); // 抛出错误信息
            }
        })
        .catch(error => {
            console.error("提交订单时发生错误:", error);
            throw error; // 继续抛出错误以便调用方处理
        });
};

// 取消订单
export const CancelOrder = (orderId: string) => {
    return axios.delete(`${CART_MODULE}/checkout/${orderId}`)
        .then(response => {
            if (response.data.code == 200) {
                return response.data; // 返回成功的响应数据
            } else {
                throw new Error(response.data.msg || "取消订单失败");
            }
        })
        .catch(error => {
            console.error("取消订单时发生错误:", error);
            throw error;
        });
};


//支付订单
export const OrderPay = (orderId: string): Promise<OrderPayResponse> => {
    return axios.post(`${ORDER_MODULE}/${orderId}/pay`)
        .then((response) => {
            // 检查响应状态码
            if (response.data.code === "200") {
                console.log("支付接口响应数据:", response.data);
                return response.data.data;
            } else {
                throw new Error(response.data.msg || "支付请求失败");
            }
        })
        .catch(error => {
            console.error("请求支付时发生错误:", error);
            throw error;
        });
};
