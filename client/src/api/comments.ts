// src/api/comment.ts
import {axios} from '../utils/request';
import { COMMENT_MODULE } from './_prefix';

export type CommentVO = {
    id?: number
    userId: number
    username: string
    productId: number
    detail: string
}
export const addComment = (comment: CommentVO) => {
    return axios.post(`${COMMENT_MODULE}/add`, comment,
        { headers: { 'Content-Type': 'application/json' } })
        .then(res => {
            return res;
        })
}

export const getCommentsByProductId = (productId: number) => {
    return axios.get(`${COMMENT_MODULE}/${productId}`,
        { headers: { 'Content-Type': 'application/json' } })
        .then(res => res)
}

export const deleteComment = (comment: CommentVO) => {
    return axios.delete(`${COMMENT_MODULE}/delete`, { data: comment })
        .then(res => res)
}