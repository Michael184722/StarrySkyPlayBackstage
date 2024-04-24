import request from '@/utils/request'

// 查询用户背包信息列表
export function listUserPackage(query) {
  return request({
    url: '/userPackage/userPackage/list',
    method: 'get',
    params: query
  })
}

// 查询用户背包信息详细
export function getUserPackage(id) {
  return request({
    url: '/userPackage/userPackage/' + id,
    method: 'get'
  })
}

// 新增用户背包信息
export function addUserPackage(data) {
  return request({
    url: '/userPackage/userPackage',
    method: 'post',
    data: data
  })
}

// 修改用户背包信息
export function updateUserPackage(data) {
  return request({
    url: '/userPackage/userPackage',
    method: 'put',
    data: data
  })
}

// 删除用户背包信息
export function delUserPackage(id) {
  return request({
    url: '/userPackage/userPackage/' + id,
    method: 'delete'
  })
}
