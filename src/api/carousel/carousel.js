import request from '@/utils/request'

// 查询轮播图信息列表
export function listCarousel(query) {
  return request({
    url: '/carousel/carousel/list',
    method: 'get',
    params: query
  })
}

// 查询轮播图信息详细
export function getCarousel(id) {
  return request({
    url: '/carousel/carousel/' + id,
    method: 'get'
  })
}

// 新增轮播图信息
export function addCarousel(data) {
  return request({
    url: '/carousel/carousel',
    method: 'post',
    data: data
  })
}

// 修改轮播图信息
export function updateCarousel(data) {
  return request({
    url: '/carousel/carousel',
    method: 'put',
    data: data
  })
}

// 删除轮播图信息
export function delCarousel(id) {
  return request({
    url: '/carousel/carousel/' + id,
    method: 'delete'
  })
}
