import request from '@/utils/request'

// 查询用户双倍次数列表
export function listUserDoubleRecord(query) {
  return request({
    url: '/userDoubleRecord/userDoubleRecord/list',
    method: 'get',
    params: query
  })
}

// 查询用户双倍次数详细
export function getUserDoubleRecord(id) {
  return request({
    url: '/userDoubleRecord/userDoubleRecord/' + id,
    method: 'get'
  })
}

// 新增用户双倍次数
export function addUserDoubleRecord(data) {
  return request({
    url: '/userDoubleRecord/userDoubleRecord',
    method: 'post',
    data: data
  })
}

// 修改用户双倍次数
export function updateUserDoubleRecord(data) {
  return request({
    url: '/userDoubleRecord/userDoubleRecord',
    method: 'put',
    data: data
  })
}

// 删除用户双倍次数
export function delUserDoubleRecord(id) {
  return request({
    url: '/userDoubleRecord/userDoubleRecord/' + id,
    method: 'delete'
  })
}
