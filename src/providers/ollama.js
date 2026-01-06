const axios = require('axios')

const listModels = async ({ baseURL }) => {
  try {
    const apiResult = await axios({
      data: {},
      method: 'get',
      url: `${baseURL}/api/tags`
    })

    return apiResult.data.models
  } catch (err) {
    throw new Error(err?.response?.data?.error || err.message)
  }
}

module.exports = {
  listModels
}
