import request from '@/utils/request'

// 查询福袋赠送记录列表
export function listBagRecord(query) {
  return request({
    url: '/bagRecord/bagRecord/list',
    method: 'get',
    params: query
  })
}

// 查询福袋赠送记录详细
export function getBagRecord(id) {
  return request({
    url: '/bagRecord/bagRecord/' + id,
    method: 'get'
  })
}

// 新增福袋赠送记录
export function addBagRecord(data) {
  return request({
    url: '/bagRecord/bagRecord',
    method: 'post',
    data: data
  })
}

// 修改福袋赠送记录
export function updateBagRecord(data) {
  return request({
    url: '/bagRecord/bagRecord',
    method: 'put',
    data: data
  })
}

// 删除福袋赠送记录
export function delBagRecord(id) {
  return request({
    url: '/bagRecord/bagRecord/' + id,
    method: 'delete'
  })
}
