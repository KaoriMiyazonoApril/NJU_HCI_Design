import {axios} from '../utils/request'
import {ACCOUNTS_MODULE} from './_prefix'
import type {AxiosRequestConfig} from "axios";
type RegisterInfo = {
    role: string,
    name: string,
    username: string,
    avatar: string,
    phone: string,
    email: string,
    password: string,
    location: string,
}

export type UpdateInfo = {
    name?: string,
    username?: string,
    avatar?: string,
    phone?: string,
    email?: string,
    location?: string,
    password?: string,
}
type LoginInfo = {
    username: string,
    password: string
}

//如果有“Vue: This may be converted to an async function”警告，可以不管
//用户登录
export const userLogin = (loginInfo: LoginInfo) => {
    return axios.post(`${ACCOUNTS_MODULE}/login`, loginInfo, {
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => {
            return res;
        })
        .catch(err => {
            console.error("Login failed:", err);
            throw err;
        });
};

// 用户注册
export const userRegister = (registerInfo: RegisterInfo) => {
    return axios.post(`${ACCOUNTS_MODULE}`, registerInfo, {
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => {
            return res;
        })
        .catch(err => {
            console.error("Registration failed:", err);
            throw err;
        });
};


// 获取用户信息
export const userInfo = (username: string) => {
    if (!username) {
        console.error("Username is required.");
        return Promise.reject(new Error("Username cannot be empty"));
    }
    return axios.get(`${ACCOUNTS_MODULE}/${username}`)
        .then(res => {
            return res;
        })
        .catch(err => {
            console.error("Failed to fetch user info:", err);
            throw err;
        });
};


export const userInfoUpdate = (updateInfo: UpdateInfo, username: string, config?: AxiosRequestConfig) => {
    // 将 updateInfo 和 username 合并为一个对象
    const data = {
        ...updateInfo,
        username: username
    };

    return axios.put(`${ACCOUNTS_MODULE}`, data, {
        headers: {
            'Content-Type': 'application/json',
            ...config?.headers // 动态添加自定义请求头
        }
    })
        .then(res => {
            return res;
        })
        .catch(err => {
            console.error("Failed to update user info:", err);
            throw err;
        });
};


//删除用户
export const deleteUser = (userId: number, config?: AxiosRequestConfig) => {
    return axios.delete(`${ACCOUNTS_MODULE}/deleteUser/${userId}`, {
        ...config,
        headers: {
            'Content-Type': 'application/json',
            ...config?.headers
        }
    })
        .then(res => {
            return res;
        })
        .catch(err => {
            console.error("Failed to delete user:", err);
            throw err;
        });
};

export type FavorRequest = {
    userId: number;
    productId: number;
}

//添加收藏
export const addFavor = (data: FavorRequest) => {
    return axios.post(`${ACCOUNTS_MODULE}/addFavor`, data, {
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.data)
        .catch(err => {
            console.error('添加收藏失败:', err);
            throw err;
        });
};

//取消收藏
export const deleteFavor = (data: FavorRequest) => {
    return axios.delete(`${ACCOUNTS_MODULE}/deleteFavor`, {
        data,
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.data)
        .catch(err => {
            console.error('取消收藏失败:', err);
            throw err;
        });
};

export const findFavor = (userId: number) => {
    return axios.get(`${ACCOUNTS_MODULE}/findFavor/${userId}`)
        .then(res => {
            // 注意这里是从 res.data.data 提取
            if (res.data && res.data.code == 200) {
                return res.data.data || [];
            } else {
                console.error("接口返回错误:", res.data.msg);
                return [];
            }
        })
        .catch(err => {
            console.error('获取收藏列表失败:', err);
            return [];
        });
};


// // 模拟用户登录接口
// export function userLogin(payload: { username: string; password: string }) {
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             if (payload.username === "test" && payload.password === "123456") {
//                 resolve({
//                     data: {
//                         code: "000", // 登录成功
//                         msg: "登录成功",
//                         result: "fake-token-1234567890", // 假的 token
//                     },
//                 });
//             } else {
//                 resolve({
//                     data: {
//                         code: "400", // 登录失败
//                         msg: "用户名或密码错误",
//                     },
//                 });
//             }
//         }, 500); // 模拟网络延迟
//     });
// }
//
// // 模拟获取用户信息接口
// export function userInfo() {
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             resolve({
//                 data: {
//                     code: "000",
//                     result: {
//                         username: "张三", // 用户名
//                         role: "MANAGER", // 用户角色
//                         telephone: "1234567890",
//                         email: "test@example.com",
//                         location: "test",
//                     },
//                 },
//             });
//         }, 500); // 模拟网络延迟
//     });
// }
