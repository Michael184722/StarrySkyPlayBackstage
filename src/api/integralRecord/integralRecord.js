import request from '@/utils/request'

// 查询用户积分记录列表
export function listIntegralRecord(query) {
  return request({
    url: '/integralRecord/integralRecord/list',
    method: 'get',
    params: query
  })
}

// 查询用户积分记录详细
export function getIntegralRecord(id) {
  return request({
    url: '/integralRecord/integralRecord/' + id,
    method: 'get'
  })
}

// 新增用户积分记录
export function addIntegralRecord(data) {
  return request({
    url: '/integralRecord/integralRecord',
    method: 'post',
    data: data
  })
}

// 修改用户积分记录
export function updateIntegralRecord(data) {
  return request({
    url: '/integralRecord/integralRecord',
    method: 'put',
    data: data
  })
}

// 删除用户积分记录
export function delIntegralRecord(id) {
  return request({
    url: '/integralRecord/integralRecord/' + id,
    method: 'delete'
  })
}
