import { axios } from '../utils/request';
import { ADVERTISEMENT_MODULE } from './_prefix';
export interface Advertisement {
    id: string;
    title: string;
    content: string;
    productId: number;
    imgUrl?: string; // 广告图片 URL（可选）
}
// 获取所有广告
export const getAllAdvertisements = () => {
    return axios.get(`${ADVERTISEMENT_MODULE}`);
};

// 更新广告
export const updateAdvertisement = (ad: Advertisement) => {
    return axios.put(`${ADVERTISEMENT_MODULE}`, ad, {
        headers: { 'Content-Type': 'application/json' },
    });
};

// 创建广告
export const createAdvertisement = (ad: Advertisement) => {
    return axios.post(`${ADVERTISEMENT_MODULE}`, ad, {
        headers: { 'Content-Type': 'application/json' },
    });
};

// 删除广告
export const deleteAdvertisement = (id: string) => {
    return axios.delete(`${ADVERTISEMENT_MODULE}/${id}`);
};


export const getAdvertisementById = (id: string) => {
    return axios.get(`${ADVERTISEMENT_MODULE}/${id}`);
};