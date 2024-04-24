import request from '@/utils/request'

// 查询用户交易记录列表
export function listTradeRecord(query) {
  return request({
    url: '/tradeRecord/tradeRecord/list',
    method: 'get',
    params: query
  })
}

// 查询用户交易记录详细
export function getTradeRecord(id) {
  return request({
    url: '/tradeRecord/tradeRecord/' + id,
    method: 'get'
  })
}

// 新增用户交易记录
export function addTradeRecord(data) {
  return request({
    url: '/tradeRecord/tradeRecord',
    method: 'post',
    data: data
  })
}

// 修改用户交易记录
export function updateTradeRecord(data) {
  return request({
    url: '/tradeRecord/tradeRecord',
    method: 'put',
    data: data
  })
}

// 删除用户交易记录
export function delTradeRecord(id) {
  return request({
    url: '/tradeRecord/tradeRecord/' + id,
    method: 'delete'
  })
}
