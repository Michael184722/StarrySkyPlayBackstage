import request from '@/utils/request'

// 查询用户充值记录列表
export function listUserRecharge(query) {
  return request({
    url: '/userRecharge/userRecharge/list',
    method: 'get',
    params: query
  })
}

// 查询用户充值记录详细
export function getUserRecharge(id) {
  return request({
    url: '/userRecharge/userRecharge/' + id,
    method: 'get'
  })
}

// 新增用户充值记录
export function addUserRecharge(data) {
  return request({
    url: '/userRecharge/userRecharge',
    method: 'post',
    data: data
  })
}

// 修改用户充值记录
export function updateUserRecharge(data) {
  return request({
    url: '/userRecharge/userRecharge',
    method: 'put',
    data: data
  })
}

// 删除用户充值记录
export function delUserRecharge(id) {
  return request({
    url: '/userRecharge/userRecharge/' + id,
    method: 'delete'
  })
}
