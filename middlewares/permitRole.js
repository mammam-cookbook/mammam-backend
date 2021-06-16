module.exports = (...permittedRoles) => {
    return (request, response, next) => {
      const { user } = request
      console.log({ user })
      if (user && permittedRoles.includes(user.role)) {
        next(); // role is allowed, so continue on the next middleware
      } else {
        response.status(403).json({message: "Forbidden"}); // user is forbidden
      }
    }
  }