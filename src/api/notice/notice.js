import request from '@/utils/request'

// 查询公告内容信息列表
export function listNotice(query) {
  return request({
    url: '/notice/notice/list',
    method: 'get',
    params: query
  })
}

// 查询公告内容信息详细
export function getNotice(id) {
  return request({
    url: '/notice/notice/' + id,
    method: 'get'
  })
}

// 新增公告内容信息
export function addNotice(data) {
  return request({
    url: '/notice/notice',
    method: 'post',
    data: data
  })
}

// 修改公告内容信息
export function updateNotice(data) {
  return request({
    url: '/notice/notice',
    method: 'put',
    data: data
  })
}

// 删除公告内容信息
export function delNotice(id) {
  return request({
    url: '/notice/notice/' + id,
    method: 'delete'
  })
}
