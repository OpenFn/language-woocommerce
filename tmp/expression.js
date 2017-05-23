postData({
  url: "https://requestb.in/1o25t8p1",
  "body": function(state) {
        return {
          "field_1": "some_data",
          "field_2": "some_more_data",
          "peopleCallMe": state.data.name
        }

  },
  headers: {
      "Authorization": "AUTH_KEY",
      "Content-Type": "application/json"
  }
})
