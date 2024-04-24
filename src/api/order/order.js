import request from '@/utils/request'

// 查询商城订单信息列表
export function listOrder(query) {
  return request({
    url: '/order/order/list',
    method: 'get',
    params: query
  })
}

// 查询商城订单信息详细
export function getOrder(id) {
  return request({
    url: '/order/order/' + id,
    method: 'get'
  })
}

// 新增商城订单信息
export function addOrder(data) {
  return request({
    url: '/order/order',
    method: 'post',
    data: data
  })
}

// 修改商城订单信息
export function updateOrder(data) {
  return request({
    url: '/order/order',
    method: 'put',
    data: data
  })
}

// 删除商城订单信息
export function delOrder(id) {
  return request({
    url: '/order/order/' + id,
    method: 'delete'
  })
}
