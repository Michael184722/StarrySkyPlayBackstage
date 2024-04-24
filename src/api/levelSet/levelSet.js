import request from '@/utils/request'

// 查询会员等级设置列表
export function listLevelSet(query) {
  return request({
    url: '/levelSet/levelSet/list',
    method: 'get',
    params: query
  })
}

// 查询会员等级设置详细
export function getLevelSet(id) {
  return request({
    url: '/levelSet/levelSet/' + id,
    method: 'get'
  })
}

// 新增会员等级设置
export function addLevelSet(data) {
  return request({
    url: '/levelSet/levelSet',
    method: 'post',
    data: data
  })
}

// 修改会员等级设置
export function updateLevelSet(data) {
  return request({
    url: '/levelSet/levelSet',
    method: 'put',
    data: data
  })
}

// 删除会员等级设置
export function delLevelSet(id) {
  return request({
    url: '/levelSet/levelSet/' + id,
    method: 'delete'
  })
}
