import request from '@/utils/request'

// 查询攀塔商品信息列表
export function listTowerCommodity(query) {
  return request({
    url: '/towerCommodity/towerCommodity/list',
    method: 'get',
    params: query
  })
}

// 查询攀塔商品信息详细
export function getTowerCommodity(id) {
  return request({
    url: '/towerCommodity/towerCommodity/' + id,
    method: 'get'
  })
}

// 新增攀塔商品信息
export function addTowerCommodity(data) {
  return request({
    url: '/towerCommodity/towerCommodity',
    method: 'post',
    data: data
  })
}

// 修改攀塔商品信息
export function updateTowerCommodity(data) {
  return request({
    url: '/towerCommodity/towerCommodity',
    method: 'put',
    data: data
  })
}

// 删除攀塔商品信息
export function delTowerCommodity(id) {
  return request({
    url: '/towerCommodity/towerCommodity/' + id,
    method: 'delete'
  })
}
