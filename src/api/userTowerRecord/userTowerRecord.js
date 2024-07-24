import request from '@/utils/request'

// 查询用户攀塔层数记录列表
export function listUserTowerRecord(query) {
  return request({
    url: '/userTowerRecord/userTowerRecord/list',
    method: 'get',
    params: query
  })
}

// 查询用户攀塔层数记录详细
export function getUserTowerRecord(id) {
  return request({
    url: '/userTowerRecord/userTowerRecord/' + id,
    method: 'get'
  })
}

// 新增用户攀塔层数记录
export function addUserTowerRecord(data) {
  return request({
    url: '/userTowerRecord/userTowerRecord',
    method: 'post',
    data: data
  })
}

// 修改用户攀塔层数记录
export function updateUserTowerRecord(data) {
  return request({
    url: '/userTowerRecord/userTowerRecord',
    method: 'put',
    data: data
  })
}

// 删除用户攀塔层数记录
export function delUserTowerRecord(id) {
  return request({
    url: '/userTowerRecord/userTowerRecord/' + id,
    method: 'delete'
  })
}
