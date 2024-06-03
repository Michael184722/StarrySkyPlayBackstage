import request from '@/utils/request'

// 查询福袋信息列表
export function listBag(query) {
  return request({
    url: '/bag/bag/list',
    method: 'get',
    params: query
  })
}

// 查询福袋信息详细
export function getBag(id) {
  return request({
    url: '/bag/bag/' + id,
    method: 'get'
  })
}

// 新增福袋信息
export function addBag(data) {
  return request({
    url: '/bag/bag',
    method: 'post',
    data: data
  })
}

// 修改福袋信息
export function updateBag(data) {
  return request({
    url: '/bag/bag',
    method: 'put',
    data: data
  })
}

// 删除福袋信息
export function delBag(id) {
  return request({
    url: '/bag/bag/' + id,
    method: 'delete'
  })
}
