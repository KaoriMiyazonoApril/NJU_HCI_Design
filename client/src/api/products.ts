import { axios } from '../utils/request'
import { PRODUCT_MODULE } from './_prefix'

export type Product = {
    id: number
    title: string
    price: number
    rate: number
    description?: string
    cover?: string
    detail?: string
    specifications?: Array<{ item: string; value: string }> // 数组形式
    category: string
    likes: number
    sales: number
    score: number
    score_num: number
}

export interface Specification{
    id: number
    item: string
    value: string
    productId: number
}

export interface  Stockpile {
    id?: number
    amount: number
    frozen: number
    productId?: number
}

// 获取所有商品
export const getAllProducts = () => {
    return axios.get(`${PRODUCT_MODULE}`)
        .then(res => {
            return res
        })
    // return Promise.resolve({
    //     data: mockProducts,
    //     code: 200,
    //     msg: 'success'
    // })
}

// 获取指定商品
export const getProduct = (id: number) => {
    return axios.get(`${PRODUCT_MODULE}/${id}`)
        .then(res => {
            return res
        })
}

// 更新商品
export const updateProduct = (product: Product) => {
    return axios.put(`${PRODUCT_MODULE}`, product,
        { headers: { 'Content-Type': 'application/json' } })
        .then(res => {
            return res
        })
}

// 创建商品
export const createProduct = (product: Omit<Product, 'id'>) => {
    return axios.post(`${PRODUCT_MODULE}`, product,
        { headers: { 'Content-Type': 'application/json' } })
        .then(res => {
            return res
        })
}

// 删除商品
export const deleteProduct = (id: number) => {
    return axios.delete(`${PRODUCT_MODULE}/${id}`)
        .then(res => {
            return res
        })
}

// 更新商品库存
export const updateProductAmount = (productId: number, stockpile: { amount?: number, frozen?: number }) => {
    return axios.patch(`${PRODUCT_MODULE}/stockpile/${productId}`, stockpile,
        { headers: { 'Content-Type': 'application/json' } })
        .then(res => {
            return res
        })
}

// 获取商品库存
export const getProductAmount = (productId: number) => {
    return axios.get(`${PRODUCT_MODULE}/stockpile/${productId}`)
        .then(res => {
            return res
        })
}

// 点赞商品
export const likeProduct = (id: number) => {
    return axios.post(`${PRODUCT_MODULE}/${id}/like`)
        .then(res => {
            return res
        })
}

export default {
    // 搜索商品
    search(something: string) {
        return axios.get(`${PRODUCT_MODULE}/search/${encodeURIComponent(something)}`)
    },
}

// 根据分类获取商品列表
export const getProductsByCategory = (category: string) => {
    return axios.get(`${PRODUCT_MODULE}/category/${encodeURIComponent(category)}`)
        .then(res => res)
        .catch(err => {
            console.error('获取分类商品失败:', err)
            return Promise.reject(err)
        })
}

export const evaluateProduct = (id: number, score: number) => {
    // 确保从正确的存储位置获取token
    const token = sessionStorage.getItem('token');

    console.log(`Evaluating product ${id} with score ${score}`);
    return axios.post(`${PRODUCT_MODULE}/${id}/evaluate`, { score },{
        headers: {
            'token': token,
            'Content-Type': 'application/json',
        },
        withCredentials: true, // 关键：允许跨域携带 Cookie
    });
};
// 全局配置
axios.interceptors.request.use(config => {
    config.withCredentials = true; // 确保跨域携带 Cookie
    return config;
});


// // 模拟数据 - 直接嵌入在原文件中
// const mockProducts: Product[] = [
//     {
//         id: 1,
//         title: 'Apple iPhone 15 Pro',
//         price: 8999,
//         rate: 4.8,
//         description: '钛金属设计，A17 Pro芯片',
//         cover: 'https://img10.360buyimg.com/n1/s450x450_jfs/t1/213571/5/13387/92439/621f0a1aEa1b67db5/3a06f40e8c7e9a3a.jpg',
//         specifications: [
//             { id: 1, item: '颜色', value: '原色钛金属', productId: 1 },
//             { id: 2, item: '存储', value: '256GB', productId: 1 }
//         ]
//     },
//     {
//         id: 2,
//         title: '华为 Mate 60 Pro',
//         price: 6999,
//         rate: 4.9,
//         description: '卫星通信，鸿蒙操作系统',
//         cover: 'https://img10.360buyimg.com/n1/s450x450_jfs/t1/221202/5/11696/65611/621f0a1aEa1b67db5/3a06f40e8c7e9a3a.jpg'
//     },
//     {
//         id: 3,
//         title: '小米 14 Ultra',
//         price: 6499,
//         rate: 4.7,
//         description: '徕卡光学系统，双向卫星通信',
//         cover: 'https://img10.360buyimg.com/n1/s450x450_jfs/t1/170638/33/32963/253325/63b73a08E0b54491b/919a8e5a8cdd0d30.jpg'
//     }
// ]