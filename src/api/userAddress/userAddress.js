import request from '@/utils/request'

// 查询用户地址信息列表
export function listUserAddress(query) {
  return request({
    url: '/userAddress/userAddress/list',
    method: 'get',
    params: query
  })
}

// 查询用户地址信息详细
export function getUserAddress(id) {
  return request({
    url: '/userAddress/userAddress/' + id,
    method: 'get'
  })
}

// 新增用户地址信息
export function addUserAddress(data) {
  return request({
    url: '/userAddress/userAddress',
    method: 'post',
    data: data
  })
}

// 修改用户地址信息
export function updateUserAddress(data) {
  return request({
    url: '/userAddress/userAddress',
    method: 'put',
    data: data
  })
}

// 删除用户地址信息
export function delUserAddress(id) {
  return request({
    url: '/userAddress/userAddress/' + id,
    method: 'delete'
  })
}
