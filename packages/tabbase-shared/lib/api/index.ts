import axios from 'axios'

const fetchSpaces = async () => {
  try {
    const response = await axios.get('/api/spaces')
    return response.data
  } catch (error) {
    console.error('Error fetching spaces:', error)
    throw error
  }
}

const fetchSpace = async (id: string) => {
  try {
    const response = await axios.get(`/api/spaces/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching space:', error)
    throw error
  }
}

const updateSpace = async (id: string, data: any) => {
  try {
    const response = await axios.put(`/api/spaces/${id}`, data)
    return response.data
  } catch (error) {
    console.error('Error updating space:', error)
    throw error
  }
}

const api = {
  fetchSpace,
  fetchSpaces,
  updateSpace,
}

export default api
