import request from '@/utils/request'

// 查询客服信息设置列表
export function listCustomService(query) {
  return request({
    url: '/customService/customService/list',
    method: 'get',
    params: query
  })
}

// 查询客服信息设置详细
export function getCustomService(id) {
  return request({
    url: '/customService/customService/' + id,
    method: 'get'
  })
}

// 新增客服信息设置
export function addCustomService(data) {
  return request({
    url: '/customService/customService',
    method: 'post',
    data: data
  })
}

// 修改客服信息设置
export function updateCustomService(data) {
  return request({
    url: '/customService/customService',
    method: 'put',
    data: data
  })
}

// 删除客服信息设置
export function delCustomService(id) {
  return request({
    url: '/customService/customService/' + id,
    method: 'delete'
  })
}
