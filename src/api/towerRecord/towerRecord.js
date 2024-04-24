import request from '@/utils/request'

// 查询攀塔中奖记录列表
export function listTowerRecord(query) {
  return request({
    url: '/towerRecord/towerRecord/list',
    method: 'get',
    params: query
  })
}

// 查询攀塔中奖记录详细
export function getTowerRecord(id) {
  return request({
    url: '/towerRecord/towerRecord/' + id,
    method: 'get'
  })
}

// 新增攀塔中奖记录
export function addTowerRecord(data) {
  return request({
    url: '/towerRecord/towerRecord',
    method: 'post',
    data: data
  })
}

// 修改攀塔中奖记录
export function updateTowerRecord(data) {
  return request({
    url: '/towerRecord/towerRecord',
    method: 'put',
    data: data
  })
}

// 删除攀塔中奖记录
export function delTowerRecord(id) {
  return request({
    url: '/towerRecord/towerRecord/' + id,
    method: 'delete'
  })
}
