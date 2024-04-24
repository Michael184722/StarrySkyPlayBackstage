import request from '@/utils/request'

// 查询抽赏套商品信息列表
export function listSuitCommodity(query) {
  return request({
    url: '/suitCommodity/suitCommodity/list',
    method: 'get',
    params: query
  })
}

// 查询抽赏套商品信息详细
export function getSuitCommodity(id) {
  return request({
    url: '/suitCommodity/suitCommodity/' + id,
    method: 'get'
  })
}

// 新增抽赏套商品信息
export function addSuitCommodity(data) {
  return request({
    url: '/suitCommodity/suitCommodity',
    method: 'post',
    data: data
  })
}

// 修改抽赏套商品信息
export function updateSuitCommodity(data) {
  return request({
    url: '/suitCommodity/suitCommodity',
    method: 'put',
    data: data
  })
}

// 删除抽赏套商品信息
export function delSuitCommodity(id) {
  return request({
    url: '/suitCommodity/suitCommodity/' + id,
    method: 'delete'
  })
}
