import request from '@/utils/request'

// 查询小程序用户信息列表
export function listWxUser(query) {
    return request({
        url: '/wxUser/wxUser/list',
        method: 'get',
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

// 查询积分记录列表
export function listIntegralRecord(query) {
    return request({
        url: '/integralRecord/integralRecord/list',
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

// 删除小程序用户信息
export function delWxUser(openId) {
    return request({
        url: '/wxUser/wxUser/' + openId,
        method: 'delete'
    })
}


export function delCase(openId) {
    return request({
        url: '/wxUser/wxUser/delUserPackage/' + openId,
        method: 'delete'
    })
}
