import request from '@/utils/request'

// 查询抽赏区中奖记录列表
export function listSuitRecord(query) {
  return request({
    url: '/suitRecord/suitRecord/list',
    method: 'get',
    params: query
  })
}

// 查询抽赏区中奖记录详细
export function getSuitRecord(id) {
  return request({
    url: '/suitRecord/suitRecord/' + id,
    method: 'get'
  })
}

// 新增抽赏区中奖记录
export function addSuitRecord(data) {
  return request({
    url: '/suitRecord/suitRecord',
    method: 'post',
    data: data
  })
}

// 修改抽赏区中奖记录
export function updateSuitRecord(data) {
  return request({
    url: '/suitRecord/suitRecord',
    method: 'put',
    data: data
  })
}

// 删除抽赏区中奖记录
export function delSuitRecord(id) {
  return request({
    url: '/suitRecord/suitRecord/' + id,
    method: 'delete'
  })
}
