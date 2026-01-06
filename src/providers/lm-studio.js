const axios = require('axios')

const listModels = async ({ baseURL }) => {
  try {
    const apiResult = await axios({
      data: {},
      method: 'get',
      url: `${baseURL}/v1/models`
    })

    return apiResult.data.data
  } catch (err) {
    throw new Error(err?.response?.data?.error || err.message)
  }
}

module.exports = {
  listModels
}
