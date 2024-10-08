import request from '@/utils/request'

// 查询小程序用户信息列表
export function listWxUser(query, type = true) {
    return request({
        url: '/wxUser/wxUser/list',
        method: 'get',
        headers: {
            load: type
        },
        params: query
    })
}

// 查询存储余额
export function getBalance(query) {
    return request({
        url: '/userDayRecord/userDayRecord/list',
        method: 'get',
        params: query
    })
}

// 查询已赠送的商品列表
export function listGivenGoods(query) {
    return request({
        url: '/userSendCommodity/userSendCommodity/list',
        method: 'get',
        params: query
    })
}

// 查询交易记录
export function listTradeRecord(query) {
    return request({
        url: '/tradeRecord/tradeRecord/list',
        method: 'get',
        params: query
    })
}

// 查询抽赏
export function listPresent(query) {
    return request({
        url: '/tradeRecord/tradeRecord/lotteryRecordList',
        method: 'get',
        params: query
    })
}

// 查询交易统计
export function listTradeStatistics(query) {
    return request({
        url: '/tradeRecord/tradeRecord/statis',
        method: 'get',
        params: query
    })
}

// 查询交易统计
export function listPresentStatistics(query) {
    return request({
        url: '/tradeRecord/tradeRecord/lotteryStatis',
        method: 'get',
        params: query
    })
}

// 查询积分记录统计
export function listIntegralRecordStatistics(query) {
    return request({
        url: '/integralRecord/integralRecord/statis',
        method: 'get',
        params: query
    })
}

// 查询积分记录列表
export function listIntegralRecord(query) {
    return request({
        url: '/integralRecord/integralRecord/list',
        method: 'get',
        params: query
    })
}

// 查询下级用户
export function getNextUsers(query) {
    return request({
        url: '/wx/system/getUserShare',
        method: 'get',
        params: query
    })
}

// 发货记录
export function listSendRecord(query) {
    return request({
        url: '/userLogistics/userLogistics/list',
        method: 'get',
        params: query
    })
}

// 查询背包数据
export function listUserPackage(query, type = true) {
    return request({
        url: '/wx/module/getUserPackageList',
        method: 'get',
        headers: {
            load: type
        },
        params: query,
    })
}

// 查询小程序用户信息详细
export function getWxUser(openId) {
    return request({
        url: '/wxUser/wxUser/' + openId,
        method: 'get',
    })
}

// 新增小程序用户信息
export function addWxUser(data) {
    return request({
        url: '/wxUser/wxUser',
        method: 'post',
        data: data
    })
}

// 赠送商品 
export function giveGoods(data) {
    return request({
        url: '/wxUser/wxUser/sendCommodity',
        method: 'post',
        data: data
    })
}

// 修改小程序用户信息
export function updateWxUser(data) {
    return request({
        url: '/wxUser/wxUser',
        method: 'put',
        data: data
    })
}

export function resetUser(data) {
    return request({
        url: '/userPackage/userPackage',
        method: 'put',
        data: data
    })
}

export function updateWxUserDate(data) {
    return request({
        url: '/wxUser/wxUser/updateUserBalance',
        method: 'post',
        data: data
    })
}

// 删除小程序用户信息
export function delWxUser(openId) {
    return request({
        url: '/wxUser/wxUser/' + openId,
        method: 'delete'
    })
}

export function clearTheFlowingWater() {
    return request({
        url: '/wxUser/wxUser/cleanWater',
        method: 'get'
    })
}


export function delCase(openId) {
    return request({
        url: '/wxUser/wxUser/delUserPackage/' + openId,
        method: 'delete'
    })
}
