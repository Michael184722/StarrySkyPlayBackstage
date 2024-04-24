import request from '@/utils/request'

// 查询交易区列表
export function listTradingArea(query) {
  return request({
    url: '/tradingArea/tradingArea/list',
    method: 'get',
    params: query
  })
}

// 查询交易区详细
export function getTradingArea(id) {
  return request({
    url: '/tradingArea/tradingArea/' + id,
    method: 'get'
  })
}

// 新增交易区
export function addTradingArea(data) {
  return request({
    url: '/tradingArea/tradingArea',
    method: 'post',
    data: data
  })
}

// 修改交易区
export function updateTradingArea(data) {
  return request({
    url: '/tradingArea/tradingArea',
    method: 'put',
    data: data
  })
}

// 删除交易区
export function delTradingArea(id) {
  return request({
    url: '/tradingArea/tradingArea/' + id,
    method: 'delete'
  })
}
