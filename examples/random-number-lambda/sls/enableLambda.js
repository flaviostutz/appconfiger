module.exports = {
  generate: function(serverless) {
    const flags = {
      flags: {
        enableLambda: {
          attributes: {
            maxValue: {
              constraints: {
                maximum: 999999,
                minimum: 10,
                required: true,
                type: "number"
              }
            },
            minValue: {
              constraints: {
                maximum: 999999,
                minimum: 0,
                required: true,
                type: "number"
              }
            }
          },
          description: "Enable Lambda for number generation along with min and max value for tweaking random number generation",
          name: "Enable Lambda for number generation"
        }
      },
      values: {
        enableLambda: {
          enabled: (serverless.options.stage!=='prd'),
          maxValue: 400000,
          minValue: 300000
        }
      },
      version: "1"
    }
    return JSON.stringify(flags);
  }
}
