import request from '@/utils/request'

// 查询攀塔套管理列表
export function listTower(query) {
  return request({
    url: '/tower/tower/list',
    method: 'get',
    params: query
  })
}

// 查询攀塔套管理详细
export function getTower(id) {
  return request({
    url: '/tower/tower/' + id,
    method: 'get'
  })
}

// 新增攀塔套管理
export function addTower(data) {
  return request({
    url: '/tower/tower',
    method: 'post',
    data: data
  })
}

// 修改攀塔套管理
export function updateTower(data) {
  return request({
    url: '/tower/tower',
    method: 'put',
    data: data
  })
}

// 删除攀塔套管理
export function delTower(id) {
  return request({
    url: '/tower/tower/' + id,
    method: 'delete'
  })
}

export function delRecord(id) {
  return request({
    url: '/towerRecord/towerRecord/deleteTowerRecord?id=' + id,
    method: 'delete'
  })
}
