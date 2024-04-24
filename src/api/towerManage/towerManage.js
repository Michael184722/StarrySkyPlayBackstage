import request from '@/utils/request'

// 查询攀塔信息列表
export function listTowerManage(query) {
  return request({
    url: '/towerManage/towerManage/list',
    method: 'get',
    params: query
  })
}

// 查询攀塔信息详细
export function getTowerManage(id) {
  return request({
    url: '/towerManage/towerManage/' + id,
    method: 'get'
  })
}

// 新增攀塔信息
export function addTowerManage(data) {
  return request({
    url: '/towerManage/towerManage',
    method: 'post',
    data: data
  })
}

// 修改攀塔信息
export function updateTowerManage(data) {
  return request({
    url: '/towerManage/towerManage',
    method: 'put',
    data: data
  })
}

// 删除攀塔信息
export function delTowerManage(id) {
  return request({
    url: '/towerManage/towerManage/' + id,
    method: 'delete'
  })
}
