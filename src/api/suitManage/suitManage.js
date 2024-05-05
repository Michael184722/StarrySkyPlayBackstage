import request from '@/utils/request'

// 查询抽赏套管理列表
export function listSuitManage(query) {
    return request({
        url: '/suitManage/suitManage/list',
        method: 'get',
        params: query
    })
}

// 查询排行列表
export function listSuitManageRank(query) {
    return request({
        url: '/suitManage/suitManage/suitRankList',
        method: 'get',
        params: query
    })
}

// 查询中赏记录
export function listSuitManageRecord(query) {
    return request({
        url: '/suitManage/suitManage/suitRecordList',
        method: 'get',
        params: query
    })
}

// 查询抽赏套管理详细
export function getSuitManage(id) {
    return request({
        url: '/suitManage/suitManage/' + id,
        method: 'get'
    })
}

export function getDetail(id) {
    return request({
        url: '/suitManage/suitManage/getDetail/' + id,
        method: 'get'
    })
}

// 新增抽赏套管理
export function addSuitManage(data) {
    return request({
        url: '/suitManage/suitManage',
        method: 'post',
        data: data
    })
}

// 修改抽赏套管理
export function updateSuitManage(data) {
    return request({
        url: '/suitManage/suitManage',
        method: 'put',
        data: data
    })
}

export function updateSuitManageEditBox(data) {
    return request({
        url: '/suitManage/suitManage/editBox',
        method: 'put',
        data: data
    })
}

// 删除抽赏套管理
export function delSuitManage(id) {
    return request({
        url: '/suitManage/suitManage/' + id,
        method: 'delete'
    })
}

// 删除盒子
export function delSuitManageBox(data) {
    return request({
        url: '/suitManage/suitManage/delBox',
        method: 'post',
        data,
    })
}