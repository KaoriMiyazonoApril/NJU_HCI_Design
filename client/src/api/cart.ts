import { axios } from "../utils/request";
import { CART_MODULE } from "./_prefix";

// 获取当前用户的购物车信息
export const getAllCarts = () => {
    return axios.get(`${CART_MODULE}`);
};

// 添加商品到购物车
export const addToCart = (productId: string, quantity: number) => {
    return axios.post(`${CART_MODULE}`, { productId, quantity });
};

// 删除购物车中的指定商品
export const deleteCartItem = (cartItemId: string) => {
    return axios.delete(`${CART_MODULE}/${cartItemId}`);
};

// 修改购物车中指定商品的数量
export const updateCartItemQuantity = (cartItemId: string, quantity: number) => {
    return axios.patch(`${CART_MODULE}/${cartItemId}`, { quantity });
};