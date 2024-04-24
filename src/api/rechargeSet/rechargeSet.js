import request from '@/utils/request'

// 查询充值设置列表
export function listRechargeSet(query) {
  return request({
    url: '/rechargeSet/rechargeSet/list',
    method: 'get',
    params: query
  })
}

// 查询充值设置详细
export function getRechargeSet(id) {
  return request({
    url: '/rechargeSet/rechargeSet/' + id,
    method: 'get'
  })
}

// 新增充值设置
export function addRechargeSet(data) {
  return request({
    url: '/rechargeSet/rechargeSet',
    method: 'post',
    data: data
  })
}

// 修改充值设置
export function updateRechargeSet(data) {
  return request({
    url: '/rechargeSet/rechargeSet',
    method: 'put',
    data: data
  })
}

// 删除充值设置
export function delRechargeSet(id) {
  return request({
    url: '/rechargeSet/rechargeSet/' + id,
    method: 'delete'
  })
}
