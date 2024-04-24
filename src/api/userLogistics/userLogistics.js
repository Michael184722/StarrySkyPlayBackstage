import request from '@/utils/request'

// 查询物流信息列表
export function listUserLogistics(query) {
  return request({
    url: '/userLogistics/userLogistics/list',
    method: 'get',
    params: query
  })
}

// 查询物流信息详细
export function getUserLogistics(id) {
  return request({
    url: '/userLogistics/userLogistics/' + id,
    method: 'get'
  })
}

// 新增物流信息
export function addUserLogistics(data) {
  return request({
    url: '/userLogistics/userLogistics',
    method: 'post',
    data: data
  })
}

// 修改物流信息
export function updateUserLogistics(data) {
  return request({
    url: '/userLogistics/userLogistics',
    method: 'put',
    data: data
  })
}

// 删除物流信息
export function delUserLogistics(id) {
  return request({
    url: '/userLogistics/userLogistics/' + id,
    method: 'delete'
  })
}
