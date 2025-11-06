import axios from 'axios'

const API_URL = '/api/projects'

const projectService = {
  getProjects: async (params = {}) => {
    return await axios.get(API_URL, { params })
  },

  getProjectById: async (id) => {
    return await axios.get(`${API_URL}/${id}`)
  },

  getCategories: async () => {
    return await axios.get('/api/categories')
  },
}

export default projectService

